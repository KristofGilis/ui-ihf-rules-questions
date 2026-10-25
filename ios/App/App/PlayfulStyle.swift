import SwiftUI

enum Playful {
    static let buttonBlue = Color(red: 0.19, green: 0.30, blue: 0.91)
    static let ball = Color(red: 1, green: 0.53, blue: 0.24)
    static let blue = Color(UIColor { $0.userInterfaceStyle == .dark
        ? UIColor(red: 0.57, green: 0.64, blue: 1, alpha: 1) : UIColor(red: 0.19, green: 0.30, blue: 0.91, alpha: 1) })
    static let orange = Color(UIColor { $0.userInterfaceStyle == .dark
        ? UIColor(red: 0.99, green: 0.62, blue: 0.30, alpha: 1) : UIColor(red: 0.77, green: 0.30, blue: 0.08, alpha: 1) })
    static let mint = Color(UIColor { $0.userInterfaceStyle == .dark
        ? UIColor(red: 0.43, green: 0.83, blue: 0.64, alpha: 1) : UIColor(red: 0.10, green: 0.46, blue: 0.31, alpha: 1) })
    static let purple = Color(UIColor { $0.userInterfaceStyle == .dark
        ? UIColor(red: 0.74, green: 0.61, blue: 0.99, alpha: 1) : UIColor(red: 0.48, green: 0.27, blue: 0.76, alpha: 1) })
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

struct HandballMark: View {
    var body: some View {
        ZStack {
            Circle().fill(Playful.ball)
            Circle().stroke(Color.black.opacity(0.17), lineWidth: 2).padding(7)
            GeometryReader { geometry in
                let size = geometry.size.width
                Path { path in
                    path.move(to: CGPoint(x: size * 0.17, y: size * 0.12))
                    path.addCurve(to: CGPoint(x: size * 0.83, y: size * 0.88), control1: CGPoint(x: size * 0.77, y: size * 0.19), control2: CGPoint(x: size * 0.23, y: size * 0.81))
                    path.move(to: CGPoint(x: size * 0.08, y: size * 0.65))
                    path.addCurve(to: CGPoint(x: size * 0.92, y: size * 0.35), control1: CGPoint(x: size * 0.30, y: size * 0.23), control2: CGPoint(x: size * 0.70, y: size * 0.77))
                    path.move(to: CGPoint(x: size * 0.34, y: size * 0.04))
                    path.addCurve(to: CGPoint(x: size * 0.66, y: size * 0.96), control1: CGPoint(x: size * 0.07, y: size * 0.54), control2: CGPoint(x: size * 0.93, y: size * 0.46))
                }.stroke(Color(red: 0.31, green: 0.15, blue: 0.10).opacity(0.63), style: StrokeStyle(lineWidth: max(1.5, size * 0.018), lineCap: .round))
            }.clipShape(Circle())
            Circle().fill(Color.white.opacity(0.24)).frame(width: 20, height: 12).offset(x: -14, y: -20).blur(radius: 6)
        }.aspectRatio(1, contentMode: .fit).accessibilityHidden(true)
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
                .foregroundColor(Playful.purple).frame(width: 88, height: 88)
                .background(Playful.purple.opacity(0.10)).clipShape(RoundedRectangle(cornerRadius: 30))
                .rotationEffect(.degrees(-7)).accessibilityHidden(true)
            Text(title).font(.system(.title2, design: .rounded).weight(.bold))
            Text(detail).font(.subheadline).foregroundStyle(.secondary).multilineTextAlignment(.center)
        }.frame(maxWidth: .infinity).padding(.horizontal, 25).padding(.vertical, 42)
    }
}
