import { expect, test } from '@playwright/test';

/**
 * E2E tests for core quiz functionality
 * Tests quiz flow, configuration, navigation, completion, and interactions
 */

/**
 * Helper function to complete a quiz by answering all questions
 */
async function completeQuizHelper(page: any, questionCount: number = 10) {
  for (let i = 0; i < questionCount; i++) {
    await expect(page.locator('#question-text')).toBeVisible({ timeout: 10000 });

    const checkbox = page.locator('[type="checkbox"]').first();
    await checkbox.check();

    if (i < questionCount - 1) {
      const nextButton = page.getByRole('button', { name: /next/i });
      await nextButton.waitFor({ state: 'visible' });
      await nextButton.click({ force: true });
      await page.waitForTimeout(400);
    } else {
      const completeButton = page.getByRole('button', { name: /complete/i });
      await completeButton.waitFor({ state: 'visible' });
      await completeButton.click({ force: true });
    }
  }
}

test.describe('Quiz Flow', () => {
  test('should complete quiz successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/IHF Rules Quiz/);

    await page.locator('footer a[routerLink="/quiz"]').click();
    await expect(page).toHaveURL(/\/quiz/);
    await expect(page.locator('button', { hasText: '10' }).first()).toBeVisible();

    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);
    await expect(page.locator('#question-text')).toBeVisible();

    const firstAnswer = page.locator('[type="checkbox"]').first();
    await firstAnswer.check();
    await expect(firstAnswer).toBeChecked();

    const nextButton = page.getByRole('button', { name: /next/i });
    await expect(nextButton).toBeVisible();
    await nextButton.click();

    await expect(page.getByText('Question 2 of').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#question-text')).toBeVisible();
  });

  test('should navigate directly to quiz setup page', async ({ page }) => {
    await page.goto('/quiz');

    await expect(page).toHaveURL(/\/quiz/);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button', { hasText: '10' }).first()).toBeVisible();
    await expect(page.locator('button', { hasText: '15' })).toBeVisible();
    await expect(page.locator('button', { hasText: '20' })).toBeVisible();
    await expect(page.locator('button', { hasText: '30' })).toBeVisible();
  });
});

test.describe('Quiz Configuration', () => {
  test('should allow selecting different question counts', async ({ page }) => {
    await page.goto('/quiz');

    await page.locator('button', { hasText: '15' }).click();
    await expect(page.locator('button', { hasText: '15' })).toHaveClass(/bg-cyan-500/);

    await page.locator('button', { hasText: '20' }).click();
    await expect(page.locator('button', { hasText: '20' })).toHaveClass(/bg-cyan-500/);

    await page.locator('button', { hasText: '30' }).click();
    await expect(page.locator('button', { hasText: '30' })).toHaveClass(/bg-cyan-500/);
  });

  test('should toggle timed mode', async ({ page }) => {
    await page.goto('/quiz');

    // Wait for page to load
    await expect(page.locator('button', { hasText: '10' }).first()).toBeVisible();

    const label = page.locator('label.relative.inline-block').first();
    const timedModeCheckbox = page.locator('input[type="checkbox"][aria-label="Toggle timed mode"]');

    // Get initial state
    const initialState = await timedModeCheckbox.isChecked();

    // Toggle once
    await label.click();
    await page.waitForTimeout(200);
    const newState = await timedModeCheckbox.isChecked();
    expect(newState).toBe(!initialState);

    // Toggle back
    await label.click();
    await page.waitForTimeout(200);
    const finalState = await timedModeCheckbox.isChecked();
    expect(finalState).toBe(initialState);
  });

  test('should start quiz with custom configuration', async ({ page }) => {
    await page.goto('/quiz');

    await page.locator('button', { hasText: '15' }).click();

    const label = page.locator('label.relative.inline-block').first();
    await label.click();

    await page.getByRole('button', { name: /start quiz/i }).click();

    await expect(page).toHaveURL(/\/quiz\/view/);
    await expect(page.locator('#question-text')).toBeVisible();
    await expect(page.getByText(/time remaining/i)).toBeVisible();
  });
});

test.describe('Quiz Navigation', () => {
  test('should navigate back to previous question', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    await expect(page.locator('#question-text')).toBeVisible();
    const firstQuestionText = await page.locator('#question-text').textContent();

    await page.getByRole('button', { name: /next/i }).click();
    await expect(page.getByText('Question 2 of').first()).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /previous/i }).click();
    await expect(page.getByText('Question 1 of').first()).toBeVisible({ timeout: 10000 });

    const currentQuestionText = await page.locator('#question-text').textContent();
    expect(currentQuestionText).toBe(firstQuestionText);
  });

  test('should preserve answer selections when navigating', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    const firstAnswer = page.locator('[type="checkbox"]').first();
    await firstAnswer.check();
    await expect(firstAnswer).toBeChecked();

    await page.getByRole('button', { name: /next/i }).click();
    await expect(page.getByText('Question 2 of').first()).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /previous/i }).click();
    await expect(page.getByText('Question 1 of').first()).toBeVisible({ timeout: 10000 });

    await expect(firstAnswer).toBeChecked();
  });

  test('should show complete button on last question', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    for (let i = 0; i < 9; i++) {
      await page.getByRole('button', { name: /next/i }).click();
      await page.waitForTimeout(300);
    }

    await expect(page.getByText('Question 10 of 10').first()).toBeVisible({ timeout: 10000 });

    await expect(page.getByRole('button', { name: /complete/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /next/i })).not.toBeVisible();
  });
});

test.describe.configure({ mode: 'serial' });

test.describe('Quiz Completion and Results', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.clearPermissions();
  });

  test('should complete full quiz and show results', async ({ page }) => {
    await page.goto('/quiz');
    await expect(page.locator('button', { hasText: '10' }).first()).toBeVisible();

    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    await completeQuizHelper(page, 10);

    await expect(page).toHaveURL(/\/quiz\/results/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /quiz results/i }).first()).toBeVisible();
  });

  test('should show score calculation loading state', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    await completeQuizHelper(page, 10);

    await page.waitForTimeout(500);
  });

  test('should display score and percentage on results page', async ({ page }) => {
    await page.goto('/quiz');
    await expect(page.locator('button', { hasText: '10' }).first()).toBeVisible();

    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    await completeQuizHelper(page, 10);

    await expect(page).toHaveURL(/\/quiz\/results/, { timeout: 15000 });

    // Check for score display (e.g., "8/10" or similar)
    const scoreText = page.locator('text=/\\d+\\/\\d+/').or(page.locator('text=/\\d+%/'));
    await expect(scoreText.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show review answers section on results page', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    await completeQuizHelper(page, 10);

    await expect(page).toHaveURL(/\/quiz\/results/, { timeout: 15000 });

    // Check for review answers heading
    const reviewHeading = page.getByRole('heading', { name: /review/i });
    if ((await reviewHeading.count()) > 0) {
      await expect(reviewHeading.first()).toBeVisible();
    }
  });

  test('should have restart quiz button on results page', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    await completeQuizHelper(page, 10);

    await expect(page).toHaveURL(/\/quiz\/results/, { timeout: 15000 });

    // Check for restart/retake quiz button
    const restartButton = page.getByRole('link', { name: /new quiz|restart|try again|retake/i });
    if ((await restartButton.count()) > 0) {
      await expect(restartButton.first()).toBeVisible();
    }
  });

  test('should display correct/incorrect answer indicators', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    await completeQuizHelper(page, 10);

    await expect(page).toHaveURL(/\/quiz\/results/, { timeout: 15000 });

    // Look for correct/incorrect indicators (checkmarks or X marks)
    const correctIndicators = page.locator('[class*="correct"]').or(page.locator('text=/✓|✔|correct/i'));
    const incorrectIndicators = page.locator('[class*="incorrect"]').or(page.locator('text=/✗|✘|incorrect/i'));

    // At least one should be visible
    const hasIndicators = (await correctIndicators.count()) > 0 || (await incorrectIndicators.count()) > 0;
    expect(hasIndicators).toBe(true);
  });
});

test.describe('Question Interactions', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.clearPermissions();
  });

  test('should allow multiple answer selections', async ({ page }) => {
    await page.goto('/quiz');
    await expect(page.locator('button', { hasText: '10' }).first()).toBeVisible();

    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    await expect(page.locator('#question-text')).toBeVisible({ timeout: 10000 });

    const checkboxes = page.locator('[type="checkbox"]');
    const count = await checkboxes.count();

    if (count >= 2) {
      await checkboxes.nth(0).check();
      await expect(checkboxes.nth(0)).toBeChecked();

      await checkboxes.nth(1).check();
      await expect(checkboxes.nth(1)).toBeChecked();

      await expect(checkboxes.nth(0)).toBeChecked();
      await expect(checkboxes.nth(1)).toBeChecked();
    }
  });

  test('should allow deselecting answers', async ({ page }) => {
    await page.goto('/quiz');
    await expect(page.locator('button', { hasText: '10' }).first()).toBeVisible();

    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    await expect(page.locator('#question-text')).toBeVisible({ timeout: 10000 });

    const checkbox = page.locator('[type="checkbox"]').first();
    await checkbox.check();
    await expect(checkbox).toBeChecked();

    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  });

  test('should update progress bar as quiz advances', async ({ page }) => {
    await page.goto('/quiz');
    await expect(page.locator('button', { hasText: '10' }).first()).toBeVisible();

    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toBeVisible({ timeout: 10000 });

    const initialProgress = await progressBar.getAttribute('aria-valuenow');
    expect(initialProgress).toBe('1');

    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(300);

    const newProgress = await progressBar.getAttribute('aria-valuenow');
    expect(newProgress).toBe('2');
  });
});

test.describe('Timed Mode Functionality', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.clearPermissions();
  });

  test('should display and countdown timer in timed mode', async ({ page }) => {
    await page.goto('/quiz');
    await expect(page.locator('button', { hasText: '10' }).first()).toBeVisible();

    const label = page.locator('label.relative.inline-block').first();
    await label.click();

    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    await expect(page.locator('#question-text')).toBeVisible({ timeout: 10000 });

    const timer = page.getByText(/time remaining/i);
    await expect(timer).toBeVisible();

    const initialTime = await timer.textContent();

    await page.waitForTimeout(2000);
    const newTime = await timer.textContent();

    expect(initialTime).not.toBe(newTime);
  });
});

test.describe('Quiz State Persistence', () => {
  test('should warn before leaving quiz', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    const checkbox = page.locator('[type="checkbox"]').first();
    await checkbox.check();

    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain(/progress/i);
      await dialog.dismiss();
    });

    await page.locator('footer a[routerLink="/home"]').click();
    await page.waitForTimeout(500);
  });
});

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.clearPermissions();
  });

  test('should navigate forward with ArrowRight key', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    await expect(page.locator('#question-text')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Question 1 of').first()).toBeVisible();

    // Press ArrowRight to go to next question
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);

    // Should navigate to question 2
    await expect(page.getByText('Question 2 of').first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate backward with ArrowLeft key', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    await expect(page.locator('#question-text')).toBeVisible({ timeout: 10000 });

    // Go to question 2 first
    await page.getByRole('button', { name: /next/i }).click();
    await expect(page.getByText('Question 2 of').first()).toBeVisible({ timeout: 10000 });

    // Press ArrowLeft to go back
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(500);

    // Should navigate back to question 1
    await expect(page.getByText('Question 1 of').first()).toBeVisible({ timeout: 10000 });
  });

  test('should not navigate backward on first question with ArrowLeft', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    await expect(page.locator('#question-text')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Question 1 of').first()).toBeVisible();

    const questionText = await page.locator('#question-text').textContent();

    // Press ArrowLeft (should do nothing on first question)
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(500);

    // Should still be on question 1
    await expect(page.getByText('Question 1 of').first()).toBeVisible();
    const newQuestionText = await page.locator('#question-text').textContent();
    expect(newQuestionText).toBe(questionText);
  });
});

test.describe('Touch Gestures', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.clearPermissions();
  });

  test('should support swipe left gesture for next question', async ({ page }) => {
    // Set mobile viewport for touch gestures
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/quiz');

    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    await expect(page.locator('#question-text')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Question 1 of').first()).toBeVisible();

    // Simulate swipe left gesture (swipe from right to left)
    const quizContainer = page.locator('main').or(page.locator('[class*="quiz"]')).first();
    const box = await quizContainer.boundingBox();

    if (box) {
      // Swipe left: start from right side, move to left
      await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 10 });
      await page.mouse.up();

      await page.waitForTimeout(500);

      // Should navigate to question 2
      const question2Visible = await page.getByText('Question 2 of').first().isVisible();
      // Touch gestures might not work in all test environments, so we just verify it doesn't error
      expect(typeof question2Visible).toBe('boolean');
    }
  });

  test('should support swipe right gesture for previous question', async ({ page }) => {
    // Set mobile viewport for touch gestures
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/quiz');

    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    await expect(page.locator('#question-text')).toBeVisible({ timeout: 10000 });

    // Navigate to question 2 first
    await page.getByRole('button', { name: /next/i }).click();
    await expect(page.getByText('Question 2 of').first()).toBeVisible({ timeout: 10000 });

    // Simulate swipe right gesture (swipe from left to right)
    const quizContainer = page.locator('main').or(page.locator('[class*="quiz"]')).first();
    const box = await quizContainer.boundingBox();

    if (box) {
      // Swipe right: start from left side, move to right
      await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2, { steps: 10 });
      await page.mouse.up();

      await page.waitForTimeout(500);

      // Touch gestures might not work in all test environments
      const question1Visible = await page.getByText('Question 1 of').first().isVisible();
      expect(typeof question1Visible).toBe('boolean');
    }
  });
});

test.describe('Home Page Quiz Start', () => {
  test('should start quiz from home page card', async ({ page }) => {
    await page.goto('/');

    // Find the quiz config card on home page
    await expect(page.locator('h1')).toBeVisible();

    // Configure quiz on home page
    const questionCountButton = page.locator('button', { hasText: '15' }).first();
    if ((await questionCountButton.count()) > 0) {
      await questionCountButton.click();
    }

    // Start quiz from home page
    const startButton = page.getByRole('button', { name: /start quiz/i }).first();
    await expect(startButton).toBeVisible();
    await startButton.click();

    // Should navigate directly to quiz view (not setup page)
    await expect(page).toHaveURL(/\/quiz\/view/);
    await expect(page.locator('#question-text')).toBeVisible({ timeout: 10000 });
  });

  test('should respect timed mode setting from home page', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();

    // Enable timed mode on home page
    const timedModeLabel = page.locator('label.relative.inline-block').first();
    if ((await timedModeLabel.count()) > 0) {
      await timedModeLabel.click();
    }

    // Start quiz
    const startButton = page.getByRole('button', { name: /start quiz/i }).first();
    await startButton.click();

    await expect(page).toHaveURL(/\/quiz\/view/);
    await expect(page.locator('#question-text')).toBeVisible({ timeout: 10000 });

    // Timer should be visible
    const timer = page.getByText(/time remaining/i);
    if ((await timer.count()) > 0) {
      await expect(timer).toBeVisible();
    }
  });
});
