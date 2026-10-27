package io.github.kristofgilis.ihfrulesquiz

import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import io.github.kristofgilis.ihfrulesquiz.ui.HandballRulesApp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent { HandballRulesApp() }
    }
}
