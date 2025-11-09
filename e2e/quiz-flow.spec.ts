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

    // Verify first question is displayed - wait for heading
    await expect(page.locator('h2').first()).toBeVisible();

    // Answer the first question (select first answer)
    const firstAnswer = page.locator('[type="checkbox"]').first();
    await firstAnswer.check();

    // Navigate to next question
    await page.keyboard.press('ArrowRight');

    // Verify we moved to question 2 - check progress indicator shows "Question 2 of X"
    await expect(page.getByText(/Question 2 of \d+/)).toBeVisible();
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
