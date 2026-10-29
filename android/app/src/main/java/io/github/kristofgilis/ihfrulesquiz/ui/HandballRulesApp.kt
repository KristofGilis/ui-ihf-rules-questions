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
import androidx.compose.ui.graphics.Brush
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.Inventory2
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.WindowInsetsSides
import androidx.compose.foundation.layout.only
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
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
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationRail
import androidx.compose.material3.NavigationRailItemDefaults
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
internal data class AppContent(val repository: ContentRepository, val locale: String, val strings: Map<String, String>, val rules: List<Rule>, val questions: List<Question>, val searchDocuments: List<Pair<String, String>>, val restoredQuiz: QuizState?)
internal data class QuizState(val questions: List<Question>, val selections: Map<String, Set<String>>, val index: Int, val startedAt: Long, val deadline: Long?, val completedAt: Long?, val language: String)

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
    var quizPresented by remember { mutableStateOf(false) }
    var studyAll by remember { mutableStateOf(false) }
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
                        val navigateBack: () -> Unit = {
                            when {
                                infoPage != null -> infoPage = null
                                settings -> settings = false
                                quizPresented -> if (quiz?.completedAt == null) confirmQuizExit = true else quizPresented = false
                                selectedSearchQuestion != null -> selectedSearchQuestion = null
                                selectedRule != null -> selectedRule = null
                                studyAll -> studyAll = false
                                destination != Destination.Home -> destination = Destination.Home
                            }
                        }
                        BackHandler(enabled = settings || infoPage != null || selectedRule != null || selectedSearchQuestion != null || quizPresented || studyAll || destination != Destination.Home, onBack = navigateBack)
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
                            quizPresented -> app.text(if (quiz?.completedAt == null) "navigation.quiz" else "quiz_results.title")
                            selectedRule != null -> "${selectedRule!!.number} · ${selectedRule!!.name}"
                            selectedSearchQuestion != null -> selectedSearchQuestion!!.number
                            studyAll -> app.text("questions.title")
                            else -> when (destination) {
                                Destination.Home -> "Handball Rules Quiz"
                                Destination.Practice -> app.text("native.practice")
                                Destination.Rules -> app.text("navigation.rules")
                                Destination.Search -> app.text("search.title")
                            }
                        }
                        Scaffold(
                            contentWindowInsets = WindowInsets.safeDrawing,
                            topBar = {
                                val nested = settings || infoPage != null || selectedRule != null || selectedSearchQuestion != null || studyAll || quizPresented
                                Row(Modifier.fillMaxWidth().windowInsetsPadding(WindowInsets.safeDrawing.only(WindowInsetsSides.Top + WindowInsetsSides.Horizontal)).padding(horizontal = 8.dp, vertical = 4.dp).heightIn(min = 56.dp), verticalAlignment = Alignment.CenterVertically) {
                                    if (nested) IconButton(navigateBack) { Icon(if (settings || quizPresented) Icons.Default.Close else Icons.AutoMirrored.Filled.ArrowBack, app.text("native.close")) }
                                    else Spacer(Modifier.width(48.dp))
                                    Row(Modifier.weight(1f), horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically) {
                                        if (destination == Destination.Home && !nested) {
                                            Image(painterResource(R.drawable.brand_mark), null, Modifier.size(40.dp)); Spacer(Modifier.width(8.dp))
                                        }
                                        Text(title, fontSize = 17.sp, fontWeight = FontWeight.SemiBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                    }
                                    if (quizPresented) {
                                        val deadline = quiz?.deadline
                                        if (deadline != null && quiz?.completedAt == null) {
                                            val seconds = ((deadline - timerNow).coerceAtLeast(0) + 999) / 1000
                                            TinyBadge("${seconds / 60}:${(seconds % 60).toString().padStart(2, '0')}", color = if (seconds < 60) MaterialTheme.colorScheme.error else Brand.navy())
                                        } else Spacer(Modifier.width(48.dp))
                                    } else if (!settings && infoPage == null) {
                                        IconButton(onClick = { settings = true }) { Icon(Icons.Default.Tune, app.text("settings.title")) }
                                    } else Spacer(Modifier.width(48.dp))
                                }
                            },
                            bottomBar = {
                                if (!wideLayout && !settings && infoPage == null && selectedRule == null && selectedSearchQuestion == null && !quizPresented && !studyAll) NavigationBar {
                                    listOf(
                                        Destination.Home to (app.text("navigation.home") to Icons.Default.Home),
                                        Destination.Practice to (app.text("native.practice") to Icons.Default.Bolt),
                                        Destination.Rules to (app.text("navigation.rules") to Icons.Default.Book),
                                        Destination.Search to (app.text("navigation.search") to Icons.Default.Search),
                                    ).forEach { (item, pair) ->
                                        NavigationBarItem(selected = destination == item, onClick = {
                                            if (destination != item) { answers.clear(); revealed.clear(); practiceScore = null; selectedRule = null; selectedSearchQuestion = null }
                                            destination = item
                                        }, icon = { Icon(pair.second, null) }, label = { Text(pair.first, maxLines = 1) }, colors = NavigationBarItemDefaults.colors(selectedIconColor = Brand.blue(), selectedTextColor = Brand.blue(), indicatorColor = Brand.blue().copy(alpha = .10f)))
                                    }
                                }
                            },
                        ) { insets ->
                            Row(Modifier.fillMaxSize()) {
                                if (wideLayout && !settings && infoPage == null && selectedRule == null && selectedSearchQuestion == null && !quizPresented && !studyAll) {
                                    NavigationRail(modifier = Modifier.padding(insets).widthIn(max = 760.dp)) {
                                        listOf(
                                            Destination.Home to (app.text("navigation.home") to Icons.Default.Home),
                                            Destination.Practice to (app.text("native.practice") to Icons.Default.Bolt),
                                            Destination.Rules to (app.text("navigation.rules") to Icons.Default.Book),
                                            Destination.Search to (app.text("navigation.search") to Icons.Default.Search),
                                        ).forEach { (item, pair) ->
                                            NavigationRailItem(selected = destination == item, onClick = {
                                                if (destination != item) { answers.clear(); revealed.clear(); practiceScore = null }
                                                destination = item
                                            }, icon = { Icon(pair.second, null) }, label = { Text(pair.first) }, alwaysShowLabel = true, colors = NavigationRailItemDefaults.colors(selectedIconColor = Brand.blue(), selectedTextColor = Brand.blue(), indicatorColor = Brand.blue().copy(alpha = .10f)))
                                        }
                                    }
                                }
                                Box(Modifier.weight(1f).fillMaxSize(), contentAlignment = Alignment.TopCenter) { when {
                                infoPage != null -> InformationScreen(app, infoPage!!, modifier = Modifier.padding(insets).widthIn(max = 760.dp))
                                settings -> SettingsScreen(app, locale, appearance, onLanguage = { locale = it }, onAppearance = { appearance = it }, onInfo = { infoPage = it }, modifier = Modifier.padding(insets).widthIn(max = 760.dp))
                                quizPresented && quiz != null -> QuizScreen(app, quiz!!, onUpdate = { quiz = it }, onNewQuiz = { quiz = null; quizPresented = false; destination = Destination.Home }, onRule = { selectedRule = it; quizPresented = false; answers.clear(); revealed.clear(); practiceScore = null }, modifier = Modifier.padding(insets).widthIn(max = 760.dp))
                                selectedSearchQuestion != null -> PracticeScreen(
                                    app, listOf(selectedSearchQuestion!!), answers, revealed, practiceScore,
                                    onScore = { practiceScore = it },
                                    onSelect = { q, a -> val old = answers[q].orEmpty(); answers[q] = if (a in old) old - a else old + a; practiceScore = null },
                                    onReveal = { q -> val showing = revealed[q] != true; if (showing) { answers.clear(); practiceScore = null }; revealed[q] = showing },
                                    onReset = { answers.clear(); revealed.clear(); practiceScore = null },
                                    onRule = { rule -> selectedSearchQuestion = null; selectedRule = rule; answers.clear(); revealed.clear(); practiceScore = null }, modifier = Modifier.padding(insets).widthIn(max = 760.dp),
                                )
                                selectedRule != null -> PracticeScreen(
                                    app, app.questions.filter { it.ruleId == selectedRule!!.id }, answers, revealed,
                                    practiceScore, onScore = { practiceScore = it }, onSelect = { q, a -> answers[q] = (answers[q].orEmpty() + a).let { now -> if (a in answers[q].orEmpty()) now - a else now }; practiceScore = null },
                                    onReveal = { q -> val showing = revealed[q] != true; if (showing) { answers.clear(); practiceScore = null }; revealed[q] = showing },
                                    onReset = { answers.clear(); revealed.clear(); practiceScore = null }, onRule = { selectedRule = it; answers.clear(); revealed.clear(); practiceScore = null }, modifier = Modifier.padding(insets).widthIn(max = 760.dp),
                                )
                                destination == Destination.Home && !studyAll -> HomeScreen(app, quizCount, timed, quiz, { quizCount = it }, { timed = it },
                                    onQuiz = { timerNow = System.currentTimeMillis(); quiz = freshQuiz(app.questions, quizCount, timed, locale); quizPresented = true },
                                    onResume = { quizPresented = true }, onDiscard = { confirmQuizExit = true },
                                    onRules = { destination = Destination.Rules }, onPractice = { studyAll = true }, modifier = Modifier.padding(insets).widthIn(max = 760.dp))
                                destination == Destination.Practice && !studyAll -> PracticeHomeScreen(app, quizCount, timed, quiz, { quizCount = it }, { timed = it },
                                    onQuiz = { timerNow = System.currentTimeMillis(); quiz = freshQuiz(app.questions, quizCount, timed, locale); quizPresented = true },
                                    onResume = { quizPresented = true }, onDiscard = { confirmQuizExit = true },
                                    onRules = { destination = Destination.Rules }, onPractice = { studyAll = true }, modifier = Modifier.padding(insets).widthIn(max = 760.dp))
                                destination == Destination.Rules && !studyAll -> RulesScreen(app, onRule = { answers.clear(); revealed.clear(); practiceScore = null; selectedRule = it }, modifier = Modifier.padding(insets).widthIn(max = 760.dp))
                                destination == Destination.Search && !studyAll -> SearchScreen(app, query, { query = it }, { selectedSearchQuestion = it }, modifier = Modifier.padding(insets).widthIn(max = 760.dp))
                                else -> PracticeScreen(
                                    app, app.questions, answers, revealed, practiceScore,
                                    onScore = { practiceScore = it },
                                    onSelect = { q, a -> val old = answers[q].orEmpty(); answers[q] = if (a in old) old - a else old + a; practiceScore = null },
                                    onReveal = { q -> val showing = revealed[q] != true; if (showing) { answers.clear(); practiceScore = null }; revealed[q] = showing },
                                    onReset = { answers.clear(); revealed.clear(); practiceScore = null }, onRule = { selectedRule = it; answers.clear(); revealed.clear(); practiceScore = null }, modifier = Modifier.padding(insets).widthIn(max = 760.dp),
                                )
                                } }
                            }
                        }
                        if (confirmQuizExit) AlertDialog(
                            onDismissRequest = { confirmQuizExit = false },
                            title = { Text(app.text("quiz.leave_title")) },
                            text = { Text(app.text("quiz.leave_warning")) },
                            confirmButton = { TextButton(onClick = { confirmQuizExit = false; quiz = null; quizPresented = false }) { Text(app.text("quiz.leave_confirm")) } },
                            dismissButton = { TextButton(onClick = { confirmQuizExit = false }) { Text(app.text("quiz.leave_cancel")) } },
                        )
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

internal fun AppContent.text(key: String): String = strings[key] ?: key
internal fun AppContent.text(key: String, values: Map<String, String>): String = values.entries.fold(text(key)) { current, entry -> current.replace("{{${entry.key}}}", entry.value) }

@Composable private fun LoadingScreen() = Column(Modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) { CircularProgressIndicator(); Spacer(Modifier.height(14.dp)); Text("Handball Rules Quiz") }
@Composable private fun ErrorScreen(detail: String) = Column(Modifier.fillMaxSize().padding(28.dp), verticalArrangement = Arrangement.Center) { Text("Handball Rules Quiz", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold); Spacer(Modifier.height(10.dp)); Text(detail) }

private fun freshQuiz(questions: List<Question>, count: Int, timed: Boolean, language: String): QuizState {
    val selected = questions.shuffled().take(count).map { it.copy(answers = it.answers.shuffled()) }
    val start = System.currentTimeMillis()
    return QuizState(selected, emptyMap(), 0, start, if (timed) start + selected.size * 90_000L else null, null, language)
}

@Composable
private fun HomeScreen(app: AppContent, count: Int, timed: Boolean, session: QuizState?, onCount: (Int) -> Unit, onTimed: (Boolean) -> Unit,
    onQuiz: () -> Unit, onResume: () -> Unit, onDiscard: () -> Unit, onRules: () -> Unit, onPractice: () -> Unit, modifier: Modifier = Modifier) {
    val courtMotion = rememberInfiniteTransition(label = "home-court-motion")
    val motionAllowed = remember { Build.VERSION.SDK_INT < 26 || ValueAnimator.areAnimatorsEnabled() }
    val offset by courtMotion.animateFloat(-6f, 6f, infiniteRepeatable(tween(2200), RepeatMode.Reverse), label = "court-offset")
    Column(modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp), verticalArrangement = Arrangement.spacedBy(25.dp)) {
        Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(31.dp)).background(Brush.linearGradient(listOf(Brand.buttonBlue, Brand.heroNavy))).padding(24.dp), verticalAlignment = Alignment.Top) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(11.dp)) {
                Text(app.text("native.hero_eyebrow"), fontSize = 11.sp, letterSpacing = 1.2.sp, color = Color.White.copy(alpha = .76f), fontWeight = FontWeight.SemiBold)
                Text(app.text("native.hero_title"), fontSize = 34.sp, lineHeight = 40.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
            }
            if (LocalConfiguration.current.fontScale < 1.5f) Box(Modifier.width(90.dp).height(136.dp).padding(start = 12.dp), contentAlignment = Alignment.Center) {
                CourtArtwork(Modifier.width(68.dp).offset(y = (if (motionAllowed) offset else 0f).dp), height = 136.dp)
            }
        }
        QuizSetupSection(app, count, timed, session, onCount, onTimed, onQuiz, onResume, onDiscard)
        SectionHeading(app.text("native.explore"), app.text("native.explore_detail"))
        Row(Modifier.height(IntrinsicSize.Min), horizontalArrangement = Arrangement.spacedBy(14.dp)) {
            FeatureTile(app.text("native.study"), app.text("native.questions", mapOf("count" to app.questions.size.toString())), Icons.Default.Layers, Brand.navy(), onPractice, Modifier.weight(1f).fillMaxHeight())
            FeatureTile(app.text("rules.title"), app.text("native.rule_count", mapOf("count" to app.rules.size.toString())), Icons.Default.Book, Brand.gold(), onRules, Modifier.weight(1f).fillMaxHeight())
        }
        Row(Modifier.padding(horizontal = 5.dp), horizontalArrangement = Arrangement.spacedBy(11.dp)) {
            Icon(Icons.Default.Inventory2, null, Modifier.size(18.dp), tint = Brand.blue())
            Column(verticalArrangement = Arrangement.spacedBy(5.dp)) {
                Text(app.text("native.content"), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Text(app.repository.edition(app.locale), fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
        Text("${app.text("native.version")} ${BuildConfig.VERSION_NAME} (${BuildConfig.VERSION_CODE})", Modifier.align(Alignment.CenterHorizontally), fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
private fun PracticeHomeScreen(app: AppContent, count: Int, timed: Boolean, session: QuizState?, onCount: (Int) -> Unit, onTimed: (Boolean) -> Unit,
    onQuiz: () -> Unit, onResume: () -> Unit, onDiscard: () -> Unit, onRules: () -> Unit, onPractice: () -> Unit, modifier: Modifier = Modifier) {
    Column(modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp), verticalArrangement = Arrangement.spacedBy(24.dp)) {
        SectionHeading(app.text("native.practice_title"), app.text("native.practice_detail"))
        QuizSetupSection(app, count, timed, session, onCount, onTimed, onQuiz, onResume, onDiscard)
        FeatureTile(app.text("native.study"), app.text("questions.description"), Icons.Default.Layers, Brand.navy(), onPractice)
        FeatureTile(app.text("rules.title"), app.text("rule.description"), Icons.Default.Book, Brand.gold(), onRules)
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
    Column(modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp), verticalArrangement = Arrangement.spacedBy(22.dp)) {
        if (privacy) {
            Text(app.text("info.privacy.updated"), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(app.text("info.privacy.intro"), style = MaterialTheme.typography.bodyLarge)
        } else {
            Text(app.text("info.support.intro"), style = MaterialTheme.typography.bodyLarge)
        }
        sections.forEach { (heading, body) ->
            PaperCard {
                Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(13.dp)) {
                    Text(app.text(heading), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    Text(app.text(body), fontSize = 17.sp, lineHeight = 24.sp)
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
