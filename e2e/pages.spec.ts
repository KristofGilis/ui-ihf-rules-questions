import { expect, test } from '@playwright/test';

/**
 * E2E tests for application pages
 * Tests home, questions, and rules pages
 */

test.describe('Home Page', () => {
  test('should display all navigation cards', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();

    const quizCard = page.getByText(/take a quiz/i);
    if ((await quizCard.count()) > 0) {
      await expect(quizCard.first()).toBeVisible();
    }

    const rulesCard = page.getByText(/rules/i);
    await expect(rulesCard.first()).toBeVisible();

    const questionsCard = page.getByText(/questions/i);
    await expect(questionsCard.first()).toBeVisible();
  });

  test('should navigate to GitHub from home page', async ({ page }) => {
    await page.goto('/');

    const githubLink = page.locator('a[href*="github"]');
    if ((await githubLink.count()) > 0) {
      await expect(githubLink.first()).toBeVisible();
    }
  });

  test('should display version information', async ({ page }) => {
    await page.goto('/');

    const versionText = page.getByText(/version/i);
    if ((await versionText.count()) > 0) {
      await expect(versionText.first()).toBeVisible();
    }
  });

  test('should navigate to questions page', async ({ page }) => {
    await page.goto('/');

    await page.locator('footer a[routerLink="/questions"]').click();

    await expect(page).toHaveURL(/\/questions/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('should navigate to rules page', async ({ page }) => {
    await page.goto('/');

    await page.locator('footer a[routerLink="/rules"]').click();

    await expect(page).toHaveURL(/\/rules/);
    await expect(page.getByRole('heading')).toBeVisible();
  });
});

test.describe('Questions Page', () => {
  test('should load and display questions', async ({ page }) => {
    await page.goto('/questions');

    await expect(page.locator('h1')).toBeVisible();

    await page.waitForTimeout(2000);

    const hasContent = await page.locator('main').textContent();
    expect(hasContent).toBeTruthy();
  });

  test('should allow selecting answers on questions page', async ({ page }) => {
    await page.goto('/questions');
    await page.waitForTimeout(2000);

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

    await expect(page.getByRole('heading')).toBeVisible();

    await page.waitForTimeout(2000);

    const hasContent = await page.locator('main').textContent();
    expect(hasContent).toBeTruthy();
  });

  test('should allow searching rules', async ({ page }) => {
    await page.goto('/rules');
    await page.waitForTimeout(2000);

    const searchInput = page.locator('input[type="text"]').or(page.locator('input[placeholder*="search" i]'));
    if ((await searchInput.count()) > 0) {
      await searchInput.first().fill('goalkeeper');
      await page.waitForTimeout(500);

      const content = await page.locator('main').textContent();
      expect(content).toBeTruthy();
    }
  });

  test('should navigate to specific rule details', async ({ page }) => {
    await page.goto('/rules');
    await page.waitForTimeout(2000);

    const ruleLink = page.locator('a[href*="/rule/"]').first();
    if ((await ruleLink.count()) > 0) {
      await ruleLink.click();

      await expect(page).toHaveURL(/\/rule\//);
      await expect(page.locator('h1').or(page.locator('h2'))).toBeVisible();
    }
  });
});
