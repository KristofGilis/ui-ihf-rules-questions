package io.github.kristofgilis.ihfrulesquiz.ui

import androidx.core.content.edit
import androidx.core.net.toUri
import android.content.Context
import android.content.Intent
import android.animation.ValueAnimator
import android.os.Build
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.automirrored.filled.ManageSearch
import androidx.compose.material.icons.filled.PlayCircle
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.SportsHandball
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationRail
import androidx.compose.material3.NavigationRailItem
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.core.animateFloat
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.kristofgilis.ihfrulesquiz.BuildConfig
import io.github.kristofgilis.ihfrulesquiz.R
import io.github.kristofgilis.ihfrulesquiz.data.Answer
import io.github.kristofgilis.ihfrulesquiz.data.LocalSearch
import io.github.kristofgilis.ihfrulesquiz.data.ContentRepository
import io.github.kristofgilis.ihfrulesquiz.data.Question
import io.github.kristofgilis.ihfrulesquiz.data.QuizScore
import io.github.kristofgilis.ihfrulesquiz.data.Rule
import io.github.kristofgilis.ihfrulesquiz.data.Scorer
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import kotlinx.coroutines.launch
import java.util.Locale

private enum class Destination { Home, Practice, Rules, Search }
private data class AppContent(val repository: ContentRepository, val locale: String, val strings: Map<String, String>, val rules: List<Rule>, val questions: List<Question>, val searchDocuments: List<Pair<String, String>>, val restoredQuiz: QuizState?)
private data class QuizState(val questions: List<Question>, val selections: Map<String, Set<String>>, val index: Int, val startedAt: Long, val deadline: Long?, val completedAt: Long?, val language: String)

@Composable
fun HandballRulesApp() {
    val context = LocalContext.current
    val prefs = remember { context.getSharedPreferences("native-app", Context.MODE_PRIVATE) }
    var locale by remember { mutableStateOf(prefs.getString("language", null) ?: systemLanguage()) }
    var appearance by remember { mutableStateOf(prefs.getString("appearance", "system") ?: "system") }
    var destination by remember { mutableStateOf(Destination.Home) }
    var settings by remember { mutableStateOf(false) }
    var infoPage by remember { mutableStateOf<String?>(null) }
    var confirmQuizExit by remember { mutableStateOf(false) }
    var quizSetup by remember { mutableStateOf(false) }
    var quiz by remember { mutableStateOf<QuizState?>(null) }
    var quizHydrated by remember { mutableStateOf(false) }
    var timerNow by remember { mutableLongStateOf(System.currentTimeMillis()) }
    var quizCount by remember { mutableIntStateOf(10) }
    var timed by remember { mutableStateOf(false) }
    var selectedRule by remember { mutableStateOf<Rule?>(null) }
    var selectedSearchQuestion by remember { mutableStateOf<Question?>(null) }
    val answers = remember { mutableStateMapOf<String, Set<String>>() }
    val revealed = remember { mutableStateMapOf<String, Boolean>() }
    var practiceScore by remember { mutableStateOf<QuizScore?>(null) }
    var query by remember { mutableStateOf("") }
    val loaded by produceState<Result<ContentRepository>?>(initialValue = null) {
        value = withContext(Dispatchers.IO) { runCatching { ContentRepository(context.applicationContext) } }
    }
    HandballTheme(appearance) {
        when {
            loaded == null -> LoadingScreen()
            loaded!!.isFailure -> ErrorScreen(loaded!!.exceptionOrNull()?.localizedMessage ?: "Content unavailable")
            else -> {
                val repository = loaded!!.getOrThrow()
                val content by produceState<Result<AppContent>?>(initialValue = null, repository, locale) {
                    value = withContext(Dispatchers.IO) {
                        runCatching { AppContent(repository, locale, repository.strings(context, locale), repository.rules(locale), repository.questions(locale), repository.searchDocuments(locale), restoreQuiz(context, repository)) }
                    }
                }
                if (content == null) {
                    LoadingScreen()
                } else content!!.fold(
                    onSuccess = { app ->
                        val wideLayout = LocalConfiguration.current.screenWidthDp >= 600

                        LaunchedEffect(repository) {
                            if (!quizHydrated) {
                                quiz = app.restoredQuiz
                                quizHydrated = true
                            }
                        }
                        LaunchedEffect(locale) {
                            prefs.edit { putString("language", locale) }
                            selectedRule = null
                        }
                        LaunchedEffect(appearance) { prefs.edit { putString("appearance", appearance) } }
                        BackHandler(enabled = settings || infoPage != null || selectedRule != null || selectedSearchQuestion != null || quiz != null || destination != Destination.Home) {
                            when {
                                infoPage != null -> infoPage = null
                                settings -> settings = false
                                selectedSearchQuestion != null -> selectedSearchQuestion = null
                                selectedRule != null -> selectedRule = null
                                quiz != null -> if (quiz?.completedAt == null) confirmQuizExit = true else quiz = null
                                destination != Destination.Home -> destination = Destination.Home
                            }
                        }
                        LaunchedEffect(quiz?.deadline, quiz?.completedAt) {
                            val deadline = quiz?.deadline ?: return@LaunchedEffect
                            while (quiz?.completedAt == null && System.currentTimeMillis() < deadline) {
                                timerNow = System.currentTimeMillis()
                                delay(500)
                            }
                            if (quiz?.completedAt == null) quiz = quiz?.copy(completedAt = deadline)
                        }
                        LaunchedEffect(quiz, quizHydrated) {
                            if (!quizHydrated) return@LaunchedEffect
                            if (quiz == null) prefs.edit { remove("quizSession") }
                            else prefs.edit { putString("quizSession", encodeQuiz(quiz!!, repository.contentHash)) }
                        }

                        val title = when {
                            infoPage != null -> app.text(if (infoPage == "privacy") "privacy.title" else "support.title")
                            settings -> app.text("settings.title")
                            selectedRule != null -> "${selectedRule!!.number} · ${selectedRule!!.name}"
                            selectedSearchQuestion != null -> selectedSearchQuestion!!.number
                            else -> when (destination) {
                                Destination.Home -> "Handball Rules Quiz"
                                Destination.Practice -> app.text("native.practice")
                                Destination.Rules -> app.text("navigation.rules")
                                Destination.Search -> app.text("search.title")
                            }
                        }
                        Scaffold(
                            topBar = {
                                Row(Modifier.fillMaxWidth().statusBarsPadding().padding(horizontal = 16.dp, vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                                    if (destination == Destination.Home && !settings && selectedRule == null) {
                                        Image(painterResource(R.drawable.brand_mark), contentDescription = null, modifier = Modifier.size(42.dp))
                                        Spacer(Modifier.width(10.dp))
                                    }
                                    Text(title, Modifier.weight(1f), style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                    IconButton(onClick = { settings = !settings; infoPage = null; selectedRule = null }) { Icon(Icons.Default.Settings, contentDescription = app.text("settings.title")) }
                                }
                            },
                            bottomBar = {
                                if (!wideLayout && !settings && infoPage == null && selectedRule == null && selectedSearchQuestion == null && quiz == null) NavigationBar {
                                    listOf(
                                        Destination.Home to (app.text("navigation.home") to Icons.Default.Home),
                                        Destination.Practice to (app.text("native.practice") to Icons.Default.PlayCircle),
                                        Destination.Rules to (app.text("navigation.rules") to Icons.Default.Book),
                                        Destination.Search to (app.text("navigation.search") to Icons.Default.Search),
                                    ).forEach { (item, pair) ->
                                        NavigationBarItem(selected = destination == item, onClick = {
                                            if (destination != item) { answers.clear(); revealed.clear(); practiceScore = null; selectedRule = null; selectedSearchQuestion = null }
                                            destination = item
                                        }, icon = { Icon(pair.second, null) }, label = { Text(pair.first, maxLines = 1) })
                                    }
                                }
                            },
                        ) { insets ->
                            Row(Modifier.fillMaxSize()) {
                                if (wideLayout && !settings && infoPage == null && selectedRule == null && selectedSearchQuestion == null && quiz == null) {
                                    NavigationRail(modifier = Modifier.padding(insets)) {
                                        listOf(
                                            Destination.Home to (app.text("navigation.home") to Icons.Default.Home),
                                            Destination.Practice to (app.text("native.practice") to Icons.Default.PlayCircle),
                                            Destination.Rules to (app.text("navigation.rules") to Icons.Default.Book),
                                            Destination.Search to (app.text("navigation.search") to Icons.Default.Search),
                                        ).forEach { (item, pair) ->
                                            NavigationRailItem(selected = destination == item, onClick = {
                                                if (destination != item) { answers.clear(); revealed.clear(); practiceScore = null }
                                                destination = item
                                            }, icon = { Icon(pair.second, null) }, label = { Text(pair.first) }, alwaysShowLabel = true)
                                        }
                                    }
                                }
                                Box(Modifier.weight(1f).fillMaxSize()) { when {
                                infoPage != null -> InformationScreen(app, infoPage!!, modifier = Modifier.padding(insets))
                                settings -> SettingsScreen(app, locale, appearance, onLanguage = { locale = it }, onAppearance = { appearance = it }, onInfo = { infoPage = it }, modifier = Modifier.padding(insets))
                                quiz != null -> QuizScreen(app, quiz!!, timerNow, onUpdate = { quiz = it }, onClose = { if (quiz?.completedAt == null) confirmQuizExit = true else quiz = null }, onNewQuiz = { quiz = null; quizSetup = true }, modifier = Modifier.padding(insets))
                                selectedSearchQuestion != null -> PracticeScreen(
                                    app, listOf(selectedSearchQuestion!!), answers, revealed, practiceScore,
                                    onScore = { practiceScore = it },
                                    onSelect = { q, a -> val old = answers[q].orEmpty(); answers[q] = if (a in old) old - a else old + a; practiceScore = null },
                                    onReveal = { q -> val showing = revealed[q] != true; if (showing) { answers.clear(); practiceScore = null }; revealed[q] = showing },
                                    onReset = { answers.clear(); revealed.clear(); practiceScore = null },
                                    onRule = { rule -> selectedSearchQuestion = null; selectedRule = rule; answers.clear(); revealed.clear(); practiceScore = null }, modifier = Modifier.padding(insets),
                                )
                                selectedRule != null -> PracticeScreen(
                                    app, app.questions.filter { it.ruleId == selectedRule!!.id }, answers, revealed,
                                    practiceScore, onScore = { practiceScore = it }, onSelect = { q, a -> answers[q] = (answers[q].orEmpty() + a).let { now -> if (a in answers[q].orEmpty()) now - a else now }; practiceScore = null },
                                    onReveal = { q -> val showing = revealed[q] != true; if (showing) { answers.clear(); practiceScore = null }; revealed[q] = showing },
                                    onReset = { answers.clear(); revealed.clear(); practiceScore = null }, onRule = { selectedRule = it; answers.clear(); revealed.clear(); practiceScore = null }, modifier = Modifier.padding(insets),
                                )
                                destination == Destination.Home -> HomeScreen(app, onQuiz = { quizSetup = true }, onRules = { destination = Destination.Rules }, onPractice = { destination = Destination.Practice }, modifier = Modifier.padding(insets))
                                destination == Destination.Rules -> RulesScreen(app, onRule = { answers.clear(); revealed.clear(); practiceScore = null; selectedRule = it }, modifier = Modifier.padding(insets))
                                destination == Destination.Search -> SearchScreen(app, query, { query = it }, { selectedSearchQuestion = it }, modifier = Modifier.padding(insets))
                                else -> PracticeScreen(
                                    app, app.questions, answers, revealed, practiceScore,
                                    onScore = { practiceScore = it },
                                    onSelect = { q, a -> val old = answers[q].orEmpty(); answers[q] = if (a in old) old - a else old + a; practiceScore = null },
                                    onReveal = { q -> val showing = revealed[q] != true; if (showing) { answers.clear(); practiceScore = null }; revealed[q] = showing },
                                    onReset = { answers.clear(); revealed.clear(); practiceScore = null }, onRule = { selectedRule = it; answers.clear(); revealed.clear(); practiceScore = null }, modifier = Modifier.padding(insets),
                                )
                                } }
                            }
                        }
                        if (confirmQuizExit) AlertDialog(
                            onDismissRequest = { confirmQuizExit = false },
                            title = { Text(app.text("quiz.leave_title")) },
                            text = { Text(app.text("quiz.leave_warning")) },
                            confirmButton = { TextButton(onClick = { confirmQuizExit = false; quiz = null }) { Text(app.text("quiz.leave_confirm")) } },
                            dismissButton = { TextButton(onClick = { confirmQuizExit = false }) { Text(app.text("quiz.leave_cancel")) } },
                        )
                        if (quizSetup) QuizSetupDialog(app, quizCount, timed, { quizCount = it }, { timed = it }, onDismiss = { quizSetup = false }) {
                            val selected = app.questions.shuffled().take(quizCount).map { q -> q.copy(answers = q.answers.shuffled()) }
                            val start = System.currentTimeMillis()
                            quiz = QuizState(selected, emptyMap(), 0, start, if (timed) start + selected.size * 90_000L else null, null, locale)
                            quizSetup = false
                        }
                    },
                    onFailure = { ErrorScreen(it.localizedMessage ?: "Content unavailable") },
                )
            }
        }
    }
}

private fun systemLanguage(): String = when (Locale.getDefault().language) {
    "nl" -> "nl"
    "fr" -> "fr"
    "sr" -> "srb"
    else -> "en"
}

private fun AppContent.text(key: String): String = strings[key] ?: key
private fun AppContent.text(key: String, values: Map<String, String>): String = values.entries.fold(text(key)) { current, entry -> current.replace("{{${entry.key}}}", entry.value) }

@Composable private fun LoadingScreen() = Column(Modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) { CircularProgressIndicator(); Spacer(Modifier.height(14.dp)); Text("Handball Rules Quiz") }
@Composable private fun ErrorScreen(detail: String) = Column(Modifier.fillMaxSize().padding(28.dp), verticalArrangement = Arrangement.Center) { Text("Handball Rules Quiz", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold); Spacer(Modifier.height(10.dp)); Text(detail) }

@Composable
private fun HomeScreen(app: AppContent, onQuiz: () -> Unit, onRules: () -> Unit, onPractice: () -> Unit, modifier: Modifier = Modifier) {
    val courtMotion = rememberInfiniteTransition(label = "home-court-motion")
    val motionAllowed = remember { Build.VERSION.SDK_INT < 26 || ValueAnimator.areAnimatorsEnabled() }
    val animatedOffset by courtMotion.animateFloat(-4f, 4f, infiniteRepeatable(tween(2200), RepeatMode.Reverse), label = "court-offset")
    val courtOffset = if (motionAllowed) animatedOffset else 0f
    Column(modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(18.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF00206D)), shape = RoundedCornerShape(28.dp)) {
            Row(Modifier.fillMaxWidth().padding(22.dp), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(app.text("native.hero_eyebrow"), color = Color(0xFFE8C969), style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(8.dp))
                    Text(app.text("native.hero_title").replace("\n", " "), color = Color.White, style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.Black)
                    Spacer(Modifier.height(12.dp))
                    Text(app.text("native.practice_detail"), color = Color.White.copy(alpha = .84f), style = MaterialTheme.typography.bodyLarge)
                }
                CourtArtwork(Modifier.width(68.dp).offset(y = courtOffset.dp), height = 136.dp)
            }
        }
        Card(shape = RoundedCornerShape(26.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
            Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(app.text("home.quiz_card.title"), style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Text(app.text("native.quiz_invite"), color = MaterialTheme.colorScheme.onSurfaceVariant)
                Button(onClick = onQuiz, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(17.dp)) { Icon(Icons.Default.PlayCircle, null); Spacer(Modifier.width(8.dp)); Text(app.text("home.quiz_card.button")) }
            }
        }
        Row(Modifier.height(IntrinsicSize.Min), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            QuickCard(app.text("native.study_title"), app.text("native.questions", mapOf("count" to app.questions.size.toString())), Icons.Default.SportsHandball, Modifier.weight(1f).fillMaxHeight(), onPractice)
            QuickCard(app.text("native.rules_title"), app.text("native.rule_count", mapOf("count" to app.rules.size.toString())), Icons.Default.Book, Modifier.weight(1f).fillMaxHeight(), onRules)
        }
        Text("${app.text("native.content")}: ${app.repository.edition(app.locale)}", color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)
        Text("${app.text("native.version")} ${BuildConfig.VERSION_NAME} (${BuildConfig.VERSION_CODE})", color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)
    }
}

@Composable
private fun QuickCard(title: String, detail: String, icon: androidx.compose.ui.graphics.vector.ImageVector, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Card(modifier.clickable(onClick = onClick), shape = RoundedCornerShape(23.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) { Icon(icon, null, tint = MaterialTheme.colorScheme.primary); Text(title, fontWeight = FontWeight.Bold); Text(detail, style = MaterialTheme.typography.bodySmall) }
    }
}

@Composable
private fun RulesScreen(app: AppContent, onRule: (Rule) -> Unit, modifier: Modifier = Modifier) {
    LazyColumn(modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item { Text(app.text("rules.description"), style = MaterialTheme.typography.bodyLarge, modifier = Modifier.padding(bottom = 5.dp)) }
        items(app.rules, key = Rule::id) { rule ->
            Card(Modifier.fillMaxWidth().clickable { onRule(rule) }, shape = RoundedCornerShape(20.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
                Row(Modifier.padding(17.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text(rule.number, color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Black)
                    Spacer(Modifier.width(14.dp))
                    Column(Modifier.weight(1f)) { Text(rule.name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold); Text(app.text("native.questions", mapOf("count" to app.questions.count { it.ruleId == rule.id }.toString())), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant) }
            Icon(Icons.Default.PlayCircle, null, tint = MaterialTheme.colorScheme.primary)
                }
            }
        }
    }
}

@Composable
private fun SearchScreen(app: AppContent, query: String, onQuery: (String) -> Unit, onQuestion: (Question) -> Unit, modifier: Modifier = Modifier) {
    val matching by produceState(initialValue = emptySet<String>(), query, app.searchDocuments) {
        value = withContext(Dispatchers.Default) { LocalSearch.matchingIds(query, app.searchDocuments) }
    }
    Column(modifier.fillMaxSize()) {
        OutlinedTextField(query, onQuery, Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 10.dp), placeholder = { Text(app.text("search.placeholder")) }, leadingIcon = { Icon(Icons.AutoMirrored.Filled.ManageSearch, null) }, singleLine = true, shape = RoundedCornerShape(18.dp))
        if (query.isNotBlank() && matching.isEmpty()) Text(app.text("search.no_results"), Modifier.padding(20.dp), color = MaterialTheme.colorScheme.onSurfaceVariant)
        LazyColumn(Modifier.weight(1f), contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(app.questions.filter { it.id in matching }, key = Question::id) { question ->
                Card(onClick = { onQuestion(question) }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(20.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(question.number, color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
                        Text(question.phrase, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                        Text(question.answers.joinToString("  ·  ") { it.phrase }, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 3, overflow = TextOverflow.Ellipsis)
                    }
                }
            }
        }
    }
}

@Composable
private fun PracticeScreen(
    app: AppContent, questions: List<Question>, selections: MutableMap<String, Set<String>>, revealed: MutableMap<String, Boolean>, score: QuizScore?,
    onScore: (QuizScore?) -> Unit, onSelect: (String, String) -> Unit, onReveal: (String) -> Unit, onReset: () -> Unit, modifier: Modifier = Modifier, onRule: (Rule) -> Unit = {},
) {
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()
    Column(modifier.fillMaxSize()) {
        Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
            Text(app.text("native.questions", mapOf("count" to questions.size.toString())), Modifier.weight(1f), color = MaterialTheme.colorScheme.onSurfaceVariant)
            TextButton(onClick = onReset) { Text(app.text("native.reset")) }
            TextButton(onClick = {
                val allRevealed = questions.isNotEmpty() && questions.all { revealed[it.id] == true }
                val showAll = !allRevealed
                if (showAll) { selections.clear(); onScore(null) }
                questions.forEach { revealed[it.id] = showAll }
            }) { Text(app.text(if (questions.isNotEmpty() && questions.all { revealed[it.id] == true }) "native.hide_all" else "native.show_all")) }
        }
        if (score != null) ScoreCard(app, score)
        if (score != null && score.wrongQuestionIds.isNotEmpty()) {
            LazyRow(contentPadding = PaddingValues(horizontal = 14.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(questions.filter { it.id in score.wrongQuestionIds }, key = Question::id) { question ->
                    FilterChip(selected = false, onClick = { scope.launch { listState.animateScrollToItem(questions.indexOfFirst { it.id == question.id }) } }, label = { Text(question.number) })
                }
            }
        }
        LazyColumn(state = listState, modifier = Modifier.weight(1f), contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 4.dp, bottom = 16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(questions, key = Question::id) { question ->
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("${question.number}  ${question.phrase}", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    question.answers.forEach { answer -> QuestionAnswer(app, answer, answer.id in selections[question.id].orEmpty(), revealed[question.id] == true, { onSelect(question.id, answer.id) }, enabled = revealed[question.id] != true) }
                    TextButton(onClick = { onReveal(question.id) }) { Text(app.text(if (revealed[question.id] == true) "native.hide_answer" else "native.show_answer")) }
                    if (revealed[question.id] == true && question.references.isNotEmpty()) {
                        Text(question.references.joinToString(), color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)
                        app.rules.firstOrNull { it.id == question.ruleId }?.let { rule ->
                            TextButton(onClick = { onRule(rule) }) { Text("${rule.number} · ${rule.name}") }
                        }
                    }
                }
            }
        }
        Button(onClick = { onScore(Scorer.calculate(questions, selections.toMap(), app.repository.scoring())) }, enabled = revealed.values.none { it }, modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 10.dp), shape = RoundedCornerShape(18.dp)) { Text(app.text("native.calculate")) }
    }
}

@Composable
private fun QuestionCard(app: AppContent, question: Question, selected: Set<String>, revealed: Boolean, showNumber: Boolean, onSelect: (String) -> Unit, onReveal: () -> Unit, showReveal: Boolean = true) {
    Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(22.dp)).background(MaterialTheme.colorScheme.surface).padding(15.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text((if (showNumber) "${question.number}  " else "") + question.phrase, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
        question.answers.forEach { QuestionAnswer(app, it, it.id in selected, revealed, { onSelect(it.id) }, enabled = false) }
        if (revealed && question.references.isNotEmpty()) Text(question.references.joinToString(), style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        if (!revealed && showReveal) TextButton(onClick = onReveal) { Text(app.text("native.show_answer")) }
    }
}

@Composable
private fun QuestionAnswer(app: AppContent, answer: Answer, selected: Boolean, revealed: Boolean, onClick: () -> Unit, showNumber: Boolean = true, enabled: Boolean = true) {
    val correct = revealed && answer.isCorrect
    val wrong = revealed && selected && !answer.isCorrect
    val tint = when { correct -> Color(0xFF198754); wrong -> Color(0xFFBD3D48); selected -> MaterialTheme.colorScheme.primary; else -> MaterialTheme.colorScheme.surfaceVariant }
    Card(onClick = onClick, enabled = enabled, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(17.dp), colors = CardDefaults.cardColors(containerColor = if (selected || correct || wrong) tint.copy(alpha = .12f) else MaterialTheme.colorScheme.surfaceVariant)) {
        Row(Modifier.padding(13.dp), verticalAlignment = Alignment.CenterVertically) {
            Text(if (correct || selected) "✓" else if (showNumber) answer.number.uppercase() else "", Modifier.size(32.dp).clip(RoundedCornerShape(10.dp)).background(tint).padding(top = 6.dp), color = if (correct || selected || wrong) Color.White else MaterialTheme.colorScheme.onSurface, fontWeight = FontWeight.Bold, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
            Spacer(Modifier.width(12.dp)); Text(answer.phrase, Modifier.weight(1f), style = MaterialTheme.typography.bodyLarge)
        }
    }
}

@Composable
private fun ScoreCard(app: AppContent, score: QuizScore) {
    Card(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp), shape = RoundedCornerShape(22.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)) {
        Row(Modifier.padding(18.dp), verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Default.Star, null, tint = MaterialTheme.colorScheme.secondary); Spacer(Modifier.width(12.dp)); Column { Text("${"%.2f".format(Locale.ROOT, score.percentage)}%", fontSize = 28.sp, fontWeight = FontWeight.Black); Text(app.text("native.score", mapOf("score" to score.points.toString(), "total" to score.total.toString()))) } }
    }
}

@Composable
private fun QuizSetupDialog(app: AppContent, count: Int, timed: Boolean, onCount: (Int) -> Unit, onTimed: (Boolean) -> Unit, onDismiss: () -> Unit, onStart: () -> Unit) {
    AlertDialog(onDismissRequest = onDismiss, title = { Text(app.text("home.quiz_card.title")) }, text = {
        Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Text(app.text("home.quiz_card.count"))
            Row(horizontalArrangement = Arrangement.spacedBy(7.dp)) { listOf(10, 15, 20, 30).forEach { FilterChip(selected = count == it, onClick = { onCount(it) }, label = { Text(it.toString()) }) } }
            Row(verticalAlignment = Alignment.CenterVertically) { Column(Modifier.weight(1f)) { Text(app.text("native.timed_label")); Text(app.text("native.timed_detail"), style = MaterialTheme.typography.bodySmall) }; Switch(timed, onTimed) }
        }
    }, confirmButton = { Button(onClick = onStart) { Text(app.text("home.quiz_card.button")) } }, dismissButton = { TextButton(onClick = onDismiss) { Text(app.text("native.close")) } })
}

@Composable
private fun QuizScreen(app: AppContent, quiz: QuizState, timerNow: Long, onUpdate: (QuizState) -> Unit, onClose: () -> Unit, onNewQuiz: () -> Unit, modifier: Modifier = Modifier) {
    val current = quiz.questions.getOrNull(quiz.index)
    if (quiz.completedAt != null) {
        val score = Scorer.calculate(quiz.questions, quiz.selections, app.repository.scoring())
        Column(modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(18.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Text(app.text("quiz_results.title"), style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Black)
            ScoreCard(app, score)
            val correctQuestions = quiz.questions.size - score.wrongQuestionIds.size
            val elapsed = ((quiz.completedAt - quiz.startedAt).coerceAtLeast(0) / 1000)
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Card(Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
                    Column(Modifier.padding(14.dp)) { Text(app.text("quiz_results.correct"), color = MaterialTheme.colorScheme.onSurfaceVariant); Text(correctQuestions.toString(), style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold) }
                }
                Card(Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
                    Column(Modifier.padding(14.dp)) { Text(app.text("quiz_results.wrong"), color = MaterialTheme.colorScheme.onSurfaceVariant); Text(score.wrongQuestionIds.size.toString(), style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold) }
                }
                if (quiz.deadline != null) Card(Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
                    Column(Modifier.padding(14.dp)) { Text(app.text("quiz_results.completion_time"), color = MaterialTheme.colorScheme.onSurfaceVariant); Text("${elapsed / 60}:${(elapsed % 60).toString().padStart(2, '0')}", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold) }
                }
            }
            Text(app.text("native.review_detail"), color = MaterialTheme.colorScheme.onSurfaceVariant)
            quiz.questions.forEach { question -> QuestionCard(app, question, quiz.selections[question.id].orEmpty(), true, true, {}, {}) }
            Button(onClick = onNewQuiz, modifier = Modifier.fillMaxWidth()) { Text(app.text("quiz_results.retake")) }
            OutlinedButton(onClick = onClose, modifier = Modifier.fillMaxWidth()) { Text(app.text("navigation.home")) }
        }
        return
    }
    Column(modifier.fillMaxSize().padding(18.dp).pointerInput(quiz.index) {
        var dragDistance = 0f
        val threshold = 72.dp.toPx()
        detectHorizontalDragGestures(
            onDragEnd = {
                if (dragDistance > threshold && quiz.index > 0) onUpdate(quiz.copy(index = quiz.index - 1))
                if (dragDistance < -threshold && quiz.index < quiz.questions.lastIndex) onUpdate(quiz.copy(index = quiz.index + 1))
                dragDistance = 0f
            },
            onHorizontalDrag = { change, amount -> change.consume(); dragDistance += amount },
        )
    }) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(app.text("native.question_progress", mapOf("current" to (quiz.index + 1).toString(), "total" to quiz.questions.size.toString())), Modifier.weight(1f), color = MaterialTheme.colorScheme.onSurfaceVariant)
            if (quiz.deadline != null) {
                val seconds = ((quiz.deadline - timerNow).coerceAtLeast(0) / 1000)
                Text("${app.text("native.remaining")}: ${seconds / 60}:${(seconds % 60).toString().padStart(2, '0')}", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
            }
            TextButton(onClick = onClose) { Text(app.text("native.close")) }
        }
        Column(Modifier.weight(1f).fillMaxWidth().verticalScroll(rememberScrollState()).padding(vertical = 14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            current?.let { question ->
                Text(question.phrase, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                Text(app.text("quiz.select_answers"), color = MaterialTheme.colorScheme.onSurfaceVariant)
                question.answers.forEach { answer -> QuestionAnswer(app, answer, answer.id in quiz.selections[question.id].orEmpty(), false, {
                    val selected = quiz.selections[question.id].orEmpty().toMutableSet()
                    if (!selected.add(answer.id)) selected.remove(answer.id)
                    onUpdate(quiz.copy(selections = quiz.selections + (question.id to selected)))
                }, showNumber = false) }
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            OutlinedButton(onClick = { onUpdate(quiz.copy(index = (quiz.index - 1).coerceAtLeast(0))) }, enabled = quiz.index > 0, modifier = Modifier.weight(1f)) { Text(app.text("quiz.previous")) }
            Button(onClick = {
                if (quiz.index == quiz.questions.lastIndex) {
                    val now = System.currentTimeMillis()
                    onUpdate(quiz.copy(completedAt = minOf(now, quiz.deadline ?: now)))
                } else onUpdate(quiz.copy(index = quiz.index + 1))
            }, modifier = Modifier.weight(1f)) { Text(app.text(if (quiz.index == quiz.questions.lastIndex) "native.finish" else "quiz.next")) }
        }
    }
}

@Composable
private fun SettingsScreen(app: AppContent, locale: String, appearance: String, onLanguage: (String) -> Unit, onAppearance: (String) -> Unit, onInfo: (String) -> Unit, modifier: Modifier = Modifier) {
    Column(modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(18.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text(app.text("settings.description"), color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(app.text("settings.language_section"), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        listOf("en" to "English", "nl" to "Nederlands", "fr" to "Français", "srb" to "Српски").forEach { (code, label) ->
            FilterChip(selected = locale == code, onClick = { onLanguage(code) }, label = { Text(label) })
        }
        Text(app.text("settings.theme_section"), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        listOf("system" to app.text("theme.system"), "light" to app.text("theme.light"), "dark" to app.text("theme.dark")).forEach { (mode, label) ->
            FilterChip(selected = appearance == mode, onClick = { onAppearance(mode) }, label = { Text(label) })
        }
        Text(app.text("native.content"), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Text(app.repository.edition(locale), color = MaterialTheme.colorScheme.onSurfaceVariant)
        OutlinedButton(onClick = { onInfo("privacy") }, modifier = Modifier.fillMaxWidth()) { Text(app.text("privacy.title")) }
        OutlinedButton(onClick = { onInfo("support") }, modifier = Modifier.fillMaxWidth()) { Text(app.text("support.title")) }
        Text(app.text("native.licenses"), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Text("© 2026 Kristof Gilis", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(app.text("native.acknowledgements"), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

private fun encodeQuiz(quiz: QuizState, contentHash: String): String {
    val questionIds = org.json.JSONArray()
    val answerOrder = org.json.JSONObject()
    quiz.questions.forEach { question ->
        questionIds.put(question.id)
        answerOrder.put(question.id, org.json.JSONArray().apply { question.answers.forEach { put(it.id) } })
    }
    val selections = org.json.JSONObject()
    quiz.selections.forEach { (id, answers) -> selections.put(id, org.json.JSONArray().apply { answers.forEach(::put) }) }
    return org.json.JSONObject().put("hash", contentHash).put("language", quiz.language)
        .put("questions", questionIds).put("answerOrder", answerOrder).put("selections", selections)
        .put("index", quiz.index).put("startedAt", quiz.startedAt).put("deadline", quiz.deadline)
        .put("completedAt", quiz.completedAt).toString()
}

private fun restoreQuiz(context: Context, repository: ContentRepository): QuizState? {
    val saved = context.getSharedPreferences("native-app", Context.MODE_PRIVATE).getString("quizSession", null) ?: return null
    return runCatching {
        val json = org.json.JSONObject(saved)
        require(json.getString("hash") == repository.contentHash)
        val language = json.getString("language")
        require(language in setOf("en", "nl", "fr", "srb"))
        val byId = repository.questions(language).associateBy(Question::id)
        val ids = json.getJSONArray("questions")
        val orders = json.getJSONObject("answerOrder")
        val questions = (0 until ids.length()).map { index ->
            val id = ids.getString(index)
            val original = requireNotNull(byId[id])
            val answerIds = orders.getJSONArray(id)
            val answersById = original.answers.associateBy(Answer::id)
            original.copy(answers = (0 until answerIds.length()).map { requireNotNull(answersById[answerIds.getString(it)]) })
        }
        require(questions.isNotEmpty())
        val selectedJson = json.getJSONObject("selections")
        val selections = buildMap {
            val keys = selectedJson.keys()
            while (keys.hasNext()) {
                val id = keys.next()
                val values = selectedJson.getJSONArray(id)
                put(id, (0 until values.length()).map(values::getString).toSet())
            }
        }
        val index = json.getInt("index").coerceIn(0, questions.lastIndex)
        val deadline = if (json.isNull("deadline")) null else json.getLong("deadline")
        val complete = if (json.isNull("completedAt")) null else json.getLong("completedAt")
        QuizState(questions, selections, index, json.getLong("startedAt"), deadline,
            complete ?: deadline?.takeIf { it <= System.currentTimeMillis() }, language)
    }.getOrElse {
        context.getSharedPreferences("native-app", Context.MODE_PRIVATE).edit { remove("quizSession") }
        null
    }
}

@Composable
private fun InformationScreen(app: AppContent, page: String, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val privacy = page == "privacy"
    val sections = if (privacy) listOf(
        "privacy.device_label" to "info.privacy.local",
        "info.privacy.collection_heading" to "info.privacy.collection",
        "privacy.contact_label" to "info.privacy.contact",
        "privacy.retention_heading" to "info.privacy.retention",
        "privacy.rights_heading" to "info.privacy.rights",
        "privacy.changes_heading" to "info.privacy.changes",
    ) else listOf(
        "support.contact_heading" to "support.contact_details",
        "support.offline_heading" to "info.support.offline",
        "support.content_heading" to "support.content_details",
    )
    Column(modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        if (privacy) {
            Text(app.text("info.privacy.updated"), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(app.text("info.privacy.intro"), style = MaterialTheme.typography.bodyLarge)
        } else {
            Text(app.text("info.support.intro"), style = MaterialTheme.typography.bodyLarge)
        }
        sections.forEach { (heading, body) ->
            Card(shape = RoundedCornerShape(20.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
                Column(Modifier.fillMaxWidth().padding(17.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(app.text(heading), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    Text(app.text(body), style = MaterialTheme.typography.bodyMedium)
                    if (heading == "privacy.contact_label" || heading == "support.contact_heading") {
                        TextButton(onClick = { context.startActivity(Intent(Intent.ACTION_SENDTO, "mailto:kristof.gilis@outlook.be".toUri())) }) { Text("kristof.gilis@outlook.be") }
                    }
                    if (heading == "support.contact_heading") {
                        Text(app.text("info.support.email"), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text("${app.text("native.version")}: ${BuildConfig.VERSION_NAME} (${BuildConfig.VERSION_CODE})", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}
