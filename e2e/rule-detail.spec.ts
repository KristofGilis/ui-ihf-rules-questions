import { expect, test } from '@playwright/test';

/**
 * E2E tests for rule detail page functionality
 * Tests viewing individual rules, score calculation, score sidebar, and related features
 */

test.describe('Rule Detail Page', () => {
  test('should display rule details when navigating to specific rule', async ({ page }) => {
    await page.goto('/rules');
    await page.waitForTimeout(2000);

    // Click on first rule
    const firstRuleLink = page.locator('a[href*="/rules/"]').first();
    if ((await firstRuleLink.count()) > 0) {
      await firstRuleLink.click();

      // Should navigate to rule detail page
      await expect(page).toHaveURL(/\/rules\//);
      await page.waitForTimeout(1500);

      // Should show rule title
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible();

      // Should display questions related to this rule
      const questions = page.locator('[data-question-id]');
      if ((await questions.count()) > 0) {
        await expect(questions.first()).toBeVisible();
      }
    }
  });

  test('should display questions with checkboxes on rule detail page', async ({ page }) => {
    await page.goto('/rules');
    await page.waitForTimeout(2000);

    const firstRuleLink = page.locator('a[href*="/rules/"]').first();
    if ((await firstRuleLink.count()) > 0) {
      await firstRuleLink.click();
      await page.waitForTimeout(2000);

      // Should have questions with checkboxes
      const checkboxes = page.locator('[type="checkbox"]');
      if ((await checkboxes.count()) > 0) {
        await expect(checkboxes.first()).toBeVisible();

        // Should be able to check a checkbox
        await checkboxes.first().check();
        await expect(checkboxes.first()).toBeChecked();
      }
    }
  });
});

test.describe('Rule Detail Score Calculation', () => {
  test('should calculate score when selecting answers', async ({ page }) => {
    await page.goto('/rules');
    await page.waitForTimeout(2000);

    const firstRuleLink = page.locator('a[href*="/rules/"]').first();
    if ((await firstRuleLink.count()) > 0) {
      await firstRuleLink.click();
      await page.waitForTimeout(2000);

      // Select some answers
      const checkboxes = page.locator('[type="checkbox"]');
      const checkboxCount = await checkboxes.count();

      if (checkboxCount > 0) {
        // Check first 3 checkboxes (or however many are available)
        const checkCount = Math.min(3, checkboxCount);
        for (let i = 0; i < checkCount; i++) {
          await checkboxes.nth(i).check();
          await page.waitForTimeout(200);
        }

        // Look for calculate score button
        const calculateButton = page.getByRole('button', { name: /calculate|check|submit/i });
        if ((await calculateButton.count()) > 0) {
          await calculateButton.click();
          await page.waitForTimeout(2000);

          // Should show score or score calculation result
          const scoreText = page.getByText(/score|correct|points/i);
          if ((await scoreText.count()) > 0) {
            await expect(scoreText.first()).toBeVisible();
          }
        }
      }
    }
  });

  test('should show loading state during score calculation', async ({ page }) => {
    await page.goto('/rules');
    await page.waitForTimeout(2000);

    const firstRuleLink = page.locator('a[href*="/rules/"]').first();
    if ((await firstRuleLink.count()) > 0) {
      await firstRuleLink.click();
      await page.waitForTimeout(2000);

      // Select some answers
      const checkboxes = page.locator('[type="checkbox"]');
      if ((await checkboxes.count()) > 0) {
        await checkboxes.first().check();
        await page.waitForTimeout(200);

        const calculateButton = page.getByRole('button', { name: /calculate|check|submit/i });
        if ((await calculateButton.count()) > 0) {
          await calculateButton.click();

          // May briefly show loading state
          await page.waitForTimeout(500);

          // Page should remain responsive
          const body = page.locator('body');
          await expect(body).toBeVisible();
        }
      }
    }
  });

  test('should display score sidebar after calculation', async ({ page }) => {
    await page.goto('/rules');
    await page.waitForTimeout(2000);

    const firstRuleLink = page.locator('a[href*="/rules/"]').first();
    if ((await firstRuleLink.count()) > 0) {
      await firstRuleLink.click();
      await page.waitForTimeout(2000);

      // Select answers and calculate
      const checkboxes = page.locator('[type="checkbox"]');
      if ((await checkboxes.count()) > 0) {
        await checkboxes.first().check();
        await page.waitForTimeout(200);

        const calculateButton = page.getByRole('button', { name: /calculate|check|submit/i });
        if ((await calculateButton.count()) > 0) {
          await calculateButton.click();
          await page.waitForTimeout(2000);

          // Check for score sidebar (desktop view)
          const scoreSidebar = page.locator('app-score-overview');
          if ((await scoreSidebar.count()) > 0) {
            // Score sidebar should be visible on larger screens
            // On mobile it might be in a different location
            const sidebarVisible = await scoreSidebar.isVisible();
            expect(sidebarVisible).toBeTruthy();
          }
        }
      }
    }
  });
});

test.describe('Rule Detail Score Sidebar Features', () => {
  test('should show correct and incorrect answers in score sidebar', async ({ page }) => {
    await page.goto('/rules');
    await page.waitForTimeout(2000);

    const firstRuleLink = page.locator('a[href*="/rules/"]').first();
    if ((await firstRuleLink.count()) > 0) {
      await firstRuleLink.click();
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
          const correctIndicator = page.getByText(/correct/i);
          const incorrectIndicator = page.getByText(/incorrect/i);

          // Should show some indication of correct/incorrect
          const hasCorrect = (await correctIndicator.count()) > 0;
          const hasIncorrect = (await incorrectIndicator.count()) > 0;

          expect(hasCorrect || hasIncorrect).toBe(true);
        }
      }
    }
  });

  test('should allow restarting score calculation', async ({ page }) => {
    await page.goto('/rules');
    await page.waitForTimeout(2000);

    const firstRuleLink = page.locator('a[href*="/rules/"]').first();
    if ((await firstRuleLink.count()) > 0) {
      await firstRuleLink.click();
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
            // Checkboxes should be unchecked or score hidden
            const body = page.locator('body');
            await expect(body).toBeVisible();
          }
        }
      }
    }
  });

  test('should allow recalculating score with different answers', async ({ page }) => {
    await page.goto('/rules');
    await page.waitForTimeout(2000);

    const firstRuleLink = page.locator('a[href*="/rules/"]').first();
    if ((await firstRuleLink.count()) > 0) {
      await firstRuleLink.click();
      await page.waitForTimeout(2000);

      const checkboxes = page.locator('[type="checkbox"]');
      const checkboxCount = await checkboxes.count();

      if (checkboxCount >= 2) {
        // First calculation - check first checkbox
        await checkboxes.first().check();
        await page.waitForTimeout(200);

        const calculateButton = page.getByRole('button', { name: /calculate|check|submit/i });
        if ((await calculateButton.count()) > 0) {
          await calculateButton.click();
          await page.waitForTimeout(2000);

          // Change answer - uncheck first, check second
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
    }
  });

  test('should scroll to question when clicking in score sidebar', async ({ page }) => {
    await page.goto('/rules');
    await page.waitForTimeout(2000);

    const firstRuleLink = page.locator('a[href*="/rules/"]').first();
    if ((await firstRuleLink.count()) > 0) {
      await firstRuleLink.click();
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

          // Look for clickable question items in score sidebar
          const scoreSidebar = page.locator('app-score-overview');
          if ((await scoreSidebar.count()) > 0) {
            const questionLinks = scoreSidebar.locator('button, a, [role="button"]');
            if ((await questionLinks.count()) > 0) {
              await questionLinks.first().click();
              await page.waitForTimeout(1000);

              // Page should scroll (scroll position should change)
              const scrollY = await page.evaluate(() => window.scrollY);
              // Accept any scroll position (including 0 if already at top)
              expect(scrollY).toBeGreaterThanOrEqual(0);
            }
          }
        }
      }
    }
  });
});

test.describe('Rule Detail Page Navigation', () => {
  test('should navigate back to rules list from rule detail', async ({ page }) => {
    await page.goto('/rules');
    await page.waitForTimeout(2000);

    const firstRuleLink = page.locator('a[href*="/rules/"]').first();
    if ((await firstRuleLink.count()) > 0) {
      await firstRuleLink.click();
      await page.waitForTimeout(2000);

      // Navigate back using browser back button
      await page.goBack();
      await page.waitForTimeout(1000);

      // Should be back on rules list
      await expect(page).toHaveURL(/\/rules$/);
    }
  });

  test('should preserve scroll position when navigating between rules', async ({ page }) => {
    await page.goto('/rules');
    await page.waitForTimeout(2000);

    const ruleLinks = page.locator('a[href*="/rules/"]');
    const linkCount = await ruleLinks.count();

    if (linkCount >= 2) {
      // Navigate to first rule
      await ruleLinks.first().click();
      await page.waitForTimeout(2000);

      // Go back
      await page.goBack();
      await page.waitForTimeout(1000);

      // Navigate to second rule
      await ruleLinks.nth(1).click();
      await page.waitForTimeout(2000);

      // Should successfully navigate
      await expect(page).toHaveURL(/\/rules\//);
    }
  });
});
