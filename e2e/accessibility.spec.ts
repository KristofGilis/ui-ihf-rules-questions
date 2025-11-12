import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * E2E tests for accessibility
 * Tests WCAG compliance, keyboard navigation, and responsive design
 */

test.describe('Accessibility Compliance', () => {
  test('should pass automated accessibility tests on home page', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations:', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have accessible quiz page', async ({ page }) => {
    await page.goto('/quiz');

    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.log('Quiz page accessibility violations:', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have accessible questions page', async ({ page }) => {
    await page.goto('/questions');

    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.log(
        'Questions page accessibility violations:',
        JSON.stringify(accessibilityScanResults.violations, null, 2)
      );
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper landmarks', async ({ page }) => {
    await page.goto('/');

    const main = page.locator('main');
    await expect(main).toBeVisible();

    const nav = page.locator('header nav[role="navigation"]');
    await expect(nav).toBeVisible();
  });

  test('should support keyboard navigation on home page', async ({ page }) => {
    await page.goto('/');

    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});

test.describe('Keyboard Navigation', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.clearPermissions();
  });

  test('should support tab navigation through quiz answers', async ({ page }) => {
    await page.goto('/quiz');
    await expect(page.locator('button', { hasText: '10' }).first()).toBeVisible();

    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    // Wait for quiz to load
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});

    // Wait for checkboxes to appear
    const checkbox = page.locator('[type="checkbox"]').first();
    await checkbox.waitFor({ state: 'visible', timeout: 15000 });

    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should allow selecting answers with Space key', async ({ page }) => {
    await page.goto('/quiz');
    await expect(page.locator('button', { hasText: '10' }).first()).toBeVisible();

    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    // Wait for quiz to load
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});

    // Wait for either question text or checkbox to appear
    const checkbox = page.locator('[type="checkbox"]').first();
    await checkbox.waitFor({ state: 'visible', timeout: 15000 });

    await checkbox.focus();

    await page.keyboard.press('Space');
    await expect(checkbox).toBeChecked();

    await page.keyboard.press('Space');
    await expect(checkbox).not.toBeChecked();
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page).toHaveTitle(/IHF Rules Quiz/);

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    await page.locator('footer a[routerLink="/quiz"]').click();
    await expect(page).toHaveURL(/\/quiz/);
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page).toHaveTitle(/IHF Rules Quiz/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    await expect(page).toHaveTitle(/IHF Rules Quiz/);
    await expect(page.locator('main')).toBeVisible();
  });
});
