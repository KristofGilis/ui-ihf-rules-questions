package io.github.kristofgilis.ihfrulesquiz.ui

import android.app.Activity
import androidx.core.view.WindowCompat
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalView

private val Navy = Color(0xFF00206D)

@Composable
fun HandballTheme(appearance: String, content: @Composable () -> Unit) {
    val dark = when (appearance) {
        "dark" -> true
        "light" -> false
        else -> isSystemInDarkTheme()
    }
    val scheme = if (dark) darkColorScheme(
        primary = Color(0xFF7ABAF5), secondary = Color(0xFFE8C259), tertiary = Color(0xFF6ED4A3),
        primaryContainer = Color(0xFF203E61), onPrimaryContainer = Color(0xFFDCEAF8),
        secondaryContainer = Color(0xFF203E61), onSecondaryContainer = Color(0xFFDCEAF8),
        background = Color.Black, onBackground = Color.White, surface = Color(0xFF1C1C1E),
        onSurface = Color.White, onSurfaceVariant = Color(0xFF98989F), surfaceVariant = Color(0xFF2C2C2E),
        surfaceContainerLowest = Color.Black, surfaceContainerLow = Color(0xFF161618),
        surfaceContainer = Color(0xFF1C1C1E), surfaceContainerHigh = Color(0xFF242426),
        surfaceContainerHighest = Color(0xFF2C2C2E), surfaceTint = Color(0xFF7ABAF5),
    ) else lightColorScheme(
        primary = Color(0xFF266397), secondary = Color(0xFF8A690F), tertiary = Color(0xFF1A754F),
        primaryContainer = Color(0xFFDCEAF8), onPrimaryContainer = Navy,
        secondaryContainer = Color(0xFFDCEAF8), onSecondaryContainer = Navy,
        background = Color(0xFFF2F2F7), onBackground = Color.Black, surface = Color.White,
        onSurface = Color.Black, onSurfaceVariant = Color(0xFF6C6C70), surfaceVariant = Color(0xFFF2F2F7),
        surfaceContainerLowest = Color.White, surfaceContainerLow = Color(0xFFF2F2F7),
        surfaceContainer = Color(0xFFF2F2F7), surfaceContainerHigh = Color(0xFFE8E8ED),
        surfaceContainerHighest = Color(0xFFDEDEE3), surfaceTint = Color(0xFF266397),
    )
    MaterialTheme(colorScheme = scheme) {
        val view = LocalView.current
        val window = (view.context as? Activity)?.window
        SideEffect {
            if (window != null) {
                val controller = WindowCompat.getInsetsController(window, view)
                controller.isAppearanceLightStatusBars = !dark
                controller.isAppearanceLightNavigationBars = !dark
            }
        }
        content()
    }
}
