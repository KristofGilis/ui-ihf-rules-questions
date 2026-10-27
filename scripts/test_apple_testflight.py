"""Tests use synthetic keys and fake Apple responses, never release credentials."""
import base64
import importlib.util
import json
import pathlib
import shutil
import subprocess
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("apple_testflight", pathlib.Path(__file__).with_name("apple-testflight.py"))
apple = importlib.util.module_from_spec(spec)
spec.loader.exec_module(apple)


class FakeAPI:
    def __init__(self, state="VALID", internal=True):
        self.build = {"id": "build-4", "attributes": {"version": "4", "processingState": state,
                      "expired": False, "usesNonExemptEncryption": False}}
        self.internal = internal
        self.members = []
        self.mutations = []

    def list(self, path, parameters=None):
        if path == "/v1/builds":
            assert parameters["filter[version]"] == "4"
            assert parameters["filter[preReleaseVersion.version]"] == "1.0"
            return [self.build]
        if path == "/v1/betaGroups":
            return [{"id": "internal", "attributes": {"name": "IHF Rules Quiz Internal", "isInternalGroup": self.internal}}]
        return self.members

    def request(self, method, path, data=None):
        if method == "POST":
            self.mutations.append((method, path, data))
            self.members = data["data"]
            return {}
        return {"data": {"attributes": {"internalBuildState": "IN_BETA_TESTING"}}}


class TestFlightTests(unittest.TestCase):
    def test_only_requested_existing_internal_group_receives_build(self):
        api = FakeAPI()
        build = apple.wait_for_build(api, "app", "1.0", "4", 0)
        apple.enable_internal(api, "app", build, "IHF Rules Quiz Internal")
        apple.enable_internal(api, "app", build, "IHF Rules Quiz Internal")
        self.assertEqual(api.mutations, [("POST", "/v1/betaGroups/internal/relationships/builds",
                                          {"data": [{"type": "builds", "id": "build-4"}]})])

    def test_failed_processing_and_external_groups_are_rejected(self):
        with self.assertRaises(RuntimeError):
            apple.wait_for_build(FakeAPI(state="INVALID"), "app", "1.0", "4", 0)
        api = FakeAPI(internal=False)
        with self.assertRaises(RuntimeError):
            apple.enable_internal(api, "app", api.build, "IHF Rules Quiz Internal")
        self.assertEqual(api.mutations, [])

    def test_unresolved_compliance_is_not_changed(self):
        api = FakeAPI()
        api.build["attributes"]["usesNonExemptEncryption"] = None
        with self.assertRaises(RuntimeError):
            apple.enable_internal(api, "app", api.build, "IHF Rules Quiz Internal")
        self.assertEqual(api.mutations, [])

    def test_pending_processing_times_out_without_distribution(self):
        api = FakeAPI(state="PROCESSING")
        with self.assertRaises(RuntimeError):
            apple.wait_for_build(api, "app", "1.0", "4", 0)
        self.assertEqual(api.mutations, [])

    def test_api_refuses_non_apple_hosts_before_signing(self):
        api = object.__new__(apple.AppleAPI)
        with self.assertRaises(ValueError):
            api.request("GET", "https://example.com/v1/builds")

    @unittest.skipUnless(shutil.which("openssl"), "OpenSSL is required on the release runner")
    def test_jwt_signature_verifies_and_has_short_apple_audience(self):
        root = pathlib.Path(__file__).resolve().parents[1] / "native"
        with tempfile.TemporaryDirectory(dir=root) as temporary:
            folder = pathlib.Path(temporary)
            key, public, signature = folder / "test.pem", folder / "public.pem", folder / "signature.der"
            subprocess.run(["openssl", "ecparam", "-name", "prime256v1", "-genkey", "-noout", "-out", str(key)], check=True, capture_output=True)
            subprocess.run(["openssl", "pkey", "-in", str(key), "-pubout", "-out", str(public)], check=True, capture_output=True)
            jwt = apple.token("TESTKEY", "TESTISSUER", key, now=1000)
            header, payload, raw = jwt.split(".")
            decode = lambda value: base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))
            self.assertEqual(json.loads(decode(header))["alg"], "ES256")
            claims = json.loads(decode(payload))
            self.assertEqual(claims["aud"], "appstoreconnect-v1")
            self.assertEqual(claims["exp"] - claims["iat"], 130)
            raw = decode(raw)
            self.assertEqual(len(raw), 64)

            def integer(data):
                value = data.lstrip(b"\x00") or b"\x00"
                if value[0] & 128:
                    value = b"\x00" + value
                return b"\x02" + bytes([len(value)]) + value

            sequence = integer(raw[:32]) + integer(raw[32:])
            signature.write_bytes(b"\x30" + bytes([len(sequence)]) + sequence)
            verified = subprocess.run(["openssl", "dgst", "-sha256", "-verify", str(public), "-signature", str(signature)],
                                      input=f"{header}.{payload}".encode(), capture_output=True)
            self.assertEqual(verified.returncode, 0)


if __name__ == "__main__":
    unittest.main()
