package io.github.kristofgilis.ihfrulesquiz.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/** Top-down court drawn from a single 20 × 40 m scale, matching the iOS home illustration. */
@Composable
fun CourtArtwork(modifier: Modifier = Modifier, height: Dp = 238.dp) {
    Canvas(modifier.height(height)) {
        val scale = minOf(size.width / 22f, size.height / 44f)
        val left = (size.width - 20f * scale) / 2f
        val top = (size.height - 40f * scale) / 2f
        fun x(metres: Float) = left + metres * scale
        fun y(metres: Float) = top + metres * scale
        val line = Color.White.copy(alpha = 0.85f)
        val goalFill = Color(0xFF3C80C1).copy(alpha = 0.28f)
        val boundary = Stroke(width = 1.25.dp.toPx())

        drawRoundRect(Color.White.copy(alpha = 0.055f), topLeft = Offset(0f, 0f), size = Size(size.width, size.height),
            cornerRadius = androidx.compose.ui.geometry.CornerRadius(12.dp.toPx()))

        fun goalArea(end: Float, radius: Float, close: Boolean = true): Path {
            val path = Path()
            if (end == 0f) {
                path.moveTo(x(8.5f - radius), y(0f))
                path.arcTo(Rect(x(8.5f - radius), y(-radius), x(8.5f + radius), y(radius)), 180f, -90f, false)
                path.lineTo(x(11.5f), y(radius))
                path.arcTo(Rect(x(11.5f - radius), y(-radius), x(11.5f + radius), y(radius)), 90f, -90f, false)
            } else {
                path.moveTo(x(8.5f - radius), y(40f))
                path.arcTo(Rect(x(8.5f - radius), y(40f - radius), x(8.5f + radius), y(40f + radius)), 180f, 90f, false)
                path.lineTo(x(11.5f), y(40f - radius))
                path.arcTo(Rect(x(11.5f - radius), y(40f - radius), x(11.5f + radius), y(40f + radius)), 270f, 90f, false)
            }
            if (close) path.close()
            return path
        }
        drawPath(goalArea(0f, 6f), goalFill)
        drawPath(goalArea(40f, 6f), goalFill)
        drawCircle(goalFill, radius = 2f * scale, center = Offset(x(10f), y(20f)))

        drawRect(line, topLeft = Offset(x(0f), y(0f)), size = Size(20f * scale, 40f * scale), style = boundary)
        drawCircle(line, radius = 2f * scale, center = Offset(x(10f), y(20f)), style = boundary)
        drawLine(line, Offset(x(0f), y(20f)), Offset(x(8f), y(20f)), strokeWidth = 1.6.dp.toPx())
        drawLine(line, Offset(x(12f), y(20f)), Offset(x(20f), y(20f)), strokeWidth = 1.6.dp.toPx())

        val sixTop = goalArea(0f, 6f)
        drawPath(sixTop, line, style = Stroke(width = 1.6.dp.toPx()))
        val sixBottom = goalArea(40f, 6f)
        drawPath(sixBottom, line, style = Stroke(width = 1.6.dp.toPx()))

        val nineDash = Stroke(width = 1.dp.toPx(), pathEffect = PathEffect.dashPathEffect(floatArrayOf(2.dp.toPx(), 2.dp.toPx())))
        drawPath(goalArea(0f, 9f, close = false), line.copy(alpha = 0.58f), style = nineDash)
        drawPath(goalArea(40f, 9f, close = false), line.copy(alpha = 0.58f), style = nineDash)

        listOf(7f, 33f).forEach { position -> drawLine(line, Offset(x(9.5f), y(position)), Offset(x(10.5f), y(position)), 2.dp.toPx()) }
        listOf(4f, 36f).forEach { position -> drawLine(line, Offset(x(9.925f), y(position)), Offset(x(10.075f), y(position)), 2.dp.toPx()) }

        // Goal mouths are 3 m wide with shallow nets extending behind each end line.
        listOf(0f, 40f).forEach { end ->
            val goalY = if (end == 0f) y(-0.8f) else y(40f)
            drawRect(Color(0xFFB78D15), Offset(x(8.5f), goalY), Size(3f * scale, 0.8f * scale), style = boundary)
            drawLine(line, Offset(x(8.5f), y(end)), Offset(x(8.5f), goalY), 1.5.dp.toPx())
            drawLine(line, Offset(x(11.5f), y(end)), Offset(x(11.5f), goalY), 1.5.dp.toPx())
        }
    }
}
