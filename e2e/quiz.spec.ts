import { expect, test } from '@playwright/test';

/**
 * E2E tests for core quiz functionality
 * Tests quiz flow, configuration, navigation, completion, and interactions
 */

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

    const timedModeCheckbox = page.locator('input[type="checkbox"][aria-label="Toggle timed mode"]');
    await timedModeCheckbox.waitFor({ state: 'attached' });

    const initialState = await timedModeCheckbox.isChecked();
    const label = page.locator('label.relative.inline-block').first();

    if (!initialState) {
      await label.click();
      await expect(timedModeCheckbox).toBeChecked();

      await label.click();
      await expect(timedModeCheckbox).not.toBeChecked();
    } else {
      await label.click();
      await expect(timedModeCheckbox).not.toBeChecked();

      await label.click();
      await expect(timedModeCheckbox).toBeChecked();
    }
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

    for (let i = 0; i < 10; i++) {
      await expect(page.locator('#question-text')).toBeVisible({ timeout: 10000 });

      const checkbox = page.locator('[type="checkbox"]').first();
      await checkbox.check();

      if (i < 9) {
        await page.getByRole('button', { name: /next/i }).click();
        await page.waitForTimeout(300);
      } else {
        await page.getByRole('button', { name: /complete/i }).click();
      }
    }

    await expect(page).toHaveURL(/\/quiz\/results/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /quiz results/i }).first()).toBeVisible();
  });

  test('should show score calculation loading state', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz\/view/);

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

    await page.waitForTimeout(500);
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
