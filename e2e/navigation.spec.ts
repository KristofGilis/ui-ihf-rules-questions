import { expect, test } from '@playwright/test';

/**
 * E2E tests for browser navigation features
 * Tests back/forward buttons, direct URL navigation, and deep linking
 */

test.describe('Browser Navigation', () => {
  test('should support back button navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/(home)?$/);

    // Navigate to rules
    await page.click('a[href="/rules"]');
    await expect(page).toHaveURL(/\/rules/);
    await page.waitForLoadState('networkidle');

    // Go back
    await page.goBack();
    await expect(page).toHaveURL(/\/(home)?$/);
  });

  test('should support forward button navigation', async ({ page }) => {
    await page.goto('/');

    // Navigate to questions
    await page.click('a[href="/questions"]');
    await expect(page).toHaveURL(/\/questions/);
    await page.waitForLoadState('networkidle');

    // Go back
    await page.goBack();
    await expect(page).toHaveURL(/\/(home)?$/);

    // Go forward
    await page.goForward();
    await expect(page).toHaveURL(/\/questions/);
  });

  test('should handle direct URL navigation to quiz setup', async ({ page }) => {
    await page.goto('/quiz');

    await expect(page).toHaveURL(/\/quiz/);
    await expect(page.locator('button', { hasText: '10' }).first()).toBeVisible();
    await expect(page.locator('button', { hasText: '15' })).toBeVisible();
  });

  test('should handle direct URL navigation to rules', async ({ page }) => {
    await page.goto('/rules');

    await expect(page).toHaveURL(/\/rules/);
    await expect(page.getByRole('heading')).toBeVisible();
  });

  test('should handle direct URL navigation to questions', async ({ page }) => {
    await page.goto('/questions');

    await expect(page).toHaveURL(/\/questions/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should handle deep linking to specific rule', async ({ page }) => {
    // First get a rule ID from the rules page
    await page.goto('/rules');
    await page.waitForTimeout(2000);

    const firstRuleLink = page.locator('a[href*="/rule/"]').first();
    if ((await firstRuleLink.count()) > 0) {
      const href = await firstRuleLink.getAttribute('href');

      // Navigate directly to that rule
      await page.goto(href!);

      await expect(page).toHaveURL(/\/rule\//);
      await expect(page.locator('h1').or(page.locator('h2'))).toBeVisible();
    }
  });

  test('should maintain state across navigation', async ({ page }) => {
    await page.goto('/');

    // Set theme to dark
    const themeButton = page
      .locator('button[aria-label*="theme" i]')
      .or(page.locator('button[aria-label*="Toggle theme" i]'));
    await themeButton.click();
    await page.waitForTimeout(300);

    const darkOption = page.locator('button[role="menuitem"]').filter({ hasText: /dark/i });
    if ((await darkOption.count()) > 0) {
      await darkOption.first().click();
      await page.waitForTimeout(300);
    }

    // Navigate to another page
    await page.click('a[href="/rules"]');
    await expect(page).toHaveURL(/\/rules/);

    // Theme should persist
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveClass(/dark/);
  });

  test('should handle navigation during quiz without losing progress', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    // Wait for quiz to load
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});

    // Answer first question
    const checkbox = page.locator('[type="checkbox"]').first();
    await checkbox.waitFor({ state: 'visible', timeout: 15000 });
    await checkbox.check();

    // Try to go back (should trigger confirmation or prevent)
    const dialogPromise = page.waitForEvent('dialog', { timeout: 2000 }).catch(() => null);

    await page.goBack();

    const dialog = await dialogPromise;
    if (dialog) {
      // Dialog was shown, dismiss it
      await dialog.dismiss();
      // Should still be on quiz page
      await expect(page).toHaveURL(/\/quiz\/view/);
    }
  });

  test('should handle navigation from results page', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

    // Wait for quiz to load
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});

    // Answer first question only
    const checkbox = page.locator('[type="checkbox"]').first();
    await checkbox.waitFor({ state: 'visible', timeout: 15000 });
    await checkbox.check();

    // Navigate back to setup (triggers dialog or allows navigation)
    await page.goto('/quiz');

    // Should be able to navigate
    await expect(page.locator('button', { hasText: '10' }).first()).toBeVisible();
  });

  test('should handle hash fragments in URLs', async ({ page }) => {
    await page.goto('/#section');

    // Should still load the home page
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should handle query parameters gracefully', async ({ page }) => {
    await page.goto('/rules?search=goalkeeper');

    await expect(page).toHaveURL(/\/rules/);
    await expect(page.getByRole('heading')).toBeVisible();

    // Query params should be in URL
    expect(page.url()).toContain('search=goalkeeper');
  });

  test('should redirect root to home', async ({ page }) => {
    await page.goto('/');

    // Should redirect to /home or show home content
    await expect(page.locator('h1')).toBeVisible();

    const url = page.url();
    expect(url).toMatch(/\/(home)?$/);
  });
});
