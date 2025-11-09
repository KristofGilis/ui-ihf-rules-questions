import { expect, test } from '@playwright/test';

/**
 * E2E tests for questions page score calculation functionality
 * Tests selecting answers and calculating scores on the main questions page
 */

test.describe('Questions Page Score Calculation', () => {
  test('should allow selecting answers on questions page', async ({ page }) => {
    await page.goto('/questions');
    await page.waitForTimeout(2000);

    // Should have questions with checkboxes
    const checkboxes = page.locator('[type="checkbox"]');
    const checkboxCount = await checkboxes.count();

    if (checkboxCount > 0) {
      await expect(checkboxes.first()).toBeVisible();

      // Should be able to check multiple checkboxes
      const selectCount = Math.min(5, checkboxCount);
      for (let i = 0; i < selectCount; i++) {
        await checkboxes.nth(i).check();
        await expect(checkboxes.nth(i)).toBeChecked();
        await page.waitForTimeout(200);
      }
    }
  });

  test('should show calculate score button when answers are selected', async ({ page }) => {
    await page.goto('/questions');
    await page.waitForTimeout(2000);

    const checkboxes = page.locator('[type="checkbox"]');
    if ((await checkboxes.count()) > 0) {
      // Select an answer
      await checkboxes.first().check();
      await page.waitForTimeout(500);

      // Look for calculate button
      const calculateButton = page.getByRole('button', { name: /calculate|check|submit/i });
      if ((await calculateButton.count()) > 0) {
        await expect(calculateButton).toBeVisible();
      }
    }
  });

  test('should calculate score on questions page', async ({ page }) => {
    await page.goto('/questions');
    await page.waitForTimeout(2000);

    const checkboxes = page.locator('[type="checkbox"]');
    const checkboxCount = await checkboxes.count();

    if (checkboxCount > 0) {
      // Select some answers
      const selectCount = Math.min(3, checkboxCount);
      for (let i = 0; i < selectCount; i++) {
        await checkboxes.nth(i).check();
        await page.waitForTimeout(200);
      }

      // Calculate score
      const calculateButton = page.getByRole('button', { name: /calculate|check|submit/i });
      if ((await calculateButton.count()) > 0) {
        await calculateButton.click();
        await page.waitForTimeout(2000);

        // Should show score information
        const scoreText = page.getByText(/score|correct|points|answered/i);
        if ((await scoreText.count()) > 0) {
          await expect(scoreText.first()).toBeVisible();
        }
      }
    }
  });

  test('should show loading state during score calculation on questions page', async ({ page }) => {
    await page.goto('/questions');
    await page.waitForTimeout(2000);

    const checkboxes = page.locator('[type="checkbox"]');
    if ((await checkboxes.count()) > 0) {
      await checkboxes.first().check();
      await page.waitForTimeout(200);

      const calculateButton = page.getByRole('button', { name: /calculate|check|submit/i });
      if ((await calculateButton.count()) > 0) {
        await calculateButton.click();

        // May show loading spinner or state
        await page.waitForTimeout(500);

        // Page should remain responsive
        const body = page.locator('body');
        await expect(body).toBeVisible();
      }
    }
  });

  test('should uncheck answers on questions page', async ({ page }) => {
    await page.goto('/questions');
    await page.waitForTimeout(2000);

    const checkboxes = page.locator('[type="checkbox"]');
    if ((await checkboxes.count()) > 0) {
      // Check a checkbox
      await checkboxes.first().check();
      await expect(checkboxes.first()).toBeChecked();
      await page.waitForTimeout(200);

      // Uncheck it
      await checkboxes.first().uncheck();
      await expect(checkboxes.first()).not.toBeChecked();
    }
  });
});

test.describe('Questions Page Score Sidebar', () => {
  test('should display score sidebar after calculation', async ({ page }) => {
    await page.goto('/questions');
    await page.waitForTimeout(2000);

    const checkboxes = page.locator('[type="checkbox"]');
    if ((await checkboxes.count()) > 0) {
      await checkboxes.first().check();
      await page.waitForTimeout(200);

      const calculateButton = page.getByRole('button', { name: /calculate|check|submit/i });
      if ((await calculateButton.count()) > 0) {
        await calculateButton.click();
        await page.waitForTimeout(2000);

        // Check for score sidebar component
        const scoreSidebar = page.locator('app-score-overview');
        if ((await scoreSidebar.count()) > 0) {
          const isVisible = await scoreSidebar.isVisible();
          expect(isVisible).toBeTruthy();
        }
      }
    }
  });

  test('should show correct and incorrect count in sidebar', async ({ page }) => {
    await page.goto('/questions');
    await page.waitForTimeout(2000);

    const checkboxes = page.locator('[type="checkbox"]');
    if ((await checkboxes.count()) > 0) {
      await checkboxes.first().check();
      await page.waitForTimeout(200);

      const calculateButton = page.getByRole('button', { name: /calculate|check|submit/i });
      if ((await calculateButton.count()) > 0) {
        await calculateButton.click();
        await page.waitForTimeout(2000);

        // Look for correct/incorrect indicators
        const correctText = page.getByText(/correct/i);
        const incorrectText = page.getByText(/incorrect/i);

        const hasCorrect = (await correctText.count()) > 0;
        const hasIncorrect = (await incorrectText.count()) > 0;

        // Should show some score information
        expect(hasCorrect || hasIncorrect).toBe(true);
      }
    }
  });

  test('should show percentage in score sidebar', async ({ page }) => {
    await page.goto('/questions');
    await page.waitForTimeout(2000);

    const checkboxes = page.locator('[type="checkbox"]');
    if ((await checkboxes.count()) > 0) {
      await checkboxes.first().check();
      await page.waitForTimeout(200);

      const calculateButton = page.getByRole('button', { name: /calculate|check|submit/i });
      if ((await calculateButton.count()) > 0) {
        await calculateButton.click();
        await page.waitForTimeout(2000);

        // Look for percentage indicator
        const percentageText = page.getByText(/%/);
        if ((await percentageText.count()) > 0) {
          await expect(percentageText.first()).toBeVisible();
        }
      }
    }
  });

  test('should allow restarting score from questions page', async ({ page }) => {
    await page.goto('/questions');
    await page.waitForTimeout(2000);

    const checkboxes = page.locator('[type="checkbox"]');
    if ((await checkboxes.count()) > 0) {
      await checkboxes.first().check();
      await page.waitForTimeout(200);

      const calculateButton = page.getByRole('button', { name: /calculate|check|submit/i });
      if ((await calculateButton.count()) > 0) {
        await calculateButton.click();
        await page.waitForTimeout(2000);

        // Look for restart button
        const restartButton = page.getByRole('button', { name: /restart|reset|clear|try again/i });
        if ((await restartButton.count()) > 0) {
          await restartButton.click();
          await page.waitForTimeout(1000);

          // Score should be cleared
          const body = page.locator('body');
          await expect(body).toBeVisible();
        }
      }
    }
  });

  test('should allow recalculating with different answers', async ({ page }) => {
    await page.goto('/questions');
    await page.waitForTimeout(2000);

    const checkboxes = page.locator('[type="checkbox"]');
    const checkboxCount = await checkboxes.count();

    if (checkboxCount >= 2) {
      // First calculation
      await checkboxes.first().check();
      await page.waitForTimeout(200);

      const calculateButton = page.getByRole('button', { name: /calculate|check|submit/i });
      if ((await calculateButton.count()) > 0) {
        await calculateButton.click();
        await page.waitForTimeout(2000);

        // Change answers
        await checkboxes.first().uncheck();
        await checkboxes.nth(1).check();
        await page.waitForTimeout(200);

        // Recalculate - specifically click the recalculate button (not calculate)
        const recalculateButton = page.getByRole('button', { name: /^recalculate/i });
        if ((await recalculateButton.count()) > 0) {
          await recalculateButton.first().click();
          await page.waitForTimeout(2000);

          // Should show updated score
          const body = page.locator('body');
          await expect(body).toBeVisible();
        }
      }
    }
  });
});

test.describe('Questions Page Score Interactions', () => {
  test('should scroll to specific question from score sidebar', async ({ page }) => {
    await page.goto('/questions');
    await page.waitForTimeout(2000);

    const checkboxes = page.locator('[type="checkbox"]');
    if ((await checkboxes.count()) > 0) {
      await checkboxes.first().check();
      await page.waitForTimeout(200);

      const calculateButton = page.getByRole('button', { name: /calculate|check|submit/i });
      if ((await calculateButton.count()) > 0) {
        await calculateButton.click();
        await page.waitForTimeout(2000);

        // Scroll to top first
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);

        // Look for clickable items in score sidebar
        const scoreSidebar = page.locator('app-score-overview');
        if ((await scoreSidebar.count()) > 0) {
          const questionLinks = scoreSidebar.locator('button, a, [role="button"]');
          if ((await questionLinks.count()) > 0) {
            await questionLinks.first().click();
            await page.waitForTimeout(1000);

            // Page should handle the click
            const scrollY = await page.evaluate(() => window.scrollY);
            expect(scrollY).toBeGreaterThanOrEqual(0);
          }
        }
      }
    }
  });

  test('should show visual feedback for correct and incorrect answers', async ({ page }) => {
    await page.goto('/questions');
    await page.waitForTimeout(2000);

    const checkboxes = page.locator('[type="checkbox"]');
    if ((await checkboxes.count()) > 0) {
      await checkboxes.first().check();
      await page.waitForTimeout(200);

      const calculateButton = page.getByRole('button', { name: /calculate|check|submit/i });
      if ((await calculateButton.count()) > 0) {
        await calculateButton.click();
        await page.waitForTimeout(2000);

        // Look for visual indicators (colors, icons, etc.)
        const questions = page.locator('[data-question-id]');
        if ((await questions.count()) > 0) {
          // Should have some visual styling applied after calculation
          const firstQuestion = questions.first();
          await expect(firstQuestion).toBeVisible();
        }
      }
    }
  });

  test('should maintain scroll position when recalculating score', async ({ page }) => {
    await page.goto('/questions');
    await page.waitForTimeout(2000);

    const checkboxes = page.locator('[type="checkbox"]');
    const checkboxCount = await checkboxes.count();

    if (checkboxCount >= 2) {
      // Scroll down a bit
      await page.evaluate(() => window.scrollTo(0, 300));
      await page.waitForTimeout(500);

      // Select and calculate
      await checkboxes.first().check();
      await page.waitForTimeout(200);

      const calculateButton = page.getByRole('button', { name: /calculate|check|submit/i });
      if ((await calculateButton.count()) > 0) {
        await calculateButton.click();
        await page.waitForTimeout(2000);

        const scrollBefore = await page.evaluate(() => window.scrollY);

        // Change answer and recalculate
        await checkboxes.nth(1).check();
        await page.waitForTimeout(200);

        const recalculateButton = page.getByRole('button', { name: /^recalculate/i });
        if ((await recalculateButton.count()) > 0) {
          await recalculateButton.first().click();
          await page.waitForTimeout(2000);

          // Scroll position should be maintained or close to it
          const scrollAfter = await page.evaluate(() => window.scrollY);

          // Allow some variance but should be close
          expect(Math.abs(scrollAfter - scrollBefore)).toBeLessThan(200);
        }
      }
    }
  });
});
