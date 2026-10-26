import SwiftUI

enum Playful {
    // IHF website: navy #00206D, blue #3C80C1, gold #B78D15.
    // Text accents adapt for contrast; filled controls use the deeper IHF blue.
    static let buttonBlue = Color(red: 32 / 255, green: 71 / 255, blue: 162 / 255)
    static let heroNavy = Color(red: 0, green: 32 / 255, blue: 109 / 255)
    static let brandBlue = Color(red: 60 / 255, green: 128 / 255, blue: 193 / 255)
    static let blue = Color(UIColor { $0.userInterfaceStyle == .dark
        ? UIColor(red: 0.48, green: 0.73, blue: 0.96, alpha: 1) : UIColor(red: 0.15, green: 0.39, blue: 0.59, alpha: 1) })
    static let gold = Color(UIColor { $0.userInterfaceStyle == .dark
        ? UIColor(red: 0.91, green: 0.76, blue: 0.35, alpha: 1) : UIColor(red: 0.54, green: 0.41, blue: 0.06, alpha: 1) })
    static let success = Color(UIColor { $0.userInterfaceStyle == .dark
        ? UIColor(red: 0.43, green: 0.83, blue: 0.64, alpha: 1) : UIColor(red: 0.10, green: 0.46, blue: 0.31, alpha: 1) })
    static let navy = Color(UIColor { $0.userInterfaceStyle == .dark
        ? UIColor(red: 0.64, green: 0.75, blue: 0.98, alpha: 1) : UIColor(red: 0, green: 32 / 255, blue: 109 / 255, alpha: 1) })
    static let paper = Color(UIColor.secondarySystemGroupedBackground)
    static let background = Color(UIColor.systemGroupedBackground)
    static let spring = Animation.spring(response: 0.34, dampingFraction: 0.72)
}

struct PlayfulBackground: View {
    var body: some View { Playful.background.ignoresSafeArea() }
}

struct PaperCard<Content: View>: View {
    let tint: Color?
    let content: Content
    init(tint: Color? = nil, @ViewBuilder content: () -> Content) {
        self.tint = tint
        self.content = content()
    }
    var body: some View {
        content.padding(20)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(tint?.opacity(0.09) ?? Playful.paper)
            .clipShape(RoundedRectangle(cornerRadius: 26, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 26, style: .continuous).strokeBorder(Color.primary.opacity(0.045), lineWidth: 1))
    }
}

struct PressableStyle: ButtonStyle {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    var filled = false
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .opacity(configuration.isPressed ? 0.84 : 1)
            .scaleEffect(configuration.isPressed && !reduceMotion ? 0.97 : 1)
            .animation(reduceMotion ? nil : Playful.spring, value: configuration.isPressed)
    }
}

struct PrimaryAction: View {
    let title: String
    var symbol = "arrow.right"
    var color = Playful.buttonBlue
    var action: () -> Void
    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Text(title).font(.system(.headline, design: .rounded).weight(.bold))
                    .multilineTextAlignment(.leading)
                Spacer(minLength: 4)
                Image(systemName: symbol).font(.headline.weight(.bold))
            }.foregroundColor(.white).padding(.horizontal, 22).padding(.vertical, 19)
                .background(color).clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        }.buttonStyle(PressableStyle())
    }
}

struct TinyBadge: View {
    let title: String
    var symbol: String? = nil
    var color: Color = Playful.blue
    var body: some View {
        HStack(spacing: 6) {
            if let symbol = symbol { Image(systemName: symbol) }
            Text(title)
        }.font(.system(.caption, design: .rounded).weight(.bold))
            .foregroundColor(color).padding(.horizontal, 11).padding(.vertical, 7)
            .background(color.opacity(0.10)).clipShape(Capsule())
    }
}

struct SectionHeading: View {
    let title: String
    var detail: String? = nil
    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(title).font(.system(.title2, design: .rounded).weight(.heavy))
                .accessibilityAddTraits(.isHeader)
            if let detail = detail { Text(detail).font(.subheadline).foregroundStyle(.secondary) }
        }.frame(maxWidth: .infinity, alignment: .leading)
    }
}

// All positions use metres from IHF Rule 1 (1 July 2025), with one uniform scale.
// The canvas includes 1 m beside each sideline and 2 m behind each goal line.
struct HandballCourtGeometry {
    let scale: CGFloat
    let origin: CGPoint

    init(in bounds: CGRect) {
        scale = min(bounds.width / 22, bounds.height / 44)
        origin = CGPoint(x: bounds.midX - 10 * scale, y: bounds.midY - 20 * scale)
    }

    var court: CGRect {
        CGRect(x: origin.x, y: origin.y, width: 20 * scale, height: 40 * scale)
    }

    func point(_ x: CGFloat, _ y: CGFloat, bottom: Bool = false) -> CGPoint {
        CGPoint(x: origin.x + x * scale, y: origin.y + (bottom ? 40 - y : y) * scale)
    }

    func goalArea(radius: CGFloat, bottom: Bool = false) -> Path {
        // 6 m arcs start on the end line; 9 m arcs intersect the sidelines.
        // The centres are the inner goalpost corners, 3 m apart.
        let edgeAngle = acos(Double(min(1, 8.5 / radius)))
        var path = Path()
        path.addArc(center: CGPoint(x: 8.5, y: 0), radius: radius,
                    startAngle: .radians(.pi - edgeAngle), endAngle: .degrees(90), clockwise: true)
        path.addLine(to: CGPoint(x: 11.5, y: radius))
        path.addArc(center: CGPoint(x: 11.5, y: 0), radius: radius,
                    startAngle: .degrees(90), endAngle: .radians(edgeAngle), clockwise: true)
        return path.applying(CGAffineTransform(a: scale, b: 0, c: 0, d: bottom ? -scale : scale,
                                              tx: origin.x, ty: origin.y + (bottom ? 40 * scale : 0)))
    }

    var markings: Path {
        Path { path in
            path.addRect(court)
            path.move(to: point(0, 20))
            path.addLine(to: point(8, 20))
            path.move(to: point(12, 20))
            path.addLine(to: point(20, 20))
            path.addEllipse(in: CGRect(x: point(8, 18).x, y: point(8, 18).y, width: 4 * scale, height: 4 * scale))
            for bottom in [false, true] {
                // Goal mouth: 3 m. The net is shown from above, outside the end line.
                path.move(to: point(8.5, 0, bottom: bottom))
                path.addLine(to: point(8.5, -1, bottom: bottom))
                path.addLine(to: point(11.5, -1, bottom: bottom))
                path.addLine(to: point(11.5, 0, bottom: bottom))
                path.addPath(goalArea(radius: 6, bottom: bottom))
                path.move(to: point(9.5, 7, bottom: bottom))
                path.addLine(to: point(10.5, 7, bottom: bottom))
                path.move(to: point(9.925, 4, bottom: bottom))
                path.addLine(to: point(10.075, 4, bottom: bottom))
                path.move(to: point(-0.15, 15.5, bottom: bottom))
                path.addLine(to: point(0.15, 15.5, bottom: bottom))
            }
        }
    }

    var freeThrowLines: Path {
        var path = goalArea(radius: 9)
        path.addPath(goalArea(radius: 9, bottom: true))
        return path
    }
}

struct HandballCourtMark: View {
    var body: some View {
        GeometryReader { reader in
            let geometry = HandballCourtGeometry(in: CGRect(origin: .zero, size: reader.size))
            // Enlarge only line weight and dash cadence for legibility at icon size.
            // Court, goals, circles and distances all share the same metre scale.
            let line = max(0.7, geometry.scale * 0.05)
            ZStack {
                RoundedRectangle(cornerRadius: 12).fill(Color.white.opacity(0.07))
                geometry.markings.stroke(Color.white.opacity(0.85), style: StrokeStyle(lineWidth: line, lineCap: .butt, lineJoin: .miter))
                geometry.freeThrowLines.stroke(Color.white.opacity(0.55), style: StrokeStyle(lineWidth: line, dash: [2, 2]))
            }
        }.aspectRatio(0.5, contentMode: .fit).accessibilityHidden(true)
    }
}

struct FeatureTile: View {
    let title: String
    let detail: String
    let symbol: String
    let color: Color
    var body: some View {
        PaperCard(tint: color) {
            VStack(alignment: .leading, spacing: 15) {
                HStack {
                    Image(systemName: symbol).font(.title2.weight(.semibold)).foregroundColor(color)
                        .frame(width: 44, height: 44).background(color.opacity(0.13)).clipShape(RoundedRectangle(cornerRadius: 14))
                    Spacer()
                    Image(systemName: "arrow.up.right").font(.subheadline.bold()).foregroundColor(color)
                }
                Text(title).font(.system(.headline, design: .rounded).weight(.bold)).foregroundColor(.primary)
                    .fixedSize(horizontal: false, vertical: true)
                Text(detail).font(.caption).foregroundStyle(.secondary).fixedSize(horizontal: false, vertical: true)
            }
        }
    }
}

struct EmptyPlayState: View {
    let title: String
    let detail: String
    var symbol = "magnifyingglass"
    var body: some View {
        VStack(spacing: 17) {
            Image(systemName: symbol).font(.system(size: 34, weight: .semibold))
                .foregroundColor(Playful.navy).frame(width: 88, height: 88)
                .background(Playful.navy.opacity(0.10)).clipShape(RoundedRectangle(cornerRadius: 30))
                .rotationEffect(.degrees(-7)).accessibilityHidden(true)
            Text(title).font(.system(.title2, design: .rounded).weight(.bold))
            Text(detail).font(.subheadline).foregroundStyle(.secondary).multilineTextAlignment(.center)
        }.frame(maxWidth: .infinity).padding(.horizontal, 25).padding(.vertical, 42)
    }
}
