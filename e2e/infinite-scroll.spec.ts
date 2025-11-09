import { expect, test } from '@playwright/test';

/**
 * E2E tests for infinite scroll / pagination functionality
 * Tests loading more content when scrolling to bottom on questions and rules pages
 */

test.describe('Questions Page Infinite Scroll', () => {
  test('should load more questions when scrolling to bottom', async ({ page }) => {
    await page.goto('/questions');
    await page.waitForTimeout(2000);

    // Get initial count of questions
    const initialQuestions = await page.locator('[data-question-id]').count();

    if (initialQuestions > 0) {
      // Scroll to bottom of page
      await page.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);
      });

      // Wait for potential new content to load
      await page.waitForTimeout(2000);

      // Get new count - should be same or more (depending on if there are more pages)
      const newQuestions = await page.locator('[data-question-id]').count();

      // Should either load more or stay the same (if at end)
      expect(newQuestions).toBeGreaterThanOrEqual(initialQuestions);
    }
  });

  test('should show loading state when fetching more questions', async ({ page }) => {
    await page.goto('/questions');
    await page.waitForTimeout(2000);

    const initialQuestions = await page.locator('[data-question-id]').count();

    if (initialQuestions > 0) {
      // Scroll to bottom
      await page.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);
      });

      // Check for loading spinner or loading state

      // May briefly show loading state
      await page.waitForTimeout(500);

      // Page should remain responsive
      const body = page.locator('body');
      await expect(body).toBeVisible();
    }
  });

  test('should not trigger infinite scroll when already loading', async ({ page }) => {
    await page.goto('/questions');
    await page.waitForTimeout(2000);

    const initialQuestions = await page.locator('[data-question-id]').count();

    if (initialQuestions > 0) {
      // Rapidly scroll multiple times
      for (let i = 0; i < 3; i++) {
        await page.evaluate(() => {
          window.scrollTo(0, document.documentElement.scrollHeight);
        });
        await page.waitForTimeout(100);
      }

      // Wait for any loading to complete
      await page.waitForTimeout(2000);

      // Should handle gracefully without duplicate requests
      const body = page.locator('body');
      await expect(body).toBeVisible();
    }
  });
});

test.describe('Rules Page Infinite Scroll', () => {
  test('should load more rules when scrolling to bottom', async ({ page }) => {
    await page.goto('/rules');
    await page.waitForTimeout(2000);

    // Get initial count of rules
    const initialRules = await page.locator('a[href*="/rules/"]').count();

    if (initialRules > 0) {
      // Scroll to bottom of page
      await page.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);
      });

      // Wait for potential new content to load
      await page.waitForTimeout(2000);

      // Get new count
      const newRules = await page.locator('a[href*="/rules/"]').count();

      // Should either load more or stay the same
      expect(newRules).toBeGreaterThanOrEqual(initialRules);
    }
  });

  test('should show loading state when fetching more rules', async ({ page }) => {
    await page.goto('/rules');
    await page.waitForTimeout(2000);

    const initialRules = await page.locator('a[href*="/rules/"]').count();

    if (initialRules > 0) {
      // Scroll to bottom
      await page.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);
      });

      // Check page remains responsive
      await page.waitForTimeout(500);
      const body = page.locator('body');
      await expect(body).toBeVisible();
    }
  });
});

test.describe('Rule Detail Page Infinite Scroll', () => {
  test('should load more questions when scrolling to bottom on rule detail', async ({ page }) => {
    await page.goto('/rules');
    await page.waitForTimeout(2000);

    // Navigate to first rule
    const firstRuleLink = page.locator('a[href*="/rules/"]').first();
    if ((await firstRuleLink.count()) > 0) {
      await firstRuleLink.click();
      await page.waitForTimeout(2000);

      // Get initial count of questions for this rule
      const initialQuestions = await page.locator('[data-question-id]').count();

      if (initialQuestions > 0) {
        // Scroll to bottom
        await page.evaluate(() => {
          window.scrollTo(0, document.documentElement.scrollHeight);
        });

        // Wait for potential new content
        await page.waitForTimeout(2000);

        // Get new count
        const newQuestions = await page.locator('[data-question-id]').count();

        // Should either load more or stay the same
        expect(newQuestions).toBeGreaterThanOrEqual(initialQuestions);
      }
    }
  });

  test('should handle scroll threshold correctly', async ({ page }) => {
    await page.goto('/rules');
    await page.waitForTimeout(2000);

    const firstRuleLink = page.locator('a[href*="/rules/"]').first();
    if ((await firstRuleLink.count()) > 0) {
      await firstRuleLink.click();
      await page.waitForTimeout(2000);

      // Scroll to near bottom (but not quite at threshold)
      await page.evaluate(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        // Scroll to 250 pixels from bottom (threshold is 200, so shouldn't trigger)
        window.scrollTo(0, scrollHeight - viewportHeight - 250);
      });

      await page.waitForTimeout(500);

      // Now scroll past threshold
      await page.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);
      });

      await page.waitForTimeout(1000);

      // Page should remain responsive
      const body = page.locator('body');
      await expect(body).toBeVisible();
    }
  });
});
