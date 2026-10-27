package io.github.kristofgilis.ihfrulesquiz.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.luminance
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

internal object Brand {
    val buttonBlue = Color(0xFF2047A2)
    val heroNavy = Color(0xFF00206D)
    @Composable fun navy() = if (MaterialTheme.colorScheme.background.luminance() < .5f) Color(0xFFA3BFFA) else heroNavy
    @Composable fun blue() = MaterialTheme.colorScheme.primary
    @Composable fun gold() = MaterialTheme.colorScheme.secondary
}

@Composable
internal fun PaperCard(modifier: Modifier = Modifier, tint: Color? = null, content: @Composable ColumnScope.() -> Unit) {
    val shape = RoundedCornerShape(26.dp)
    Column(modifier.fillMaxWidth().clip(shape)
        .background(tint?.copy(alpha = .09f) ?: MaterialTheme.colorScheme.surface)
        .border(1.dp, MaterialTheme.colorScheme.onSurface.copy(alpha = .045f), shape).padding(20.dp), content = content)
}

@Composable
internal fun PrimaryAction(title: String, onClick: () -> Unit, modifier: Modifier = Modifier, icon: ImageVector = Icons.AutoMirrored.Filled.ArrowForward, enabled: Boolean = true) {
    Button(onClick, modifier.fillMaxWidth().heightIn(min = 58.dp), enabled = enabled, shape = RoundedCornerShape(20.dp),
        colors = ButtonDefaults.buttonColors(containerColor = Brand.buttonBlue, contentColor = Color.White),
        contentPadding = PaddingValues(horizontal = 22.dp, vertical = 18.dp)) {
        Text(title, Modifier.weight(1f), fontSize = 17.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.width(12.dp))
        Icon(icon, null, Modifier.size(22.dp))
    }
}

@Composable
internal fun SectionHeading(title: String, detail: String? = null) {
    Column(verticalArrangement = Arrangement.spacedBy(5.dp)) {
        Text(title, fontSize = 22.sp, fontWeight = FontWeight.ExtraBold)
        if (detail != null) Text(detail, fontSize = 15.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
internal fun TinyBadge(title: String, modifier: Modifier = Modifier, color: Color = Brand.blue(), icon: ImageVector? = null) {
    Row(modifier.clip(RoundedCornerShape(50)).background(color.copy(alpha = .10f)).padding(horizontal = 11.dp, vertical = 7.dp),
        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        if (icon != null) Icon(icon, null, Modifier.size(14.dp), tint = color)
        Text(title, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = color)
    }
}

@Composable
internal fun FeatureTile(title: String, detail: String, icon: ImageVector, color: Color, onClick: () -> Unit, modifier: Modifier = Modifier) {
    PaperCard(modifier.clickable(onClick = onClick), tint = color) {
        Column(verticalArrangement = Arrangement.spacedBy(15.dp)) {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(44.dp).clip(RoundedCornerShape(14.dp)).background(color.copy(alpha = .13f)), contentAlignment = Alignment.Center) {
                    Icon(icon, null, tint = color)
                }
                Spacer(Modifier.weight(1f))
                Icon(Icons.Default.NorthEast, null, Modifier.size(18.dp), tint = color)
            }
            Text(title, fontSize = 17.sp, fontWeight = FontWeight.Bold)
            Text(detail, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
internal fun QuizSetupSection(app: AppContent, count: Int, timed: Boolean, session: QuizState?, onCount: (Int) -> Unit, onTimed: (Boolean) -> Unit, onStart: () -> Unit, onResume: () -> Unit, onDiscard: () -> Unit) {
    PaperCard {
        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            Row(verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Box(Modifier.size(45.dp).clip(RoundedCornerShape(16.dp)).background(Brand.gold().copy(alpha = .12f)), contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.Bolt, null, tint = Brand.gold())
                }
                Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(app.text("home.quiz_card.title"), fontSize = 22.sp, fontWeight = FontWeight.ExtraBold)
                    Text(app.text("native.quiz_invite"), fontSize = 15.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            Text(app.text("home.quiz_card.count"), fontSize = 15.sp, fontWeight = FontWeight.Bold)
            Row(horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                listOf(10, 15, 20, 30).forEach { value ->
                    Button(onClick = { onCount(value) }, modifier = Modifier.weight(1f).heightIn(min = 52.dp).semantics { selected = count == value; contentDescription = app.text("native.questions", mapOf("count" to value.toString())) },
                        shape = RoundedCornerShape(17.dp), contentPadding = PaddingValues(vertical = 15.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = if (count == value) Brand.buttonBlue else MaterialTheme.colorScheme.background,
                            contentColor = if (count == value) Color.White else MaterialTheme.colorScheme.onSurface)) {
                        Text(value.toString(), fontSize = 20.sp, fontWeight = FontWeight.ExtraBold)
                    }
                }
            }
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Icon(if (timed) Icons.Default.Timer else Icons.Default.Schedule, null, tint = Brand.navy())
                Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                    Text(app.text("native.timed_label"), fontSize = 15.sp, fontWeight = FontWeight.Bold)
                    Text(app.text("native.timed_detail"), fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                Switch(timed, onTimed)
            }
            if (session == null) {
                PrimaryAction(app.text("home.quiz_card.button"), onStart, icon = Icons.Default.PlayArrow)
            } else {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
                    PrimaryAction(app.text(if (session.completedAt == null) "native.resume" else "native.review"), onResume, Modifier.weight(1f), Icons.Default.PlayArrow)
                    IconButton(onDiscard, Modifier.size(58.dp).clip(RoundedCornerShape(20.dp)).background(MaterialTheme.colorScheme.background)) {
                        Icon(Icons.Default.RestartAlt, app.text("native.discard"), tint = Brand.blue())
                    }
                }
            }
        }
    }
}
