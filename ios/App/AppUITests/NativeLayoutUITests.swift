import XCTest
import UIKit

final class NativeLayoutUITests: XCTestCase {
    @MainActor
    func testSettingsAppearanceReturnsToDarkSystemWithoutDismissingSheet() {
        continueAfterFailure = false
        let app = XCUIApplication()
        app.launchArguments = ["-ui-testing-reset", "-ui-testing-static-layout", "-native.language", "en", "-native.appearance", "system"]
        app.launch()
        XCTAssertTrue(app.buttons["settings.open"].waitForExistence(timeout: 15))
        app.buttons["settings.open"].tap()
        let settings = app.scrollViews["settings.page"]
        XCTAssertTrue(settings.waitForExistence(timeout: 5))
        let appearance = app.segmentedControls["settings.appearance"]
        XCTAssertTrue(appearance.buttons["System"].isSelected)
        let systemBrightness = averageBrightness(settings.screenshot())
        XCTAssertLessThan(systemBrightness, 0.45, "Run the simulator in system Dark appearance for this regression.")
        appearance.buttons["Light"].tap()
        XCTAssertGreaterThan(averageBrightness(settings.screenshot()), 0.65)
        appearance.buttons["System"].tap()
        XCTAssertLessThan(averageBrightness(settings.screenshot()), 0.45, "System must restore the device's dark appearance after forcing Light.")
        capture(app, "settings-system")
        appearance.buttons["Dark"].tap()
        XCTAssertLessThan(averageBrightness(settings.screenshot()), 0.45, "The open Settings sheet should switch to dark immediately.")
        capture(app, "settings-dark")
        appearance.buttons["Light"].tap()
        XCTAssertGreaterThan(averageBrightness(settings.screenshot()), 0.65, "The open Settings sheet should switch to light immediately.")
        capture(app, "settings-light")
        appearance.buttons["System"].tap()
        XCTAssertTrue(appearance.buttons["System"].isSelected)
        XCTAssertEqual(averageBrightness(settings.screenshot()), systemBrightness, accuracy: 0.15)
    }

    @MainActor
    func testStartingQuizDoesNotRevealDiscardControls() {
        continueAfterFailure = false
        let app = XCUIApplication()
        app.launchArguments = ["-ui-testing-reset", "-ui-testing-static-layout", "-ui-testing-hold-quiz-presentation",
                               "-native.language", "en", "-native.appearance", "light"]
        app.launch()
        let start = app.buttons["quiz.start"]
        XCTAssertTrue(start.waitForExistence(timeout: 15))
        start.tap()
        // Hold the cover closed to inspect the Home state normally visible only
        // during the first frames of presentation, after the session is created.
        XCTAssertTrue(start.exists)
        XCTAssertFalse(start.isEnabled, "Repeated taps should not create another quiz during presentation.")
        XCTAssertFalse(app.buttons["quiz.discard"].exists)
        XCTAssertFalse(app.buttons["quiz.resume"].exists)
        capture(app, "quiz-launch")
    }

    @MainActor
    func testCourtAnimationAdvances() {
        continueAfterFailure = false
        let app = XCUIApplication()
        app.launchArguments = ["-ui-testing-reset", "-native.language", "en", "-native.appearance", "light"]
        app.launch()
        let hero = app.otherElements["home.hero"]
        XCTAssertTrue(hero.waitForExistence(timeout: 15))
        var frames: [Data] = []
        for _ in 0..<3 {
            frames.append(hero.screenshot().pngRepresentation)
            Thread.sleep(forTimeInterval: 0.7)
        }
        // Capture only the hero so clocks and other system UI cannot fake motion.
        XCTAssertGreaterThan(Set(frames).count, 1, "The court should move while Home is visible.")
    }

    @MainActor
    func testPerfectPracticeScoreStaysOnOneLine() {
        continueAfterFailure = false
        let app = XCUIApplication()
        app.launchArguments = ["-ui-testing-reset", "-ui-testing-static-layout", "-native.language", "en", "-native.appearance", "light"]
        app.launch()
        XCTAssertTrue(app.buttons["quiz.start"].waitForExistence(timeout: 15))
        selectTab("Search", in: app)
        let example = app.buttons["search.example.1.1"]
        XCTAssertTrue(example.waitForExistence(timeout: 10), "The Search tab should finish appearing before choosing an example.")
        example.tap()
        let result = app.buttons["search.result.1.1"]
        XCTAssertTrue(result.waitForExistence(timeout: 5))
        result.tap()
        let answer = app.buttons["answer.1.1/a"]
        let calculate = app.buttons["practice.calculate"]
        XCTAssertTrue(answer.waitForExistence(timeout: 5))
        for _ in 0..<8 {
            if answer.isHittable && answer.frame.maxY < calculate.frame.minY - 8 { break }
            app.scrollViews.firstMatch.swipeUp()
        }
        answer.tap()
        XCTAssertEqual(answer.value as? String, "Selected")
        calculate.tap()
        let percentage = app.staticTexts["score.percentage"]
        XCTAssertTrue(percentage.waitForExistence(timeout: 5))
        XCTAssertEqual(percentage.label, "100.00%")
        let summary = app.otherElements["score.summary"]
        let compactWidth = app.frame.width < 600
        let aligned = XCTNSPredicateExpectation(predicate: NSPredicate { _, _ in
            guard summary.exists else { return false }
            let top = summary.frame.minY
            let navigationBottom = app.navigationBars.firstMatch.frame.maxY
            // A short page on iPad can clamp scrolling before the card reaches the top.
            let fullyVisible = top >= navigationBottom - 5 && summary.frame.maxY <= calculate.frame.minY - 8
            return fullyVisible && (!compactWidth || top <= navigationBottom + 30)
        }, object: nil)
        let alignmentResult = XCTWaiter.wait(for: [aligned], timeout: 5)
        capture(app, "perfect-practice-score")
        XCTAssertEqual(alignmentResult, .completed, "One tap should reveal the entire score card, aligned to the top on compact screens. Score: \(summary.frame); navigation: \(app.navigationBars.firstMatch.frame); calculate: \(calculate.frame)")
        XCTAssertLessThan(percentage.frame.height, 55, "The perfect score and percent symbol should fit on one line.")
    }

    @MainActor
    func testPlayfulScreensAndQuizSelection() throws {
        continueAfterFailure = false
        let app = XCUIApplication()
        app.launchArguments = ["-ui-testing-reset", "-ui-testing-static-layout", "-native.language", "en", "-native.appearance", "light"]
        app.launch()
        XCTAssertTrue(app.buttons["quiz.start"].waitForExistence(timeout: 15))
        capture(app, "home")

        app.buttons["quiz.start"].tap()
        XCTAssertTrue(app.staticTexts["quiz.progress"].waitForExistence(timeout: 5))
        capture(app, "quiz")
        let answer = app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH %@", "answer.")).firstMatch
        XCTAssertTrue(answer.waitForExistence(timeout: 5))
        let activeAnswers = app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH %@", "answer.")).allElementsBoundByIndex
        let answerIDs = activeAnswers.map(\.identifier)
        let answerLabels = activeAnswers.map(\.label)
        let questionID = String(answerIDs[0].dropFirst("answer.".count).split(separator: "/")[0])
        let header = app.descendants(matching: .any).matching(identifier: "question.\(questionID)").firstMatch
        let activeHeaderLabel = header.label
        answer.tap()
        XCTAssertEqual(answer.value as? String, "Selected")
        capture(app, "quiz-selected")
        app.buttons["quiz.next"].tap()
        app.buttons["quiz.previous"].tap()
        XCTAssertEqual(app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH %@", "answer.")).allElementsBoundByIndex.map(\.identifier), answerIDs)
        XCTAssertEqual(app.buttons[answerIDs[0]].value as? String, "Selected")
        let finish = app.buttons["quiz.finish"]
        let next = app.buttons["quiz.next"]
        for _ in 0..<10 {
            // XCTest may report an offscreen button as hittable underneath the sticky controls.
            if finish.isHittable && finish.frame.maxY < next.frame.minY - 8 { break }
            app.scrollViews.firstMatch.swipeUp()
        }
        XCTAssertTrue(finish.isHittable)
        XCTAssertLessThan(finish.frame.maxY, next.frame.minY - 8)
        finish.tap()
        XCTAssertTrue(app.buttons["quiz.retake"].waitForExistence(timeout: 5))
        capture(app, "results")
        let reviewedHeader = app.descendants(matching: .any).matching(identifier: "question.\(questionID)").firstMatch
        for _ in 0..<5 {
            if reviewedHeader.exists && app.buttons[answerIDs[0]].exists { break }
            app.scrollViews.firstMatch.swipeUp()
        }
        XCTAssertTrue(reviewedHeader.exists)
        XCTAssertNotEqual(reviewedHeader.label, activeHeaderLabel, "Review should restore the original question number.")
        XCTAssertTrue(reviewedHeader.label.contains(activeHeaderLabel))
        let reviewedAnswers = app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH %@", "answer.\(questionID)/")).allElementsBoundByIndex
        XCTAssertEqual(reviewedAnswers.map(\.identifier), answerIDs, "Review must retain the displayed answer order.")
        for (index, id) in answerIDs.enumerated() {
            let number = id.split(separator: "/").last!.uppercased()
            XCTAssertEqual(app.buttons[id].label, "\(number). \(answerLabels[index])", "Only review should announce original answer numbers.")
        }
        app.buttons["quiz.close"].tap()
        XCTAssertTrue(app.buttons["quiz.resume"].waitForExistence(timeout: 5), "Saved quiz controls should appear after dismissing the quiz.")
        XCTAssertTrue(app.buttons["quiz.discard"].exists)
        XCTAssertFalse(app.staticTexts["Discard quiz"].exists, "The saved-quiz restart action should use a neutral icon, not inline red text.")
        capture(app, "home-saved-quiz")

        selectTab("Rules", in: app)
        XCTAssertTrue(app.staticTexts["Study by rule"].waitForExistence(timeout: 5))
        capture(app, "rules")
        app.buttons["settings.open"].tap()
        XCTAssertTrue(app.staticTexts["Your preferences"].waitForExistence(timeout: 5))
        capture(app, "settings")
        let privacy = app.buttons["settings.privacy"]
        for _ in 0..<4 {
            if privacy.isHittable { break }
            app.scrollViews.firstMatch.swipeUp()
        }
        privacy.tap()
        XCTAssertTrue(app.staticTexts["privacy.intro"].waitForExistence(timeout: 5))
        capture(app, "privacy")
        app.navigationBars.buttons.element(boundBy: 0).tap()
        let support = app.buttons["settings.support"]
        XCTAssertTrue(support.waitForExistence(timeout: 5))
        support.tap()
        XCTAssertTrue(app.staticTexts["support.intro"].waitForExistence(timeout: 5))
        XCTAssertTrue(app.descendants(matching: .any).matching(identifier: "information.email").firstMatch.exists)
        capture(app, "support")
        app.terminate()
        app.launchArguments = ["-ui-testing-reset", "-ui-testing-static-layout", "-native.language", "en", "-native.appearance", "dark"]
        app.launch()
        XCTAssertTrue(app.buttons["quiz.start"].waitForExistence(timeout: 10))
        capture(app, "home-dark")
        app.terminate()
        app.launchArguments = ["-ui-testing-reset", "-ui-testing-static-layout", "-native.language", "fr", "-native.appearance", "light"]
        app.launch()
        XCTAssertTrue(app.buttons["quiz.start"].waitForExistence(timeout: 10))
        capture(app, "home-french")
        for (language, headline) in [("nl", "Ken de\nspelregels."), ("srb", "Познајте\nправила.")] {
            app.terminate()
            app.launchArguments = ["-ui-testing-reset", "-ui-testing-static-layout", "-native.language", language, "-native.appearance", "light"]
            app.launch()
            XCTAssertTrue(app.buttons["quiz.start"].waitForExistence(timeout: 10))
            XCTAssertTrue(app.staticTexts[headline].exists)
            capture(app, "home-\(language)")
        }
        for appearance in ["light", "dark"] {
            app.terminate()
            app.launchArguments = ["-ui-testing-reset", "-ui-testing-launch-screen", "-native.language", "en", "-native.appearance", appearance]
            app.launch()
            let preview = app.descendants(matching: .any).matching(identifier: "launch.preview").firstMatch
            XCTAssertTrue(preview.waitForExistence(timeout: 10))
            let brightness = averageBrightness(app.screenshot())
            if appearance == "dark" { XCTAssertLessThan(brightness, 0.45) }
            else { XCTAssertGreaterThan(brightness, 0.65) }
            capture(app, "launch-\(appearance)")
        }
    }

    @MainActor
    func testLocalizedStoreScreenshots() {
        continueAfterFailure = false
        let app = XCUIApplication()
        for (language, searchTitle, rulesTitle, rulesHeading, selectedValue) in [
            ("nl", "Zoeken", "Spelregels", "Oefen per spelregel", "Geselecteerd"),
            ("fr", "Recherche", "Règles", "Révisez par règle", "Sélectionné")
        ] {
            app.terminate()
            app.launchArguments = ["-ui-testing-reset", "-ui-testing-static-layout", "-native.language", language, "-native.appearance", "light"]
            app.launch()
            XCTAssertTrue(app.buttons["quiz.start"].waitForExistence(timeout: 15))
            capture(app, "store-home-\(language)")
            app.buttons["quiz.start"].tap()
            XCTAssertTrue(app.staticTexts["quiz.progress"].waitForExistence(timeout: 5))
            let quizAnswer = app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH %@", "answer.")).firstMatch
            XCTAssertTrue(quizAnswer.waitForExistence(timeout: 5))
            quizAnswer.tap()
            XCTAssertEqual(quizAnswer.value as? String, selectedValue)
            capture(app, "store-quiz-selected-\(language)")

            // Start a clean practice journey, independent of the saved random quiz.
            app.terminate()
            app.launch()
            XCTAssertTrue(app.buttons["quiz.start"].waitForExistence(timeout: 15))
            selectTab(searchTitle, in: app)
            let example = app.buttons["search.example.1.1"]
            XCTAssertTrue(example.waitForExistence(timeout: 10))
            example.tap()
            let result = app.buttons["search.result.1.1"]
            XCTAssertTrue(result.waitForExistence(timeout: 5))
            result.tap()
            let answer = app.buttons["answer.1.1/a"]
            let calculate = app.buttons["practice.calculate"]
            XCTAssertTrue(answer.waitForExistence(timeout: 5))
            for _ in 0..<8 {
                if answer.isHittable && answer.frame.maxY < calculate.frame.minY - 8 { break }
                app.scrollViews.firstMatch.swipeUp()
            }
            answer.tap()
            XCTAssertEqual(answer.value as? String, selectedValue)
            calculate.tap()
            let percentage = app.staticTexts["score.percentage"]
            XCTAssertTrue(percentage.waitForExistence(timeout: 5))
            XCTAssertEqual(percentage.label, "100.00%")
            let summary = app.otherElements["score.summary"]
            let visible = XCTNSPredicateExpectation(predicate: NSPredicate { _, _ in
                summary.exists && summary.frame.minY >= app.navigationBars.firstMatch.frame.maxY - 5
                    && summary.frame.maxY <= calculate.frame.minY - 8
            }, object: nil)
            XCTAssertEqual(XCTWaiter.wait(for: [visible], timeout: 5), .completed)
            capture(app, "store-perfect-practice-score-\(language)")

            selectTab(rulesTitle, in: app)
            XCTAssertTrue(app.staticTexts[rulesHeading].waitForExistence(timeout: 5))
            capture(app, "store-rules-\(language)")
        }
    }

    @MainActor
    private func averageBrightness(_ screenshot: XCUIScreenshot) -> Double {
        guard let image = UIImage(data: screenshot.pngRepresentation)?.cgImage else {
            XCTFail("Settings screenshot should decode.")
            return -1
        }
        let side = 16
        var pixels = [UInt8](repeating: 0, count: side * side * 4)
        pixels.withUnsafeMutableBytes { bytes in
            let context = CGContext(data: bytes.baseAddress, width: side, height: side,
                                    bitsPerComponent: 8, bytesPerRow: side * 4,
                                    space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
            context.interpolationQuality = .high
            context.draw(image, in: CGRect(x: 0, y: 0, width: side, height: side))
        }
        var total = 0
        for index in stride(from: 0, to: pixels.count, by: 4) {
            total += Int(pixels[index])
            total += Int(pixels[index + 1])
            total += Int(pixels[index + 2])
        }
        return Double(total) / Double(side * side * 3 * 255)
    }

    @MainActor
    private func selectTab(_ title: String, in app: XCUIApplication) {
        let phoneTab = app.tabBars.buttons[title]
        if phoneTab.exists {
            phoneTab.tap()
        } else {
            // iPadOS floating tabs have inconsistent Button/Cell automation types.
            let floatingTab = app.descendants(matching: .any)
                .matching(NSPredicate(format: "label == %@", title)).firstMatch
            XCTAssertTrue(floatingTab.waitForExistence(timeout: 10), "The native \(title) tab should be available.\n\(app.debugDescription)")
            floatingTab.tap()
        }
    }

    @MainActor
    private func capture(_ app: XCUIApplication, _ name: String) {
        let screenshot = app.screenshot()
        let attachment = XCTAttachment(screenshot: screenshot)
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
        // Small simulator previews remain retrievable if Actions artifact storage is full.
        let encoded = screenshot.pngRepresentation.base64EncodedString()
        var start = encoded.startIndex
        var part = 0
        while start < encoded.endIndex {
            let end = encoded.index(start, offsetBy: 12_000, limitedBy: encoded.endIndex) ?? encoded.endIndex
            print("NATIVE_UI_PREVIEW:\(name):\(part):\(encoded[start..<end])")
            part += 1
            start = end
        }
        print("NATIVE_UI_PREVIEW_END:\(name):\(part)")
    }
}
