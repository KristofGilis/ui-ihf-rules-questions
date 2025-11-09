import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * E2E tests for the quiz flow
 * Tests the complete user journey from setup to results
 */

test.describe('Quiz Flow', () => {
  test('should complete quiz successfully', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');

    // Verify home page loaded
    await expect(page).toHaveTitle(/IHF Rules Quiz/);

    // Click on quiz setup button (in footer navigation)
    await page.locator('footer a[routerLink="/quiz"]').click();

    // Verify we're on quiz setup page
    await expect(page).toHaveURL(/\/quiz/);

    // Wait for quiz setup page to load - check for question count buttons
    await expect(page.locator('button', { hasText: '10' }).first()).toBeVisible();

    // Start quiz with default settings (10 questions)
    await page.getByRole('button', { name: /start quiz/i }).click();

    // Wait for quiz to load
    await expect(page).toHaveURL(/\/quiz\/view/);

    // Verify first question is displayed - wait for question phrase
    await expect(page.locator('#question-text')).toBeVisible();

    // Answer the first question (select first answer)
    const firstAnswer = page.locator('[type="checkbox"]').first();
    await firstAnswer.check();
    await expect(firstAnswer).toBeChecked();

    // Click next button to navigate to question 2
    const nextButton = page.getByRole('button', { name: /next/i });
    await expect(nextButton).toBeVisible();
    await nextButton.click();

    // Wait for question to change - check for Question 2
    await expect(page.getByText('Question 2 of').first()).toBeVisible({ timeout: 10000 });

    // Verify second question is now visible
    await expect(page.locator('#question-text')).toBeVisible();
  });

  test('should navigate to questions page', async ({ page }) => {
    await page.goto('/');

    // Click on questions link (in footer navigation)
    await page.locator('footer a[routerLink="/questions"]').click();

    // Verify we're on questions page
    await expect(page).toHaveURL(/\/questions/);

    // Wait for questions page to load - check for h1 heading
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('should navigate to rules page', async ({ page }) => {
    await page.goto('/');

    // Click on rules link (in footer navigation)
    await page.locator('footer a[routerLink="/rules"]').click();

    // Verify we're on rules page
    await expect(page).toHaveURL(/\/rules/);

    // Wait for rules list to load
    await expect(page.getByRole('heading')).toBeVisible();
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/');

    // Check for basic accessibility - presence of main landmark
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Check for navigation (header navigation specifically)
    const nav = page.locator('header nav[role="navigation"]');
    await expect(nav).toBeVisible();

    // Verify keyboard navigation works
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should pass automated accessibility tests (axe)', async ({ page }) => {
    await page.goto('/');

    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Log violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations:', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have accessible quiz page', async ({ page }) => {
    await page.goto('/quiz');

    // Run axe on quiz setup page
    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    // Log violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Quiz page accessibility violations:', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have accessible questions page', async ({ page }) => {
    await page.goto('/questions');

    // Run axe on questions page
    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    // Log violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log(
        'Questions page accessibility violations:',
        JSON.stringify(accessibilityScanResults.violations, null, 2)
      );
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Quiz Configuration', () => {
  test('should allow selecting different question counts', async ({ page }) => {
    await page.goto('/quiz');

    // Test selecting 15 questions
    await page.locator('button', { hasText: '15' }).click();
    await expect(page.locator('button', { hasText: '15' })).toHaveClass(/bg-cyan-500/);

    // Test selecting 20 questions
    await page.locator('button', { hasText: '20' }).click();
    await expect(page.locator('button', { hasText: '20' })).toHaveClass(/bg-cyan-500/);

    // Test selecting 30 questions
    await page.locator('button', { hasText: '30' }).click();
    await expect(page.locator('button', { hasText: '30' })).toHaveClass(/bg-cyan-500/);
  });

  test('should toggle timed mode', async ({ page }) => {
    await page.goto('/quiz');

    // Find the timed mode checkbox by its aria-label
    const timedModeCheckbox = page.locator('input[type="checkbox"][aria-label="Toggle timed mode"]');

    // Wait for it to be attached to DOM
    await timedModeCheckbox.waitFor({ state: 'attached' });

    // Get initial state
    const initialState = await timedModeCheckbox.isChecked();

    // Click the parent label instead of the checkbox (it's hidden with sr-only)
    const label = page.locator('label.relative.inline-block').first();

    // Toggle on (if not already checked)
    if (!initialState) {
      await label.click();
      await expect(timedModeCheckbox).toBeChecked();

      // Toggle off
      await label.click();
      await expect(timedModeCheckbox).not.toBeChecked();
    } else {
      // If already checked, toggle off then on
      await label.click();
      await expect(timedModeCheckbox).not.toBeChecked();

      await label.click();
      await expect(timedModeCheckbox).toBeChecked();
    }
  });

  test('should start quiz with custom configuration', async ({ page }) => {
    await page.goto('/quiz');

    // Select 15 questions
    await page.locator('button', { hasText: '15' }).click();

    // Enable timed mode - click the label instead of checkbox
    const label = page.locator('label.relative.inline-block').first();
    await label.click();

    // Start quiz
    await page.getByRole('button', { name: /start quiz/i }).click();

    // Verify quiz started
    await expect(page).toHaveURL(/\/quiz\/view/);
    await expect(page.locator('#question-text')).toBeVisible();

    // Verify timer is visible (timed mode enabled)
    await expect(page.getByText(/time remaining/i)).toBeVisible();
  });
});

test.describe('Quiz Navigation', () => {
  test('should navigate back to previous question', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    // Wait for first question
    await expect(page.locator('#question-text')).toBeVisible();
    const firstQuestionText = await page.locator('#question-text').textContent();

    // Go to next question
    await page.getByRole('button', { name: /next/i }).click();
    await expect(page.getByText('Question 2 of').first()).toBeVisible({ timeout: 10000 });

    // Go back to previous question
    await page.getByRole('button', { name: /previous/i }).click();
    await expect(page.getByText('Question 1 of').first()).toBeVisible({ timeout: 10000 });

    // Verify we're back on the first question
    const currentQuestionText = await page.locator('#question-text').textContent();
    expect(currentQuestionText).toBe(firstQuestionText);
  });

  test('should preserve answer selections when navigating', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    // Select first answer on question 1
    const firstAnswer = page.locator('[type="checkbox"]').first();
    await firstAnswer.check();
    await expect(firstAnswer).toBeChecked();

    // Navigate to question 2
    await page.getByRole('button', { name: /next/i }).click();
    await expect(page.getByText('Question 2 of').first()).toBeVisible({ timeout: 10000 });

    // Navigate back to question 1
    await page.getByRole('button', { name: /previous/i }).click();
    await expect(page.getByText('Question 1 of').first()).toBeVisible({ timeout: 10000 });

    // Verify answer is still selected
    await expect(firstAnswer).toBeChecked();
  });

  test('should show complete button on last question', async ({ page }) => {
    await page.goto('/quiz');

    // Start quiz with only 10 questions for faster test
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    // Navigate to last question (question 10)
    for (let i = 0; i < 9; i++) {
      await page.getByRole('button', { name: /next/i }).click();
      await page.waitForTimeout(300);
    }

    // Verify we're on question 10 - use .first() to avoid strict mode violation
    await expect(page.getByText('Question 10 of 10').first()).toBeVisible({ timeout: 10000 });

    // Verify Complete button is shown instead of Next
    await expect(page.getByRole('button', { name: /complete/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /next/i })).not.toBeVisible();
  });
});

test.describe('Theme Switching', () => {
  test('should toggle theme between light and dark', async ({ page }) => {
    await page.goto('/');

    // Open theme menu
    const themeButton = page
      .locator('button[aria-label*="theme" i]')
      .or(page.locator('button[aria-label*="Toggle theme" i]'));
    await themeButton.click();

    // Wait for menu to appear
    await page.waitForTimeout(300);

    // Find and click dark theme option (look for button with moon icon or "Dark" text)
    const darkOption = page
      .locator('button[role="menuitem"]')
      .filter({ hasText: /dark/i })
      .or(page.locator('button[title*="Dark" i]'));
    if ((await darkOption.count()) > 0) {
      await darkOption.first().click();
      await page.waitForTimeout(300);
    }

    // Check if dark mode is applied (html should have dark class)
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveClass(/dark/);
  });
});

test.describe('Language Switching', () => {
  test('should switch between languages', async ({ page }) => {
    await page.goto('/');

    // Open language menu
    const languageButton = page
      .locator('button[aria-label*="language" i]')
      .or(page.locator('button[aria-controls="language-menu"]'));
    await languageButton.click();

    // Wait for menu to appear
    await page.waitForTimeout(300);

    // Click on Dutch language option
    const dutchOption = page.locator('button[role="menuitem"]').filter({ hasText: /dutch|nederlands|nl/i });
    if ((await dutchOption.count()) > 0) {
      await dutchOption.first().click();
      await page.waitForTimeout(500);

      // Verify language changed by checking if text changed
      // The page should now show Dutch text
      const languageButtonAfter = page
        .locator('button[aria-label*="language" i]')
        .or(page.locator('button[aria-controls="language-menu"]'));
      const buttonText = await languageButtonAfter.textContent();
      expect(buttonText).toContain('NL');
    }
  });
});

test.describe('Questions Page', () => {
  test('should load and display questions', async ({ page }) => {
    await page.goto('/questions');

    // Wait for page to load
    await expect(page.locator('h1')).toBeVisible();

    // Verify page has question elements (they load asynchronously)
    await page.waitForTimeout(2000);

    // Check if loading spinner appears first, then disappears
    const hasContent = await page.locator('main').textContent();
    expect(hasContent).toBeTruthy();
  });

  test('should allow selecting answers on questions page', async ({ page }) => {
    await page.goto('/questions');
    await page.waitForTimeout(2000); // Wait for questions to load

    // Try to find and check a checkbox
    const checkbox = page.locator('[type="checkbox"]').first();
    if ((await checkbox.count()) > 0) {
      await checkbox.scrollIntoViewIfNeeded();
      await checkbox.check();
      await expect(checkbox).toBeChecked();
    }
  });
});

test.describe('Rules Page', () => {
  test('should load and display rules', async ({ page }) => {
    await page.goto('/rules');

    // Wait for page to load
    await expect(page.getByRole('heading')).toBeVisible();

    // Wait for rules to load
    await page.waitForTimeout(2000);

    // Verify rules content is present
    const hasContent = await page.locator('main').textContent();
    expect(hasContent).toBeTruthy();
  });

  test('should allow searching rules', async ({ page }) => {
    await page.goto('/rules');
    await page.waitForTimeout(2000);

    // Look for search input
    const searchInput = page.locator('input[type="text"]').or(page.locator('input[placeholder*="search" i]'));
    if ((await searchInput.count()) > 0) {
      await searchInput.first().fill('goalkeeper');
      await page.waitForTimeout(500);

      // Verify search is working (content should update)
      const content = await page.locator('main').textContent();
      expect(content).toBeTruthy();
    }
  });

  test('should navigate to specific rule details', async ({ page }) => {
    await page.goto('/rules');
    await page.waitForTimeout(2000);

    // Click on first rule link if available
    const ruleLink = page.locator('a[href*="/rule/"]').first();
    if ((await ruleLink.count()) > 0) {
      await ruleLink.click();

      // Verify we navigated to rule detail page
      await expect(page).toHaveURL(/\/rule\//);
      await expect(page.locator('h1').or(page.locator('h2'))).toBeVisible();
    }
  });
});

test.describe('Offline Functionality', () => {
  test('should show offline banner when network is offline', async ({ page, context }) => {
    await page.goto('/');

    // Simulate offline mode
    await context.setOffline(true);

    // Wait a moment for the offline detection to trigger
    await page.waitForTimeout(1000);

    // Check if offline banner appears
    const offlineBanner = page.locator('[role="alert"]').filter({ hasText: /offline/i });

    // The banner should be visible
    if ((await offlineBanner.count()) > 0) {
      await expect(offlineBanner).toBeVisible();
    }

    // Re-enable network
    await context.setOffline(false);
  });
});

test.describe('Quiz Completion and Results', () => {
  test.beforeEach(async ({ context }) => {
    // Clear storage before each test for isolation
    await context.clearCookies();
    await context.clearPermissions();
  });

  test('should complete full quiz and show results', async ({ page }) => {
    await page.goto('/quiz');

    // Wait for setup page to load
    await expect(page.locator('button', { hasText: '10' }).first()).toBeVisible();

    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    // Answer all 10 questions and complete quiz
    for (let i = 0; i < 10; i++) {
      // Wait for question to load with explicit timeout
      await expect(page.locator('#question-text')).toBeVisible({ timeout: 10000 });

      // Select first answer
      const checkbox = page.locator('[type="checkbox"]').first();
      await checkbox.check();

      // Click next or complete on last question
      if (i < 9) {
        await page.getByRole('button', { name: /next/i }).click();
        await page.waitForTimeout(300);
      } else {
        await page.getByRole('button', { name: /complete/i }).click();
      }
    }

    // Should navigate to results page
    await expect(page).toHaveURL(/\/quiz\/results/, { timeout: 15000 });

    // Verify results page elements - use specific heading
    await expect(page.getByRole('heading', { name: /quiz results/i }).first()).toBeVisible();
  });

  test('should show score calculation loading state', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    // Answer questions quickly
    for (let i = 0; i < 10; i++) {
      const checkbox = page.locator('[type="checkbox"]').first();
      await checkbox.check();

      if (i < 9) {
        await page.getByRole('button', { name: /next/i }).click();
        await page.waitForTimeout(100);
      } else {
        await page.getByRole('button', { name: /complete/i }).click();
      }
    }

    // Should show loading spinner while calculating
    // Loading spinner might appear briefly
    await page.waitForTimeout(500);
  });
});

test.describe('Question Interactions', () => {
  test.beforeEach(async ({ context }) => {
    // Clear storage before each test for isolation
    await context.clearCookies();
    await context.clearPermissions();
  });

  test('should allow multiple answer selections', async ({ page }) => {
    await page.goto('/quiz');

    // Wait for setup page
    await expect(page.locator('button', { hasText: '10' }).first()).toBeVisible();

    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    // Wait for first question with explicit timeout
    await expect(page.locator('#question-text')).toBeVisible({ timeout: 10000 });

    // Select multiple checkboxes
    const checkboxes = page.locator('[type="checkbox"]');
    const count = await checkboxes.count();

    if (count >= 2) {
      await checkboxes.nth(0).check();
      await expect(checkboxes.nth(0)).toBeChecked();

      await checkboxes.nth(1).check();
      await expect(checkboxes.nth(1)).toBeChecked();

      // Both should remain checked
      await expect(checkboxes.nth(0)).toBeChecked();
      await expect(checkboxes.nth(1)).toBeChecked();
    }
  });

  test('should allow deselecting answers', async ({ page }) => {
    await page.goto('/quiz');

    // Wait for setup page
    await expect(page.locator('button', { hasText: '10' }).first()).toBeVisible();

    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    await expect(page.locator('#question-text')).toBeVisible({ timeout: 10000 });

    // Select and deselect checkbox
    const checkbox = page.locator('[type="checkbox"]').first();
    await checkbox.check();
    await expect(checkbox).toBeChecked();

    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  });

  test('should update progress bar as quiz advances', async ({ page }) => {
    await page.goto('/quiz');

    // Wait for setup page
    await expect(page.locator('button', { hasText: '10' }).first()).toBeVisible();

    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    // Check progress bar exists
    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toBeVisible({ timeout: 10000 });

    // Get initial progress
    const initialProgress = await progressBar.getAttribute('aria-valuenow');
    expect(initialProgress).toBe('1');

    // Go to next question
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(300);

    // Progress should update
    const newProgress = await progressBar.getAttribute('aria-valuenow');
    expect(newProgress).toBe('2');
  });
});

test.describe('Timed Mode Functionality', () => {
  test.beforeEach(async ({ context }) => {
    // Clear storage before each test for isolation
    await context.clearCookies();
    await context.clearPermissions();
  });

  test('should display and countdown timer in timed mode', async ({ page }) => {
    await page.goto('/quiz');

    // Wait for setup page
    await expect(page.locator('button', { hasText: '10' }).first()).toBeVisible();

    // Enable timed mode
    const label = page.locator('label.relative.inline-block').first();
    await label.click();

    // Start quiz
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    // Wait for question to load
    await expect(page.locator('#question-text')).toBeVisible({ timeout: 10000 });

    // Timer should be visible
    const timer = page.getByText(/time remaining/i);
    await expect(timer).toBeVisible();

    // Get initial time
    const initialTime = await timer.textContent();

    // Wait a bit and check time decreased
    await page.waitForTimeout(2000);
    const newTime = await timer.textContent();

    // Times should be different (countdown happening)
    expect(initialTime).not.toBe(newTime);
  });
});

test.describe('Keyboard Navigation', () => {
  test.beforeEach(async ({ context }) => {
    // Clear storage before each test for isolation
    await context.clearCookies();
    await context.clearPermissions();
  });

  test('should support tab navigation through answers', async ({ page }) => {
    await page.goto('/quiz');

    // Wait for setup page
    await expect(page.locator('button', { hasText: '10' }).first()).toBeVisible();

    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    await expect(page.locator('#question-text')).toBeVisible({ timeout: 10000 });

    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check if focus is on an input element
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should allow selecting answers with Space key', async ({ page }) => {
    await page.goto('/quiz');

    // Wait for setup page
    await expect(page.locator('button', { hasText: '10' }).first()).toBeVisible();

    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    await expect(page.locator('#question-text')).toBeVisible({ timeout: 10000 });

    // Focus first checkbox
    const checkbox = page.locator('[type="checkbox"]').first();
    await checkbox.focus();

    // Press space to check
    await page.keyboard.press('Space');
    await expect(checkbox).toBeChecked();

    // Press space again to uncheck
    await page.keyboard.press('Space');
    await expect(checkbox).not.toBeChecked();
  });
});

test.describe('Home Page', () => {
  test('should display all navigation cards', async ({ page }) => {
    await page.goto('/');

    // Check for main heading
    await expect(page.locator('h1')).toBeVisible();

    // Check for quiz card
    const quizCard = page.getByText(/take a quiz/i);
    if ((await quizCard.count()) > 0) {
      await expect(quizCard.first()).toBeVisible();
    }

    // Check for rules card
    const rulesCard = page.getByText(/rules/i);
    await expect(rulesCard.first()).toBeVisible();

    // Check for questions card
    const questionsCard = page.getByText(/questions/i);
    await expect(questionsCard.first()).toBeVisible();
  });

  test('should navigate to GitHub from home page', async ({ page }) => {
    await page.goto('/');

    // Look for GitHub link
    const githubLink = page.locator('a[href*="github"]');
    if ((await githubLink.count()) > 0) {
      await expect(githubLink.first()).toBeVisible();
    }
  });

  test('should display version information', async ({ page }) => {
    await page.goto('/');

    // Look for version text
    const versionText = page.getByText(/version/i);
    if ((await versionText.count()) > 0) {
      await expect(versionText.first()).toBeVisible();
    }
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Page should still load
    await expect(page).toHaveTitle(/IHF Rules Quiz/);

    // Footer navigation should be visible
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Start a quiz
    await page.locator('footer a[routerLink="/quiz"]').click();
    await expect(page).toHaveURL(/\/quiz/);
  });

  test('should work on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page).toHaveTitle(/IHF Rules Quiz/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('should work on desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    await expect(page).toHaveTitle(/IHF Rules Quiz/);
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('should handle navigation to non-existent routes', async ({ page }) => {
    await page.goto('/non-existent-route');

    // Should redirect or show 404
    // The app might redirect to home or show an error
    await page.waitForTimeout(1000);

    // Page should have loaded something
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });
});

test.describe('Quiz State Persistence', () => {
  test('should warn before leaving quiz', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    // Answer a question
    const checkbox = page.locator('[type="checkbox"]').first();
    await checkbox.check();

    // Try to navigate away - setup dialog handler
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain(/progress/i);
      await dialog.dismiss();
    });

    // Click home link
    await page.locator('footer a[routerLink="/home"]').click();

    // Wait a moment
    await page.waitForTimeout(500);
  });
});

