package io.github.kristofgilis.ihfrulesquiz.data

import androidx.core.content.edit
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import org.json.JSONObject
import java.io.File

class ContentRepository(context: Context) {
    private val database: SQLiteDatabase
    val manifest: JSONObject
    val contentHash: String

    init {
        val dbFile = File(context.filesDir, "content.sqlite")
        val bundledHash = context.assets.open("content-hash.txt").bufferedReader().use { it.readText().trim() }
        val preferences = context.getSharedPreferences("native-app", Context.MODE_PRIVATE)
        if (!dbFile.exists() || preferences.getString("contentHash", null) != bundledHash) {
            val temporary = File(context.filesDir, "content.sqlite.tmp")
            context.assets.open("content.sqlite").use { input -> temporary.outputStream().use { output -> input.copyTo(output) } }
            check(temporary.length() > 0) { "Bundled learning database is empty" }
            if (!temporary.renameTo(dbFile)) {
                dbFile.delete()
                check(temporary.renameTo(dbFile)) { "Could not install the bundled content database" }
            }
            temporary.delete()
            preferences.edit { putString("contentHash", bundledHash) }
        }
        database = SQLiteDatabase.openDatabase(dbFile.path, null, SQLiteDatabase.OPEN_READONLY)
        val manifestJson = database.rawQuery("SELECT value FROM metadata WHERE key = ?", arrayOf("manifest")).use { cursor ->
            check(cursor.moveToFirst()) { "Bundled content manifest is missing" }
            cursor.getString(0)
        }
        manifest = JSONObject(manifestJson)
        contentHash = manifest.getString("contentHash")
        check(contentHash == bundledHash) { "Bundled content hash does not match the generated manifest" }
        check(manifest.getInt("schemaVersion") == 1)
        check(manifest.getJSONObject("locales").keys().asSequence().toSet() == setOf("en", "nl", "fr", "srb"))
    }

    fun rules(locale: String): List<Rule> = rows("rules", locale).map { json ->
        Rule(json.getString("id"), json.getString("number"), json.getString("name"))
    }

    fun questions(locale: String, ruleId: String? = null): List<Question> {
        val sql = if (ruleId == null) "SELECT payload FROM questions WHERE locale = ? ORDER BY position"
        else "SELECT payload FROM questions WHERE locale = ? AND ruleId = ? ORDER BY position"
        val args = if (ruleId == null) arrayOf(locale) else arrayOf(locale, ruleId)
        return database.rawQuery(sql, args).use { cursor ->
            buildList { while (cursor.moveToNext()) add(parseQuestion(JSONObject(cursor.getString(0)))) }
        }
    }

    fun searchDocuments(locale: String): List<Pair<String, String>> = database.rawQuery(
        "SELECT id, searchText FROM questions WHERE locale = ? ORDER BY position", arrayOf(locale),
    ).use { cursor -> buildList { while (cursor.moveToNext()) add(cursor.getString(0) to cursor.getString(1)) } }

    fun scoring(): ScoringConfiguration = manifest.getJSONObject("scoring").let {
        ScoringConfiguration(it.getInt("Correct"), it.getInt("InCorrect"), it.getInt("NotAnswered"),
            it.getBoolean("NegativeScore"), it.getBoolean("PenalizeGuessingStrategy"))
    }

    fun edition(locale: String): String = manifest.getJSONObject("locales").getJSONObject(locale).getString("edition")

    fun strings(context: Context, locale: String): Map<String, String> {
        val native = JSONObject(context.assets.open("native-strings.json").bufferedReader().use { it.readText() })
        val local = native.optJSONObject(locale) ?: native.getJSONObject("en")
        val english = native.getJSONObject("en")
        return buildMap {
            val contentStrings = manifest.getJSONObject("locales").getJSONObject(locale).getJSONObject("strings")
            val contentKeys = contentStrings.keys()
            while (contentKeys.hasNext()) {
                val key = contentKeys.next()
                put(key, contentStrings.getString(key))
            }
            val keys = english.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                put(key, local.optString(key, english.getString(key)))
            }
            val information = JSONObject(context.assets.open("app-information.json").bufferedReader().use { it.readText() })
            val localizedInformation = information.optJSONObject(locale) ?: information.getJSONObject("en")
            val informationKeys = localizedInformation.keys()
            while (informationKeys.hasNext()) {
                val key = informationKeys.next()
                put(key, localizedInformation.getString(key))
            }
        }
    }

    private fun rows(table: String, locale: String): List<JSONObject> = database.rawQuery(
        "SELECT payload FROM $table WHERE locale = ? ORDER BY position", arrayOf(locale),
    ).use { cursor -> buildList { while (cursor.moveToNext()) add(JSONObject(cursor.getString(0))) } }

    private fun parseQuestion(json: JSONObject): Question {
        val answersJson = json.getJSONArray("answers")
        val answers = (0 until answersJson.length()).map { index -> answersJson.getJSONObject(index).let {
            Answer(it.getString("id"), it.getString("number"), it.getString("phrase"), it.getBoolean("isCorrect"))
        } }
        val referencesJson = json.getJSONArray("references")
        val references = (0 until referencesJson.length()).map(referencesJson::getString)
        return Question(json.getString("id"), json.getString("number"), json.getString("ruleId"),
            json.getString("phrase"), references, answers)
    }
}
