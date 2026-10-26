import XCTest

final class NativeLayoutUITests: XCTestCase {
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
        answer.tap()
        XCTAssertEqual(answer.value as? String, "Selected")
        capture(app, "quiz-selected")
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
        app.buttons["quiz.close"].tap()

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
