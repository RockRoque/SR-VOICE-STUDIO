/**
 * E2E tests for the theme-toggle feature.
 *
 * Covers:
 *  - Default theme on load
 *  - Toggle button click behavior (light → dark → light)
 *  - Persistence across page reload via localStorage
 *  - Observable CSS side-effect (body background color in dark mode)
 *
 * Run against the local static server configured in playwright.config.ts
 * (npx serve site -l 3000).
 */

import { test, expect } from '@playwright/test';

test.describe('Theme Toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before every test so theme state never leaks between
    // tests regardless of execution order.
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    // Reload so the theme script picks up the cleared storage.
    await page.reload();
  });

  // -------------------------------------------------------------------------
  // Default state
  // -------------------------------------------------------------------------

  test('defaults to light theme on first visit', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  // -------------------------------------------------------------------------
  // Toggle interactions
  // -------------------------------------------------------------------------

  test('clicking the toggle switches to dark theme', async ({ page }) => {
    await page.locator('#theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('clicking the toggle a second time switches back to light theme', async ({ page }) => {
    await page.locator('#theme-toggle').click();
    await page.locator('#theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('repeated toggles cycle correctly', async ({ page }) => {
    const toggle = page.locator('#theme-toggle');

    await toggle.click(); // light → dark
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await toggle.click(); // dark → light
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    await toggle.click(); // light → dark again
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  // -------------------------------------------------------------------------
  // Persistence
  // -------------------------------------------------------------------------

  test('dark theme persists across a page reload', async ({ page }) => {
    await page.locator('#theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.reload();

    // Theme script reads localStorage and re-applies the saved theme before
    // the first paint.
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('light theme persists across a page reload after toggling back', async ({ page }) => {
    await page.locator('#theme-toggle').click(); // → dark
    await page.locator('#theme-toggle').click(); // → light

    await page.reload();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('localStorage stores the chosen theme under the correct key', async ({ page }) => {
    await page.locator('#theme-toggle').click(); // → dark

    const saved = await page.evaluate(() =>
      localStorage.getItem('sr-voice-studio-theme'),
    );
    expect(saved).toBe('dark');
  });

  // -------------------------------------------------------------------------
  // Visual / CSS side-effect
  // -------------------------------------------------------------------------

  test('dark theme changes the CSS custom property --color-bg', async ({ page }) => {
    await page.locator('#theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // Verify the CSS variable resolves to the dark theme value on the html element.
    const colorBg = await page.evaluate(
      () => getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim(),
    );
    expect(colorBg).toBe('#130f0c');
  });

  test('light theme applies the correct background color to the body', async ({ page }) => {
    // Light theme (default): --color-bg: #fff2d8 → rgb(255, 242, 216).
    const bgColor = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );
    expect(bgColor).toBe('rgb(255, 242, 216)');
  });
});
