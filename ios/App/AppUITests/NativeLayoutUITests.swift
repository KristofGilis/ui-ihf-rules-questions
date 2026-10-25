import XCTest

final class NativeLayoutUITests: XCTestCase {
    @MainActor
    func testPlayfulScreensAndQuizSelection() throws {
        let app = XCUIApplication()
        app.launchArguments = ["-ui-testing-reset", "-native.language", "en", "-native.appearance", "light"]
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
        for _ in 0..<8 {
            if finish.isHittable { break }
            app.swipeUp()
        }
        XCTAssertTrue(finish.isHittable)
        finish.tap()
        XCTAssertTrue(app.buttons["quiz.retake"].waitForExistence(timeout: 5))
        capture(app, "results")
        app.buttons["quiz.close"].tap()

        app.tabBars.buttons["Rules"].tap()
        XCTAssertTrue(app.staticTexts["Read the game."].waitForExistence(timeout: 5))
        capture(app, "rules")
        app.buttons["settings.open"].tap()
        XCTAssertTrue(app.staticTexts["Make it yours."].waitForExistence(timeout: 5))
        capture(app, "settings")
        app.terminate()
        app.launchArguments = ["-ui-testing-reset", "-native.language", "en", "-native.appearance", "dark"]
        app.launch()
        XCTAssertTrue(app.buttons["quiz.start"].waitForExistence(timeout: 10))
        capture(app, "home-dark")
        app.terminate()
        app.launchArguments = ["-ui-testing-reset", "-native.language", "fr", "-native.appearance", "light"]
        app.launch()
        XCTAssertTrue(app.buttons["quiz.start"].waitForExistence(timeout: 10))
        capture(app, "home-french")
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
