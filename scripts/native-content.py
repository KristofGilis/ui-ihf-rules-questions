"""Build/verify the fully offline native content, using only the Python standard library.

Import a reviewed source revision with --source and --api. Normal builds use the
checked-in snapshot and never contact the content repository or a running API.
"""
import argparse
import contextlib
import hashlib
import json
import pathlib
import sqlite3
import subprocess
import sys
import tempfile
import unicodedata

ROOT = pathlib.Path(__file__).resolve().parents[1]
SNAPSHOT = ROOT / "native/content.json"
DATABASE = ROOT / "ios/App/App/Resources/content.sqlite"
LOCALES = {"en": "En", "nl": "Nl", "fr": "Fr", "srb": "Srb"}


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def read(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def revision(path):
    if subprocess.check_output(["git", "-c", "core.fsmonitor=false", "status", "--porcelain"], cwd=path, text=True).strip():
        raise ValueError(f"Content inputs must be committed: {path}")
    return subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=path, text=True).strip()


def flatten(value, prefix=""):
    result = {}
    for key, child in value.items():
        full = f"{prefix}.{key}" if prefix else key
        result.update(flatten(child, full) if isinstance(child, dict) else {full: child})
    return result


def normalize(text):
    return "".join(c for c in unicodedata.normalize("NFD", text.lower()) if not unicodedata.combining(c))


def import_source(source, api):
    additions = read(ROOT / "native/strings.json")
    config = read(api / "IHF.Rules.Questions.Api/appsettings.json")["ScoreConfiguration"]
    pack = {"schemaVersion": 1, "sourceRevision": revision(source),
            "scoringRevision": revision(api), "scoring": config, "locales": {}}
    for locale, directory in LOCALES.items():
        folder = source / "rules" / directory
        rules = []
        questions = []
        for file in sorted(folder.glob("Rule*.json")):
            rule = read(file)
            rule_id = str(rule["RuleNumber"])
            rules.append({"id": rule_id, "number": rule_id, "name": rule["Name"]})
            for question in rule["Questions"]:
                number = str(question["QuestionNumber"])
                questions.append({"id": number, "number": number, "ruleId": rule_id,
                    "phrase": question["Phrase"], "references": question.get("RuleReferences", []),
                    "answers": [{"id": f"{number}/{answer['AnswerNumber']}",
                                 "number": str(answer["AnswerNumber"]), "phrase": answer["Phrase"],
                                 "isCorrect": answer["Correct"]} for answer in question["Answers"]]})
        strings = flatten(read(ROOT / f"public/i18n/{locale}.json"))
        strings.update(additions[locale])
        pack["locales"][locale] = {"edition": read(folder / "Version.json")["Version"],
                                    "strings": strings, "rules": rules, "questions": questions}
    validate(pack)
    SNAPSHOT.parent.mkdir(parents=True, exist_ok=True)
    SNAPSHOT.write_text(canonical(pack) + "\n", encoding="utf-8")
    return pack


def validate(pack):
    assert pack["schemaVersion"] == 1, "Unsupported content format"
    assert set(pack["locales"]) == set(LOCALES), "Missing/extra locales"
    assert len(pack["sourceRevision"]) == len(pack["scoringRevision"]) == 40
    assert set(pack["scoring"]) == {"Correct", "InCorrect", "NotAnswered", "NegativeScore", "PenalizeGuessingStrategy"}
    expected_strings = None
    for locale, data in pack["locales"].items():
        assert data["edition"].strip()
        assert len(data["questions"]) >= 30, f"Too few questions: {locale}"
        rule_ids = [rule["id"] for rule in data["rules"]]
        question_ids = [question["id"] for question in data["questions"]]
        assert len(rule_ids) == len(set(rule_ids)), f"Duplicate rules: {locale}"
        assert len(question_ids) == len(set(question_ids)), f"Duplicate questions: {locale}"
        native_strings = {key for key in data["strings"] if key.startswith("native.")}
        if expected_strings is None:
            expected_strings = native_strings
        assert native_strings == expected_strings, f"Missing native translations: {locale}"
        assert all(isinstance(v, str) and v.strip() for k, v in data["strings"].items() if k.startswith("native."))
        for question in data["questions"]:
            assert question["ruleId"] in rule_ids
            assert question["phrase"].strip(), f"Empty question: {locale}/{question['id']}"
            answers = question["answers"]
            assert len(answers) >= 2 and any(a["isCorrect"] for a in answers)
            assert len({a["id"] for a in answers}) == len(answers)
            assert all(a["phrase"].strip() and type(a["isCorrect"]) is bool for a in answers)
            assert isinstance(question["references"], list)


def make_database(pack, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    documents = {}
    for data in pack["locales"].values():
        for question in data["questions"]:
            documents.setdefault(question["id"], []).extend(
                [question["number"], question["phrase"]] + [a["phrase"] for a in question["answers"]])
    metadata = {k: v for k, v in pack.items() if k != "locales"}
    metadata["contentHash"] = hashlib.sha256(canonical(pack).encode()).hexdigest()
    metadata["locales"] = {locale: {"edition": data["edition"], "strings": data["strings"]}
                           for locale, data in pack["locales"].items()}
    with contextlib.closing(sqlite3.connect(path)) as db, db:
        db.executescript("""
            PRAGMA user_version=1;
            CREATE TABLE metadata (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
            CREATE TABLE rules (locale TEXT NOT NULL, id TEXT NOT NULL, position INTEGER NOT NULL,
                payload TEXT NOT NULL, PRIMARY KEY(locale,id));
            CREATE TABLE questions (locale TEXT NOT NULL, id TEXT NOT NULL, ruleId TEXT NOT NULL,
                position INTEGER NOT NULL, payload TEXT NOT NULL, searchText TEXT NOT NULL,
                PRIMARY KEY(locale,id));
            CREATE INDEX questions_rule ON questions(locale,ruleId,position);
        """)
        db.execute("INSERT INTO metadata VALUES ('manifest', ?)", (canonical(metadata),))
        for locale, data in pack["locales"].items():
            db.executemany("INSERT INTO rules VALUES (?,?,?,?)",
                           [(locale, r["id"], i, canonical(r)) for i, r in enumerate(data["rules"])])
            db.executemany("INSERT INTO questions VALUES (?,?,?,?,?,?)",
                           [(locale, q["id"], q["ruleId"], i, canonical(q), normalize(" ".join(documents[q["id"]])))
                            for i, q in enumerate(data["questions"])])
        assert db.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
    return metadata


def verify_database(pack):
    with contextlib.closing(sqlite3.connect(f"file:{DATABASE.as_posix()}?mode=ro", uri=True)) as db:
        assert db.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
        metadata = json.loads(db.execute("SELECT value FROM metadata WHERE key='manifest'").fetchone()[0])
        assert metadata["contentHash"] == hashlib.sha256(canonical(pack).encode()).hexdigest(), "Rebuild stale bundled database"
        for locale, data in pack["locales"].items():
            for table in ("rules", "questions"):
                actual = [json.loads(row[0]) for row in db.execute(f"SELECT payload FROM {table} WHERE locale=? ORDER BY position", (locale,))]
                assert actual == data[table], f"Bundled {table} differ for {locale}"
    return metadata


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=pathlib.Path)
    parser.add_argument("--api", type=pathlib.Path)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    if bool(args.source) != bool(args.api):
        parser.error("--source and --api must be supplied together")
    pack = import_source(args.source.resolve(), args.api.resolve()) if args.source else read(SNAPSHOT)
    validate(pack)
    if args.check:
        metadata = verify_database(pack)
    else:
        with tempfile.TemporaryDirectory(dir=ROOT / "native") as temporary:
            staged = pathlib.Path(temporary) / "content.sqlite"
            metadata = make_database(pack, staged)
            DATABASE.parent.mkdir(parents=True, exist_ok=True)
            staged.replace(DATABASE)
    print(json.dumps({"contentHash": metadata["contentHash"], "locales": {
        code: {"rules": len(data["rules"]), "questions": len(data["questions"]), "edition": data["edition"]}
        for code, data in pack["locales"].items()}}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
