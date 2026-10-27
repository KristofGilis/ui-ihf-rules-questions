"""Copy the validated, shared offline content into the Android app assets."""

import hashlib
import json
import pathlib
import shutil
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
ASSETS = ROOT / "android/app/src/main/assets"


def main():
    subprocess.run([sys.executable, str(ROOT / "scripts/native-content.py"), "--check"], check=True)
    pack = json.loads((ROOT / "native/content.json").read_text(encoding="utf-8"))
    database = ROOT / "ios/App/App/OfflineContent/content.sqlite"
    if not database.is_file() or database.stat().st_size == 0:
        raise SystemExit("The validated iOS SQLite content database is missing")
    ASSETS.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(database, ASSETS / "content.sqlite")
    shutil.copyfile(ROOT / "native/strings.json", ASSETS / "native-strings.json")
    information_path = ROOT / "ios/App/App/OfflineContent/AppInformation.json"
    information = json.loads(information_path.read_text(encoding="utf-8"))
    information["en"]["info.privacy.collection"] = information["en"]["info.privacy.collection"].replace(
        "Apple distributes the app and updates and may process App Store or TestFlight information",
        "Google Play distributes the app and updates and may process Google Play information",
    )
    information["en"]["info.support.offline"] = information["en"]["info.support.offline"].replace(
        "arrive through the App Store", "arrive through Google Play"
    )
    information["nl"]["info.privacy.collection"] = information["nl"]["info.privacy.collection"].replace(
        "Apple verzorgt de distributie en updates en kan App Store- of TestFlight-gegevens verwerken",
        "Google Play verzorgt de distributie en updates en kan Google Play-gegevens verwerken",
    )
    information["nl"]["info.support.offline"] = information["nl"]["info.support.offline"].replace(
        "komen via de App Store", "komen via Google Play"
    )
    information["fr"]["info.privacy.collection"] = information["fr"]["info.privacy.collection"].replace(
        "Apple distribue l’application et ses mises à jour et peut traiter des informations App Store ou TestFlight",
        "Google Play distribue l’application et ses mises à jour et peut traiter des informations Google Play",
    )
    information["fr"]["info.support.offline"] = information["fr"]["info.support.offline"].replace(
        "arrivent via l’App Store", "arrivent via Google Play"
    )
    information["srb"]["info.privacy.collection"] = information["srb"]["info.privacy.collection"].replace(
        "Apple дистрибуира апликацију и ажурирања и може обрађивати податке App Store-а или TestFlight-а",
        "Google Play дистрибуира апликацију и ажурирања и може обрађивати податке Google Play-а",
    )
    information["srb"]["info.support.offline"] = information["srb"]["info.support.offline"].replace(
        "преко App Store-а", "преко Google Play-а"
    )
    backup_terms = {"en": "backup", "nl": "back-up", "fr": "sauvegarde", "srb": "копије"}
    for locale, term in backup_terms.items():
        sentences = information[locale]["info.privacy.retention"].split(". ")
        information[locale]["info.privacy.retention"] = ". ".join(
            sentence for sentence in sentences if term not in sentence.casefold()
        )
    if set(information) != set(pack["locales"]):
        raise SystemExit("Native Privacy/Support translations do not match the offline content locales")
    for locale, strings in information.items():
        store_copy = strings["info.privacy.collection"] + strings["info.support.offline"]
        if any(marker in store_copy for marker in ("Apple", "App Store", "TestFlight")):
            raise SystemExit(f"iOS-specific store wording remains in Android Privacy/Support copy for {locale}")
    (ASSETS / "app-information.json").write_text(
        json.dumps(information, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    branding = ROOT / "ios/App/App/Assets.xcassets"
    resources = ROOT / "android/app/src/main/res/drawable-nodpi"
    resources.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(branding / "AppIcon.appiconset/AppIcon-512@2x.png", resources / "app_icon.png")
    shutil.copyfile(branding / "BrandMark.imageset/BrandMark@3x.png", resources / "brand_mark.png")
    shutil.copyfile(branding / "LaunchMark.imageset/LaunchMark@3x.png", resources / "launcher_mark.png")
    digest = hashlib.sha256(json.dumps(pack, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
    (ASSETS / "content-hash.txt").write_text(digest + "\n", encoding="ascii")
    print(f"Prepared {database.stat().st_size} bytes of offline content ({digest})")


if __name__ == "__main__":
    main()
