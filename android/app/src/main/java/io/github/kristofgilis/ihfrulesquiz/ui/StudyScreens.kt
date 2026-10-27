package io.github.kristofgilis.ihfrulesquiz.ui

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.*
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.selection.toggleable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.kristofgilis.ihfrulesquiz.BuildConfig
import io.github.kristofgilis.ihfrulesquiz.data.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Locale

@Composable
internal fun RulesScreen(app: AppContent, onRule: (Rule) -> Unit, modifier: Modifier = Modifier) {
    LazyColumn(modifier.fillMaxSize(), contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(13.dp)) {
        item { SectionHeading(app.text("native.rules_title"), app.text("rules.description")) }
        itemsIndexed(app.rules, key = { _, rule -> rule.id }) { index, rule ->
            val accent = listOf(Brand.blue(), Brand.gold(), Brand.navy())[index % 3]
            PaperCard(Modifier.clickable { onRule(rule) }) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    Box(Modifier.size(52.dp).clip(RoundedCornerShape(17.dp)).background(accent.copy(alpha = .12f)), contentAlignment = Alignment.Center) {
                        Text(rule.number, fontSize = 20.sp, fontWeight = FontWeight.Black, color = accent)
                    }
                    Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(rule.name, fontSize = 17.sp, fontWeight = FontWeight.Bold)
                        Text(app.text("native.questions", mapOf("count" to app.questions.count { it.ruleId == rule.id }.toString())), fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    Icon(Icons.Default.ChevronRight, null, Modifier.size(18.dp), tint = accent)
                }
            }
        }
    }
}

@Composable
private fun EmptyStudyState(title: String, detail: String, modifier: Modifier = Modifier) {
    Column(modifier.fillMaxWidth().padding(horizontal = 25.dp, vertical = 42.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(17.dp)) {
        Box(Modifier.size(88.dp).rotate(-7f).clip(RoundedCornerShape(30.dp)).background(Brand.navy().copy(alpha = .10f)), contentAlignment = Alignment.Center) {
            Icon(Icons.Default.Search, null, Modifier.size(34.dp), tint = Brand.navy())
        }
        Text(title, fontSize = 22.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
        Text(detail, fontSize = 15.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, textAlign = TextAlign.Center)
    }
}

@Composable
internal fun SearchScreen(app: AppContent, query: String, onQuery: (String) -> Unit, onQuestion: (Question) -> Unit, modifier: Modifier = Modifier) {
    val matching by produceState<Pair<String, Set<String>>?>(initialValue = null, query, app.searchDocuments) {
        value = null
        if (query.isNotBlank()) delay(250)
        value = query to withContext(Dispatchers.Default) { LocalSearch.matchingIds(query, app.searchDocuments) }
    }
    val results = app.questions.filter { it.id in matching?.second.orEmpty() }
    Column(modifier.fillMaxSize()) {
        OutlinedTextField(query, onQuery, Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 10.dp),
            placeholder = { Text(app.text("search.placeholder")) }, leadingIcon = { Icon(Icons.Default.Search, null) }, singleLine = true, shape = RoundedCornerShape(18.dp))
        LazyColumn(Modifier.weight(1f), contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            item {
                when {
                    query.isBlank() -> {
                        EmptyStudyState(app.text("native.search_title"), app.text("native.search_hint"))
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(9.dp, Alignment.CenterHorizontally)) {
                            listOf("1.1", "2.1", "16.1").forEach { number -> TinyBadge(number, Modifier.clickable { onQuery(number) }, Brand.navy(), Icons.Default.Tag) }
                        }
                    }
                    matching == null -> Box(Modifier.fillMaxWidth().padding(40.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
                    results.isEmpty() -> EmptyStudyState(app.text("search.no_results"), app.text("native.search_hint"))
                    else -> TinyBadge(app.text("native.questions", mapOf("count" to results.size.toString())), icon = Icons.Default.Search)
                }
            }
            items(results, key = Question::id) { question ->
                PaperCard(Modifier.clickable { onQuestion(question) }) {
                    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            TinyBadge(question.number, color = Brand.navy(), icon = Icons.Default.Tag)
                            Icon(Icons.Default.NorthEast, null, tint = Brand.navy())
                        }
                        Text(question.phrase, fontSize = 17.sp, fontWeight = FontWeight.SemiBold, maxLines = 4, overflow = TextOverflow.Ellipsis)
                    }
                }
            }
        }
    }
}

@Composable
private fun QuestionHeader(question: Question, showNumber: Boolean = true, modifier: Modifier = Modifier) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(14.dp)) {
        if (showNumber) TinyBadge(question.number, color = Brand.navy(), icon = Icons.Default.Tag)
        Text(question.phrase, fontSize = 20.sp, lineHeight = 27.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun ReferenceLinks(app: AppContent, question: Question, onRule: (Rule) -> Unit) {
    if (question.references.isNotEmpty()) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.BookmarkBorder, null, Modifier.size(14.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                Text(question.references.joinToString(), fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            app.rules.firstOrNull { it.id == question.ruleId }?.let { rule ->
                TextButton(onClick = { onRule(rule) }, contentPadding = PaddingValues(0.dp)) { Text("${rule.number} · ${rule.name}", fontSize = 15.sp, fontWeight = FontWeight.SemiBold) }
            }
        }
    }
}

@Composable
private fun AnswerRow(app: AppContent, answer: Answer, selected: Boolean, revealed: Boolean = false, showNumber: Boolean = true, onClick: (() -> Unit)? = null) {
    val correct = revealed && answer.isCorrect
    val wrong = revealed && selected && !answer.isCorrect
    val accent = when { correct -> MaterialTheme.colorScheme.tertiary; wrong -> MaterialTheme.colorScheme.error; else -> Brand.blue() }
    val shape = RoundedCornerShape(21.dp)
    val active = selected || correct || wrong
    Row(Modifier.fillMaxWidth().clip(shape).background(if (active) accent.copy(alpha = .07f) else MaterialTheme.colorScheme.surface)
        .border(if (selected || correct) 2.dp else 1.dp, if (active) accent.copy(alpha = .85f) else MaterialTheme.colorScheme.onSurface.copy(alpha = .07f), shape)
        .then(if (onClick != null && !revealed) Modifier.toggleable(selected, role = Role.Checkbox, onValueChange = { onClick() }) else Modifier)
        .padding(15.dp), verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(13.dp)) {
        Box(Modifier.size(36.dp).clip(RoundedCornerShape(12.dp)).background(if (selected || correct) accent else MaterialTheme.colorScheme.background), contentAlignment = Alignment.Center) {
            if (selected || correct) Icon(if (wrong) Icons.Default.Close else Icons.Default.Check, null, Modifier.size(18.dp), tint = Color.White)
            else if (showNumber && !revealed) Text(answer.number.uppercase(), fontSize = 15.sp, fontWeight = FontWeight.ExtraBold, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        Text((if (showNumber && revealed) "${answer.number.uppercase()}. " else "") + answer.phrase, Modifier.weight(1f).padding(vertical = 6.dp), fontSize = 17.sp, lineHeight = 24.sp)
        if (correct) Icon(Icons.Default.Verified, app.text("native.correct_answer"), Modifier.padding(top = 8.dp).size(20.dp), tint = MaterialTheme.colorScheme.tertiary)
    }
}

@Composable
private fun ScoreSummary(app: AppContent, score: QuizScore, questionCount: Int? = null) {
    var appeared by remember(score) { mutableStateOf(false) }
    LaunchedEffect(score) { appeared = true }
    val fraction by animateFloatAsState(if (appeared) (score.percentage / 100).coerceIn(0.0, 1.0).toFloat() else 0f, tween(800), label = "score-ring")
    val ringSize = minOf(240f, 174f * LocalConfiguration.current.fontScale).dp
    val ringColor = if (score.percentage >= 50) Brand.blue() else Brand.gold()
    val track = MaterialTheme.colorScheme.background
    PaperCard {
        Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(22.dp)) {
            Box(Modifier.padding(top = 7.dp).size(ringSize), contentAlignment = Alignment.Center) {
                Canvas(Modifier.fillMaxSize()) {
                    val stroke = Stroke(13.dp.toPx(), cap = StrokeCap.Round)
                    drawCircle(track, style = stroke)
                    drawArc(ringColor, -90f, fraction * 360f, false, style = stroke)
                }
                Column(Modifier.padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(5.dp)) {
                    Icon(Icons.Default.EmojiEvents, null, tint = Brand.gold())
                    Text(String.format(Locale.ROOT, if (questionCount == null) "%.0f%%" else "%.2f%%", score.percentage), fontSize = (32f / maxOf(1f, LocalConfiguration.current.fontScale / 1.4f)).sp, fontWeight = FontWeight.Black, maxLines = 1, softWrap = false)
                    Text(app.text("score_overview.title"), fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            Text(app.text(if (score.percentage >= 75) "native.result_high" else "native.result_keep_going"), fontSize = 22.sp, fontWeight = FontWeight.ExtraBold, textAlign = TextAlign.Center)
            Text(app.text("native.score", mapOf("score" to score.points.toString(), "total" to score.total.toString())), fontSize = 15.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Row(horizontalArrangement = Arrangement.spacedBy(13.dp)) {
                ResultStat(app.text("quiz_results.correct"), questionCount?.minus(score.wrongQuestionIds.size) ?: score.points, MaterialTheme.colorScheme.tertiary, Modifier.weight(1f))
                ResultStat(app.text("quiz_results.wrong"), if (questionCount == null) score.total - score.points else score.wrongQuestionIds.size, Brand.gold(), Modifier.weight(1f))
            }
        }
    }
}

@Composable
private fun ResultStat(title: String, value: Int, color: Color, modifier: Modifier) {
    Column(modifier.clip(RoundedCornerShape(18.dp)).background(color.copy(alpha = .08f)).padding(vertical = 15.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(7.dp)) {
        Text(value.toString(), fontSize = 22.sp, fontWeight = FontWeight.ExtraBold, color = color)
        Text(title, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
internal fun PracticeScreen(app: AppContent, questions: List<Question>, selections: MutableMap<String, Set<String>>, revealed: MutableMap<String, Boolean>, score: QuizScore?,
    onScore: (QuizScore?) -> Unit, onSelect: (String, String) -> Unit, onReveal: (String) -> Unit, onReset: () -> Unit, modifier: Modifier = Modifier, onRule: (Rule) -> Unit = {}) {
    val listState = rememberLazyListState()
    var scoreRequest by remember { mutableIntStateOf(0) }
    val scope = rememberCoroutineScope()
    val showingAnswers = questions.any { revealed[it.id] == true }
    val wrongQuestions = questions.filter { it.id in score?.wrongQuestionIds.orEmpty() }
    LaunchedEffect(score, scoreRequest) { if (score != null) listState.animateScrollToItem(2) }
    Column(modifier.fillMaxSize()) {
        LazyColumn(state = listState, modifier = Modifier.weight(1f), contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(25.dp)) {
            item { SectionHeading(app.text("native.study_title"), app.text("native.questions", mapOf("count" to questions.size.toString()))) }
            item {
                PaperCard(tint = Brand.navy()) {
                    Column(verticalArrangement = Arrangement.spacedBy(13.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.AutoAwesome, null, tint = Brand.navy())
                            Text(app.text("native.study_mode"), Modifier.weight(1f).padding(start = 8.dp), fontSize = 17.sp, fontWeight = FontWeight.Bold)
                            TextButton(onReset) { Text(app.text("native.reset"), fontSize = 12.sp) }
                        }
                        Text(app.text("native.study_hint"), fontSize = 15.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        val all = questions.isNotEmpty() && questions.all { revealed[it.id] == true }
                        TextButton(onClick = { if (!all) { selections.clear(); onScore(null) }; questions.forEach { revealed[it.id] = !all } }, contentPadding = PaddingValues(0.dp)) {
                            Icon(if (all) Icons.Default.VisibilityOff else Icons.Default.Visibility, null, Modifier.size(18.dp)); Spacer(Modifier.width(8.dp))
                            Text(app.text(if (all) "native.hide_all" else "native.show_all"), fontSize = 15.sp)
                        }
                        if (showingAnswers) Text(app.text("native.reveal_warning"), fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
            if (score != null) item { ScoreSummary(app, score, questions.size) }
            if (wrongQuestions.isNotEmpty()) item {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                    items(wrongQuestions, key = Question::id) { question ->
                        TinyBadge(question.number, Modifier.clickable { scope.launch { listState.animateScrollToItem(questions.indexOf(question) + 2 + (if (score != null) 1 else 0) + 1) } }, MaterialTheme.colorScheme.error, Icons.Default.ArrowDownward)
                    }
                }
            }
            items(questions, key = Question::id) { question ->
                Column(verticalArrangement = Arrangement.spacedBy(13.dp)) {
                    Row(verticalAlignment = Alignment.Top) {
                        QuestionHeader(question, modifier = Modifier.weight(1f))
                        if (score != null) Icon(if (question.id in score.wrongQuestionIds) Icons.Default.Cancel else Icons.Default.CheckCircle, null, tint = if (question.id in score.wrongQuestionIds) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.tertiary)
                    }
                    question.answers.forEach { answer -> AnswerRow(app, answer, answer.id in selections[question.id].orEmpty(), revealed[question.id] == true, onClick = { onSelect(question.id, answer.id) }) }
                    TextButton(onClick = { onReveal(question.id) }, contentPadding = PaddingValues(vertical = 8.dp)) {
                        Icon(if (revealed[question.id] == true) Icons.Default.VisibilityOff else Icons.Default.Visibility, null, Modifier.size(18.dp)); Spacer(Modifier.width(8.dp))
                        Text(app.text(if (revealed[question.id] == true) "native.hide_answer" else "native.show_answer"), fontSize = 15.sp)
                    }
                    if (revealed[question.id] == true) ReferenceLinks(app, question, onRule)
                    HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = .10f))
                }
            }
        }
        PrimaryAction(app.text("native.calculate"), { onScore(Scorer.calculate(questions, selections.toMap(), app.repository.scoring())); scoreRequest++ },
            Modifier.background(MaterialTheme.colorScheme.surface.copy(alpha = .95f)).padding(horizontal = 20.dp, vertical = 10.dp), Icons.Default.CheckCircle, !showingAnswers && questions.isNotEmpty())
    }
}

@Composable
internal fun QuizScreen(app: AppContent, quiz: QuizState, onUpdate: (QuizState) -> Unit, onNewQuiz: () -> Unit, onRule: (Rule) -> Unit, modifier: Modifier = Modifier) {
    val latest by rememberUpdatedState(quiz)
    if (quiz.completedAt != null) {
        val score = Scorer.calculate(quiz.questions, quiz.selections, app.repository.scoring())
        LazyColumn(modifier.fillMaxSize(), contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(22.dp)) {
            item { ScoreSummary(app, score) }
            item {
                val elapsed = (quiz.completedAt - quiz.startedAt).coerceAtLeast(0) / 1000
                Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) { TinyBadge("${app.text("quiz_results.completion_time")} · ${elapsed / 60}:${(elapsed % 60).toString().padStart(2, '0')}", color = Brand.navy(), icon = Icons.Default.Schedule) }
            }
            item { PrimaryAction(app.text("quiz_results.retake"), onNewQuiz, icon = Icons.Default.RestartAlt) }
            item { SectionHeading(app.text("quiz_results.review"), app.text("native.review_detail")) }
            items(quiz.questions, key = Question::id) { question ->
                PaperCard {
                    Column(verticalArrangement = Arrangement.spacedBy(15.dp)) {
                        val wrong = question.id in score.wrongQuestionIds
                        TinyBadge(app.text(if (wrong) "quiz_results.wrong" else "quiz_results.correct"), color = if (wrong) Brand.gold() else MaterialTheme.colorScheme.tertiary, icon = if (wrong) Icons.Default.RestartAlt else Icons.Default.Check)
                        QuestionHeader(question)
                        question.answers.forEach { answer -> AnswerRow(app, answer, answer.id in quiz.selections[question.id].orEmpty(), revealed = true) }
                        ReferenceLinks(app, question, onRule)
                    }
                }
            }
        }
        return
    }
    val scroll = rememberScrollState()
    LaunchedEffect(quiz.index) { scroll.scrollTo(0) }
    Column(modifier.fillMaxSize().pointerInput(Unit) {
        var distance = 0f
        detectHorizontalDragGestures(onDragEnd = {
            val snapshot = latest
            if (distance > 60.dp.toPx() && snapshot.index > 0) onUpdate(snapshot.copy(index = snapshot.index - 1))
            else if (distance < -60.dp.toPx() && snapshot.index < snapshot.questions.lastIndex) onUpdate(snapshot.copy(index = snapshot.index + 1))
            distance = 0f
        }, onDragCancel = { distance = 0f }, onHorizontalDrag = { change, amount -> change.consume(); distance += amount })
    }) {
        Column(Modifier.weight(1f).verticalScroll(scroll).padding(20.dp), verticalArrangement = Arrangement.spacedBy(22.dp)) {
            Column(verticalArrangement = Arrangement.spacedBy(15.dp)) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(app.text("native.quiz_eyebrow"), fontSize = 11.sp, fontWeight = FontWeight.ExtraBold, letterSpacing = 1.6.sp, color = Brand.blue())
                    Text(app.text("native.question_progress", mapOf("current" to (quiz.index + 1).toString(), "total" to quiz.questions.size.toString())), fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    quiz.questions.indices.forEach { index -> Box(Modifier.weight(1f).height(7.dp).clip(RoundedCornerShape(50)).background(Brand.blue().copy(alpha = if (index <= quiz.index) 1f else .12f))) }
                }
            }
            quiz.questions.getOrNull(quiz.index)?.let { question ->
                PaperCard {
                    Column(verticalArrangement = Arrangement.spacedBy(18.dp)) {
                        QuestionHeader(question, showNumber = false)
                        Text(app.text("quiz.select_answers"), fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    question.answers.forEach { answer -> AnswerRow(app, answer, answer.id in quiz.selections[question.id].orEmpty(), showNumber = false, onClick = {
                        val selected = quiz.selections[question.id].orEmpty().toMutableSet()
                        if (!selected.add(answer.id)) selected.remove(answer.id)
                        onUpdate(quiz.copy(selections = quiz.selections + (question.id to selected)))
                    }) }
                }
            }
            if (quiz.index < quiz.questions.lastIndex) TextButton(onClick = { val now = System.currentTimeMillis(); onUpdate(quiz.copy(completedAt = minOf(now, quiz.deadline ?: now))) }, modifier = Modifier.fillMaxWidth()) { Text(app.text("native.finish")) }
        }
        Row(Modifier.background(MaterialTheme.colorScheme.surface.copy(alpha = .95f)).padding(horizontal = 20.dp, vertical = 12.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            IconButton(onClick = { onUpdate(quiz.copy(index = quiz.index - 1)) }, enabled = quiz.index > 0, modifier = Modifier.size(58.dp).clip(RoundedCornerShape(20.dp)).background(MaterialTheme.colorScheme.surface)) { Icon(Icons.AutoMirrored.Filled.ArrowBack, app.text("quiz.previous"), tint = Brand.blue()) }
            PrimaryAction(app.text(if (quiz.index == quiz.questions.lastIndex) "native.finish" else "quiz.next"), {
                if (quiz.index == quiz.questions.lastIndex) { val now = System.currentTimeMillis(); onUpdate(quiz.copy(completedAt = minOf(now, quiz.deadline ?: now))) }
                else onUpdate(quiz.copy(index = quiz.index + 1))
            }, Modifier.weight(1f), if (quiz.index == quiz.questions.lastIndex) Icons.Default.Check else Icons.AutoMirrored.Filled.ArrowForward)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun SettingsScreen(app: AppContent, locale: String, appearance: String, onLanguage: (String) -> Unit, onAppearance: (String) -> Unit, onInfo: (String) -> Unit, modifier: Modifier = Modifier) {
    var languageMenu by remember { mutableStateOf(false) }
    var editions by remember { mutableStateOf(false) }
    var licenses by remember { mutableStateOf(false) }
    val languages = listOf("en" to "English", "nl" to "Nederlands", "fr" to "Français", "srb" to "Српски")
    Column(modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp), verticalArrangement = Arrangement.spacedBy(23.dp)) {
        SectionHeading(app.text("native.settings_title"), app.text("settings.description"))
        PaperCard {
            Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) { Icon(Icons.Default.Language, null, tint = Brand.blue()); Text(app.text("settings.language_section"), fontSize = 17.sp, fontWeight = FontWeight.Bold, color = Brand.blue()) }
                Box {
                    TextButton(onClick = { languageMenu = true }, contentPadding = PaddingValues(0.dp)) { Text(languages.first { it.first == locale }.second); Icon(Icons.Default.ExpandMore, null) }
                    DropdownMenu(languageMenu, { languageMenu = false }) { languages.forEach { (code, label) -> DropdownMenuItem(text = { Text(label) }, onClick = { languageMenu = false; onLanguage(code) }) } }
                }
                HorizontalDivider()
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) { Icon(Icons.Default.Palette, null, tint = Brand.navy()); Text(app.text("settings.theme_section"), fontSize = 17.sp, fontWeight = FontWeight.Bold, color = Brand.navy()) }
                SingleChoiceSegmentedButtonRow(Modifier.fillMaxWidth()) {
                    listOf("system", "light", "dark").forEachIndexed { index, mode -> SegmentedButton(appearance == mode, { onAppearance(mode) }, SegmentedButtonDefaults.itemShape(index, 3), label = { Text(app.text("theme.$mode"), fontSize = 12.sp) }) }
                }
            }
        }
        PaperCard(tint = Brand.blue()) {
            TextButton(onClick = { editions = !editions }, contentPadding = PaddingValues(0.dp)) { Text(app.text("native.content"), Modifier.weight(1f), fontWeight = FontWeight.SemiBold); Icon(if (editions) Icons.Default.ExpandLess else Icons.Default.ExpandMore, null) }
            if (editions) Column(Modifier.padding(top = 14.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) { languages.forEach { (code, name) -> Column(verticalArrangement = Arrangement.spacedBy(4.dp)) { Text(name, fontSize = 15.sp, fontWeight = FontWeight.Bold); Text(app.repository.edition(code), fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant) } } }
        }
        PaperCard {
            SettingsRow(app.text("privacy.title"), Icons.Default.PrivacyTip, Brand.navy()) { onInfo("privacy") }
            HorizontalDivider(Modifier.padding(vertical = 12.dp))
            SettingsRow(app.text("support.title"), Icons.Default.ChatBubbleOutline, Brand.blue()) { onInfo("support") }
            HorizontalDivider(Modifier.padding(vertical = 12.dp))
            TextButton(onClick = { licenses = !licenses }, contentPadding = PaddingValues(0.dp)) { Text(app.text("native.licenses"), Modifier.weight(1f), fontWeight = FontWeight.SemiBold); Icon(if (licenses) Icons.Default.ExpandLess else Icons.Default.ExpandMore, null) }
            if (licenses) Column(Modifier.padding(top = 12.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) { Text("Handball Rules Quiz", fontSize = 15.sp, fontWeight = FontWeight.SemiBold); Text("© 2026 Kristof Gilis", fontSize = 13.sp); Text(app.text("native.acknowledgements"), fontSize = 13.sp) }
        }
        Row(Modifier.fillMaxWidth().padding(horizontal = 6.dp), horizontalArrangement = Arrangement.SpaceBetween) { Text(app.text("native.version"), fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant); Text("${BuildConfig.VERSION_NAME} (${BuildConfig.VERSION_CODE})", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant) }
    }
}

@Composable
private fun SettingsRow(title: String, icon: androidx.compose.ui.graphics.vector.ImageVector, color: Color, onClick: () -> Unit) {
    Row(Modifier.fillMaxWidth().heightIn(min = 36.dp).clickable(onClick = onClick), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        Icon(icon, null, Modifier.size(27.dp), tint = color)
        Text(title, Modifier.weight(1f), fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
        Icon(Icons.Default.ChevronRight, null, Modifier.size(18.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}
