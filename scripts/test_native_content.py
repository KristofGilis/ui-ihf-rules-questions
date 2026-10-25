"""Contract tests for data shipped to both native apps; no network or server needed."""
import copy
import importlib.util
import pathlib
import sqlite3
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("native_content", pathlib.Path(__file__).with_name("native-content.py"))
content = importlib.util.module_from_spec(spec)
spec.loader.exec_module(content)


class ContentTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pack = content.read(content.SNAPSHOT)

    def test_all_languages_include_complete_content(self):
        content.validate(self.pack)
        for locale, data in self.pack["locales"].items():
            self.assertEqual(len(data["rules"]), 19, locale)
            self.assertEqual(len(data["questions"]), 432, locale)

    def test_rejects_duplicate_and_unanswerable_questions(self):
        broken = copy.deepcopy(self.pack)
        broken["locales"]["en"]["questions"].append(broken["locales"]["en"]["questions"][0])
        with self.assertRaises(AssertionError):
            content.validate(broken)
        broken = copy.deepcopy(self.pack)
        for answer in broken["locales"]["en"]["questions"][0]["answers"]:
            answer["isCorrect"] = False
        with self.assertRaises(AssertionError):
            content.validate(broken)

    def test_database_matches_reviewed_snapshot(self):
        content.verify_database(self.pack)

    def test_export_is_repeatable_and_search_contains_all_languages(self):
        with tempfile.TemporaryDirectory(dir=content.ROOT / "native") as directory:
            path = pathlib.Path(directory)
            first = content.make_database(self.pack, path / "first.sqlite")
            second = content.make_database(self.pack, path / "second.sqlite")
            self.assertEqual(first, second)
            self.assertEqual((path / "first.sqlite").read_bytes(), (path / "second.sqlite").read_bytes())
            with content.contextlib.closing(sqlite3.connect(path / "first.sqlite")) as database:
                text = database.execute("SELECT searchText FROM questions WHERE locale='en' AND id='1.1'").fetchone()[0]
                self.assertIn("speelveld", text)
                self.assertIn("court", text)


if __name__ == "__main__":
    unittest.main()
