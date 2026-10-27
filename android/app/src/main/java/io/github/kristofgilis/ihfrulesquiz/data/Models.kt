package io.github.kristofgilis.ihfrulesquiz.data

data class Rule(val id: String, val number: String, val name: String)
data class Answer(val id: String, val number: String, val phrase: String, val isCorrect: Boolean)
data class Question(
    val id: String,
    val number: String,
    val ruleId: String,
    val phrase: String,
    val references: List<String>,
    val answers: List<Answer>,
)
data class ScoringConfiguration(
    val correct: Int,
    val incorrect: Int,
    val notAnswered: Int,
    val negativeScore: Boolean,
    val penalizeGuessingStrategy: Boolean,
)
data class QuizScore(val points: Int, val total: Int, val wrongQuestionIds: List<String>) {
    val percentage: Double get() = if (total == 0) 0.0 else points * 100.0 / total
}

object Scorer {
    fun calculate(questions: List<Question>, selections: Map<String, Set<String>>, config: ScoringConfiguration): QuizScore {
        var points = 0
        var total = 0
        val wrong = mutableListOf<String>()
        for (question in questions) {
            val selected = selections[question.id].orEmpty()
            total += question.answers.count(Answer::isCorrect)
            var value = 0
            var mistake = false
            if (config.penalizeGuessingStrategy && question.answers.isNotEmpty() && question.answers.all { it.id in selected }) {
                mistake = true
            } else {
                for (answer in question.answers) {
                    when {
                        answer.isCorrect && answer.id in selected -> value += config.correct
                        answer.isCorrect -> { value += config.notAnswered; mistake = true }
                        answer.id in selected -> { value += config.incorrect; mistake = true }
                    }
                }
                if (!config.negativeScore) value = maxOf(0, value)
            }
            points += value
            if (mistake) wrong += question.id
        }
        return QuizScore(points, total, wrong)
    }
}
