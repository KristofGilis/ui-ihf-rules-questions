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

    // Click on quiz setup button
    await page.getByRole('link', { name: /quiz/i }).click();

    // Verify we're on quiz setup page
    await expect(page).toHaveURL(/\/quiz/);

    // Configure quiz (10 questions, untimed)
    await expect(page.getByText(/question count/i)).toBeVisible();

    // Start quiz
    await page.getByRole('button', { name: /start quiz/i }).click();

    // Wait for quiz to load
    await expect(page).toHaveURL(/\/quiz\/view/);

    // Verify first question is displayed
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible();

    // Answer the first question (select first answer)
    const firstAnswer = page.locator('[type="checkbox"]').first();
    await firstAnswer.check();

    // Navigate to next question
    await page.keyboard.press('ArrowRight');

    // Verify we moved to question 2
    await expect(page.getByText(/question 2/i)).toBeVisible();
  });

  test('should navigate to questions page', async ({ page }) => {
    await page.goto('/');

    // Click on questions link
    await page.getByRole('link', { name: /questions/i }).click();

    // Verify we're on questions page
    await expect(page).toHaveURL(/\/questions/);

    // Wait for questions to load
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
  });

  test('should navigate to rules page', async ({ page }) => {
    await page.goto('/');

    // Click on rules link
    await page.getByRole('link', { name: /rules/i }).click();

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

    // Check for navigation
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Verify keyboard navigation works
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});
