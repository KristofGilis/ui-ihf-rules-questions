import SwiftUI

enum Playful {
    // IHF website: navy #00206D, blue #3C80C1, gold #B78D15.
    // Text accents adapt for contrast; filled controls use the deeper IHF blue.
    static let buttonBlue = Color(red: 32 / 255, green: 71 / 255, blue: 162 / 255)
    static let heroNavy = Color(red: 0, green: 32 / 255, blue: 109 / 255)
    static let brandBlue = Color(red: 60 / 255, green: 128 / 255, blue: 193 / 255)
    static let ball = Color(red: 183 / 255, green: 141 / 255, blue: 21 / 255)
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

struct HandballMark: View {
    var body: some View {
        ZStack {
            Circle().fill(Color(red: 0.98, green: 0.95, blue: 0.87))
            GeometryReader { geometry in
                let size = geometry.size.width
                let center = CGPoint(x: size * 0.5, y: size * 0.5)
                let points = (0..<5).map { index -> CGPoint in
                    let angle = -Double.pi / 2 + Double(index) * Double.pi * 2 / 5
                    return CGPoint(x: center.x + cos(angle) * size * 0.23, y: center.y + sin(angle) * size * 0.23)
                }
                ForEach(0..<5, id: \.self) { index in
                    let a = points[index]
                    let b = points[(index + 1) % 5]
                    let angle = -Double.pi / 2 + (Double(index) + 0.5) * Double.pi * 2 / 5
                    let dx = CGFloat(cos(angle)), dy = CGFloat(sin(angle))
                    let outer = CGPoint(x: center.x + dx * size * 0.51, y: center.y + dy * size * 0.51)
                    let panel = polygon([a, b,
                        CGPoint(x: b.x + dx * size * 0.17, y: b.y + dy * size * 0.17),
                        CGPoint(x: outer.x - dy * size * 0.16, y: outer.y + dx * size * 0.16),
                        CGPoint(x: outer.x + dy * size * 0.16, y: outer.y - dx * size * 0.16),
                        CGPoint(x: a.x + dx * size * 0.17, y: a.y + dy * size * 0.17)])
                    panel.fill(index % 2 == 0 ? Playful.ball : Playful.heroNavy)
                    panel.stroke(Color(red: 0.10, green: 0.18, blue: 0.28).opacity(0.7), lineWidth: size * 0.013)
                    panel.stroke(Color.white.opacity(0.8), style: StrokeStyle(lineWidth: size * 0.006, dash: [size * 0.019, size * 0.018]))
                }
                polygon(points).fill(Playful.brandBlue)
                polygon(points).stroke(Color(red: 0.10, green: 0.18, blue: 0.28), lineWidth: size * 0.018)
                polygon(points).stroke(Color.white.opacity(0.8), style: StrokeStyle(lineWidth: size * 0.006, dash: [size * 0.019, size * 0.018]))
            }.clipShape(Circle())
            Circle().fill(RadialGradient(colors: [.white.opacity(0.30), .clear, .black.opacity(0.16)], center: .topLeading, startRadius: 0, endRadius: 100))
            Circle().strokeBorder(Color.white.opacity(0.3), lineWidth: 1)
        }.aspectRatio(1, contentMode: .fit).accessibilityHidden(true)
    }

    private func polygon(_ points: [CGPoint]) -> Path {
        Path { path in
            if let first = points.first {
                path.move(to: first)
                for point in points.dropFirst() { path.addLine(to: point) }
                path.closeSubpath()
            }
        }
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
