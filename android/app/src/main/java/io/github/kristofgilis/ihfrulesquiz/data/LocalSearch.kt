package io.github.kristofgilis.ihfrulesquiz.data

import java.text.Normalizer
import java.util.Locale

object LocalSearch {
    fun normalize(value: String): String = Normalizer.normalize(value.lowercase(Locale.ROOT), Normalizer.Form.NFD)
        .filterNot { Character.getType(it) == Character.NON_SPACING_MARK.toInt() }

    fun matchingIds(query: String, documents: List<Pair<String, String>>): Set<String> {
        val identifier = normalize(query.trim())
        documents.firstOrNull { normalize(it.first) == identifier }?.let { return setOf(it.first) }
        val terms = searchTokens(query)
        if (terms.isEmpty()) return emptySet()
        val strict = documents.filter { (_, text) -> terms.all { text.contains(it) } }
        if (strict.isNotEmpty()) return strict.mapTo(mutableSetOf()) { it.first }
        return documents.filter { (_, text) ->
            val words = searchTokens(text)
            terms.all { term -> words.any { word ->
                if (word.contains(term)) true
                else if (term.length < 3) false
                else editDistanceWithin(term, word, if (term.length <= 4) 1 else 2)
            } }
        }.mapTo(mutableSetOf()) { it.first }
    }

    private fun searchTokens(value: String): List<String> = normalize(value)
        .split(Regex("[^\\p{L}\\p{N}.:]+"))
        .map { it.trim('.', ':') }
        .filter(String::isNotBlank)

    private fun editDistanceWithin(left: String, right: String, limit: Int): Boolean {
        if (kotlin.math.abs(left.length - right.length) > limit) return false
        var previous = IntArray(right.length + 1) { it }
        for (i in left.indices) {
            val current = IntArray(right.length + 1)
            current[0] = i + 1
            for (j in right.indices) current[j + 1] = minOf(
                current[j] + 1,
                previous[j + 1] + 1,
                previous[j] + if (left[i] == right[j]) 0 else 1,
            )
            if (current.minOrNull()!! > limit) return false
            previous = current
        }
        return previous[right.length] <= limit
    }
}
