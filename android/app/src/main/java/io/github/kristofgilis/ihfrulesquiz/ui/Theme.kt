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
private val Gold = Color(0xFFB78D15)

@Composable
fun HandballTheme(appearance: String, content: @Composable () -> Unit) {
    val dark = when (appearance) {
        "dark" -> true
        "light" -> false
        else -> isSystemInDarkTheme()
    }
    val scheme = if (dark) darkColorScheme(
        primary = Color(0xFF82B9F2), secondary = Color(0xFFE8C969), tertiary = Color(0xFF79D3A3),
        primaryContainer = Color(0xFF203E61), onPrimaryContainer = Color(0xFFDCEAF8),
        secondaryContainer = Color(0xFF203E61), onSecondaryContainer = Color(0xFFDCEAF8),
        background = Color(0xFF111722), surface = Color(0xFF1B2431), surfaceVariant = Color(0xFF263345),
        surfaceContainerLowest = Color(0xFF0C121C), surfaceContainerLow = Color(0xFF161E2A),
        surfaceContainer = Color(0xFF1B2431), surfaceContainerHigh = Color(0xFF222E3D),
        surfaceContainerHighest = Color(0xFF2A3849), surfaceTint = Color(0xFF82B9F2),
    ) else lightColorScheme(
        primary = Navy, secondary = Gold, tertiary = Color(0xFF16764F),
        primaryContainer = Color(0xFFDCEAF8), onPrimaryContainer = Navy,
        secondaryContainer = Color(0xFFDCEAF8), onSecondaryContainer = Navy,
        background = Color(0xFFF4F6FA), surface = Color.White, surfaceVariant = Color(0xFFEAF1F8),
        surfaceContainerLowest = Color.White, surfaceContainerLow = Color(0xFFF0F4F9),
        surfaceContainer = Color(0xFFEAF1F8), surfaceContainerHigh = Color(0xFFE1EAF4),
        surfaceContainerHighest = Color(0xFFD8E3EF), surfaceTint = Navy,
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
