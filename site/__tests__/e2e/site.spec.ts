/**
 * E2E smoke tests for the public site.
 *
 * Verifies that the page loads correctly and that all major structural elements
 * are present and visible. Run against the local static server configured in
 * playwright.config.ts (npx serve site -l 3000).
 */

import { test, expect } from '@playwright/test';

test.describe('Public Site Smoke Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // -------------------------------------------------------------------------
  // Page-level
  // -------------------------------------------------------------------------

  test('page loads with the correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Sarah Roque Voice Studio');
  });

  // -------------------------------------------------------------------------
  // Structural sections
  // -------------------------------------------------------------------------

  const SECTIONS = [
    'hero',
    'about',
    'schedule',
    'rates',
    'gallery',
    'reviews',
    'policies',
    'faqs',
    'footer',
  ] as const;

  for (const id of SECTIONS) {
    test(`section #${id} exists in the DOM`, async ({ page }) => {
      await expect(page.locator(`#${id}`)).toBeAttached();
    });
  }

  test('all main sections are present', async ({ page }) => {
    for (const id of SECTIONS) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
  });

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------

  const NAV_LINKS = ['about', 'schedule', 'rates', 'gallery', 'reviews', 'policies', 'faqs'] as const;

  test('navigation links are present for all sections', async ({ page }) => {
    for (const link of NAV_LINKS) {
      await expect(page.locator(`nav a[href="#${link}"]`)).toBeAttached();
    }
  });

  // -------------------------------------------------------------------------
  // Hero content
  // -------------------------------------------------------------------------

  test('hero displays the artist name', async ({ page }) => {
    await expect(page.locator('.text-hero-name')).toContainText('Sarah Roque');
  });

  test('hero displays the studio label', async ({ page }) => {
    await expect(page.locator('.text-hero-studio')).toContainText('Voice Studio');
  });

  // -------------------------------------------------------------------------
  // Theme toggle
  // -------------------------------------------------------------------------

  test('theme toggle button is visible', async ({ page }) => {
    await expect(page.locator('#theme-toggle')).toBeVisible();
  });

  test('theme toggle button has an accessible aria-label', async ({ page }) => {
    const btn = page.locator('#theme-toggle');
    await expect(btn).toHaveAttribute('aria-label');
    const label = await btn.getAttribute('aria-label');
    expect(label).toBeTruthy();
  });

  // -------------------------------------------------------------------------
  // Default theme state
  // -------------------------------------------------------------------------

  test('page loads with light theme by default', async ({ page }) => {
    // The HTML element ships with data-theme="light" in the markup; the theme
    // script reinforces this before paint.
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
});
