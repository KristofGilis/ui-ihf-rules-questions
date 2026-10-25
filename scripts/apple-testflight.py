"""Check an uploaded build and optionally enable an existing internal TestFlight group.

Uses the release job's API key and system OpenSSL. Never prints tokens or keys.
Does not create groups/testers, change compliance answers, or submit for review.
"""
import argparse
import base64
import json
import os
import pathlib
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

BASE = "https://api.appstoreconnect.apple.com"


def encode(data):
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def read_der(data, offset):
    tag, length = data[offset:offset + 2]
    offset += 2
    if length & 128:
        count = length & 127
        length = int.from_bytes(data[offset:offset + count], "big")
        offset += count
    end = offset + length
    if end > len(data):
        raise ValueError("Truncated OpenSSL signature")
    return tag, data[offset:end], end


def raw_signature(signature):
    tag, sequence, end = read_der(signature, 0)
    if tag != 0x30 or end != len(signature):
        raise ValueError("Invalid OpenSSL signature sequence")
    tag_r, r, offset = read_der(sequence, 0)
    tag_s, s, end = read_der(sequence, offset)
    if tag_r != 2 or tag_s != 2 or end != len(sequence):
        raise ValueError("Invalid OpenSSL signature integers")
    return int.from_bytes(r, "big").to_bytes(32, "big") + int.from_bytes(s, "big").to_bytes(32, "big")


def token(key_id, issuer, private_key, now=None):
    now = int(time.time()) if now is None else now
    header = encode(json.dumps({"alg": "ES256", "kid": key_id, "typ": "JWT"}).encode())
    payload = encode(json.dumps({"iss": issuer, "iat": now - 10, "exp": now + 120,
                                "aud": "appstoreconnect-v1"}).encode())
    message = f"{header}.{payload}"
    result = subprocess.run(["openssl", "dgst", "-sha256", "-sign", str(private_key)],
                            input=message.encode(), capture_output=True, check=True)
    return f"{message}.{encode(raw_signature(result.stdout))}"


class AppleAPI:
    def __init__(self, private_key):
        self.key_id = os.environ["ASC_KEY_ID"]
        self.issuer = os.environ["ASC_ISSUER_ID"]
        self.private_key = private_key

    def request(self, method, path, data=None):
        url = path if path.startswith("https://") else BASE + path
        parsed = urllib.parse.urlparse(url)
        if parsed.scheme != "https" or parsed.netloc != "api.appstoreconnect.apple.com":
            raise ValueError("Unexpected App Store Connect API host")
        body = json.dumps(data).encode() if data is not None else None
        authorization = token(self.key_id, self.issuer, self.private_key)
        request = urllib.request.Request(url, data=body, method=method, headers={
            "Authorization": f"Bearer {authorization}", "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                content = response.read()
                return json.loads(content) if content else {}
        except urllib.error.HTTPError as error:
            details = json.loads(error.read() or b"{}").get("errors", [])
            message = "; ".join(e.get("detail", e.get("title", "API error")) for e in details)
            raise RuntimeError(f"Apple API {method} {parsed.path}: HTTP {error.code}: {message}") from None

    def list(self, path, parameters=None):
        next_page = path + ("?" + urllib.parse.urlencode(parameters) if parameters else "")
        values = []
        while next_page:
            response = self.request("GET", next_page)
            values.extend(response.get("data", []))
            next_page = response.get("links", {}).get("next")
        return values


def wait_for_build(api, app_id, version, build_number, timeout, sleep=time.sleep):
    deadline = time.monotonic() + timeout
    while True:
        builds = api.list("/v1/builds", {"filter[app]": app_id, "filter[version]": build_number,
                         "filter[preReleaseVersion.version]": version,
                         "filter[preReleaseVersion.platform]": "IOS", "limit": 200})
        if len(builds) > 1:
            raise RuntimeError("More than one matching build; refusing an ambiguous distribution")
        build = builds[0] if builds else None
        state = build["attributes"].get("processingState") if build else "NOT_VISIBLE"
        print(f"Apple processing: {state}", flush=True)
        if state in ("INVALID", "FAILED"):
            raise RuntimeError("Apple rejected build processing; inspect the build before another upload")
        if state == "VALID":
            if build["attributes"].get("expired"):
                raise RuntimeError("The requested build has expired")
            return build
        if time.monotonic() >= deadline:
            raise RuntimeError("Apple processing is still pending; rerun with upload_build disabled")
        sleep(30)


def enable_internal(api, app_id, build, group_name):
    if build["attributes"].get("usesNonExemptEncryption") is not False:
        raise RuntimeError("Export compliance must be resolved before enabling testing; no declaration was changed")
    groups = api.list("/v1/betaGroups", {"filter[app]": app_id, "limit": 200})
    matching = [group for group in groups if group["attributes"].get("name") == group_name
                and group["attributes"].get("isInternalGroup") is True]
    if len(matching) != 1:
        raise RuntimeError("Expected exactly one existing internal group with the requested name")
    group_id = matching[0]["id"]
    relationship = f"/v1/betaGroups/{group_id}/relationships/builds"
    existing = api.list(relationship)
    if not any(item["id"] == build["id"] for item in existing):
        api.request("POST", relationship, {"data": [{"type": "builds", "id": build["id"]}]})
    verified = api.list(relationship)
    if not any(item["id"] == build["id"] for item in verified):
        raise RuntimeError("Internal group assignment could not be verified")
    detail = api.request("GET", f"/v1/builds/{build['id']}/buildBetaDetail").get("data", {}).get("attributes", {})
    state = detail.get("internalBuildState")
    print(json.dumps({"buildId": build["id"], "group": group_name, "internalBuildState": state}), flush=True)
    if state != "IN_BETA_TESTING":
        raise RuntimeError(f"Build is assigned but Apple internal state is {state}; testing is not yet confirmed")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--private-key", type=pathlib.Path, required=True)
    parser.add_argument("--app-id", required=True)
    parser.add_argument("--version", required=True)
    parser.add_argument("--build-number", required=True)
    parser.add_argument("--enable-internal-group")
    parser.add_argument("--wait-seconds", type=int, default=900)
    args = parser.parse_args()
    api = AppleAPI(args.private_key)
    build = wait_for_build(api, args.app_id, args.version, args.build_number, args.wait_seconds)
    print(json.dumps({"buildId": build["id"], "version": args.version,
                      "buildNumber": build["attributes"]["version"], "processingState": "VALID"}), flush=True)
    if args.enable_internal_group:
        enable_internal(api, args.app_id, build, args.enable_internal_group)


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, ValueError, KeyError, subprocess.CalledProcessError) as error:
        print(str(error), file=sys.stderr)
        raise SystemExit(1) from None
