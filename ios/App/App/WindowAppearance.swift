import SwiftUI
import UIKit

// A window override covers native sheets as well as the main SwiftUI hierarchy.
// Clearing it explicitly lets UIKit follow system changes again after Light/Dark.
@MainActor
struct WindowAppearance: UIViewRepresentable {
    let mode: String

    func makeUIView(context: Context) -> AppearanceView {
        let view = AppearanceView(frame: .zero)
        view.isUserInteractionEnabled = false
        view.isAccessibilityElement = false
        return view
    }

    func updateUIView(_ view: AppearanceView, context: Context) {
        switch mode {
        case "light": view.style = .light
        case "dark": view.style = .dark
        default: view.style = .unspecified
        }
    }

    final class AppearanceView: UIView {
        var style: UIUserInterfaceStyle = .unspecified {
            didSet { applyStyle() }
        }

        override func didMoveToWindow() {
            super.didMoveToWindow()
            applyStyle()
        }

        private func applyStyle() {
            guard let window = window, window.overrideUserInterfaceStyle != style else { return }
            window.overrideUserInterfaceStyle = style
        }
    }
}
