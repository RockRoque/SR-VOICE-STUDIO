/**
 * Unit tests for site/js/theme-toggle.js
 *
 * The module is an IIFE that conditionally exports via `module.exports` when
 * `typeof module !== 'undefined'`. In Vitest's ESM environment that global is
 * absent, so a plain `import()` would not receive the exported symbols.
 *
 * We use Node's `createRequire` to load the file through the CommonJS
 * resolver, which defines `module` and therefore triggers the export block.
 * The test runs under jsdom so `window`, `document`, and `localStorage` are
 * all available.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// createRequire scoped to this test file so relative paths resolve correctly.
const require = createRequire(import.meta.url);

// Absolute path to the module under test — avoids any path ambiguity.
const MODULE_PATH = path.resolve(__dirname, '../js/theme-toggle.js');

/**
 * Load a fresh copy of the module.
 *
 * `require()` caches modules, so we delete the cache entry before each load
 * to ensure the IIFE re-executes and `initTheme()` runs against the current
 * DOM / localStorage state.
 */
function loadModule() {
  delete require.cache[MODULE_PATH];
  return require(MODULE_PATH);
}

// ---------------------------------------------------------------------------
// Default matchMedia stub — reports "no dark preference".
// ---------------------------------------------------------------------------
function stubMatchMedia({ prefersDark = false } = {}) {
  const stub = vi.fn().mockImplementation((query) => ({
    matches: prefersDark && query === '(prefers-color-scheme: dark)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  Object.defineProperty(window, 'matchMedia', { writable: true, value: stub });
  return stub;
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('Theme Toggle', () => {
  beforeEach(() => {
    // Clean DOM state.
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();

    // Install a default matchMedia stub (light preference).
    stubMatchMedia({ prefersDark: false });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Remove cached module so the next loadModule() is always fresh.
    delete require.cache[MODULE_PATH];
  });

  // -------------------------------------------------------------------------
  // Constants
  // -------------------------------------------------------------------------

  describe('constants', () => {
    it('exports STORAGE_KEY', () => {
      const m = loadModule();
      expect(m.STORAGE_KEY).toBe('sr-voice-studio-theme');
    });

    it('exports DARK constant', () => {
      const m = loadModule();
      expect(m.DARK).toBe('dark');
    });

    it('exports LIGHT constant', () => {
      const m = loadModule();
      expect(m.LIGHT).toBe('light');
    });
  });

  // -------------------------------------------------------------------------
  // getSystemPreference
  // -------------------------------------------------------------------------

  describe('getSystemPreference()', () => {
    it('returns "light" when system has no dark preference', () => {
      stubMatchMedia({ prefersDark: false });
      const m = loadModule();
      expect(m.getSystemPreference()).toBe('light');
    });

    it('returns "dark" when system prefers dark mode', () => {
      stubMatchMedia({ prefersDark: true });
      const m = loadModule();
      expect(m.getSystemPreference()).toBe('dark');
    });

    it('returns "light" when matchMedia is unavailable', () => {
      // Simulate an environment without matchMedia.
      Object.defineProperty(window, 'matchMedia', { writable: true, value: undefined });
      const m = loadModule();
      expect(m.getSystemPreference()).toBe('light');
    });
  });

  // -------------------------------------------------------------------------
  // getSavedTheme
  // -------------------------------------------------------------------------

  describe('getSavedTheme()', () => {
    it('returns saved theme set during initTheme when localStorage was initially empty', () => {
      // loadModule() runs the IIFE which calls initTheme() → setTheme('light')
      // so localStorage will have 'light' after module load
      const m = loadModule();
      expect(m.getSavedTheme()).toBe('light');
    });

    it('returns null when localStorage is cleared after module load', () => {
      const m = loadModule();
      localStorage.clear();
      expect(m.getSavedTheme()).toBeNull();
    });

    it('returns the saved theme when one is stored', () => {
      localStorage.setItem('sr-voice-studio-theme', 'dark');
      const m = loadModule();
      expect(m.getSavedTheme()).toBe('dark');
    });

    it('returns "light" from localStorage when saved as light', () => {
      localStorage.setItem('sr-voice-studio-theme', 'light');
      const m = loadModule();
      expect(m.getSavedTheme()).toBe('light');
    });

    it('returns null when localStorage.getItem throws', () => {
      const m = loadModule();
      // Spy on getItem to make it throw
      const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('storage denied');
      });
      expect(m.getSavedTheme()).toBeNull();
      spy.mockRestore();
    });
  });

  // -------------------------------------------------------------------------
  // setTheme
  // -------------------------------------------------------------------------

  describe('setTheme()', () => {
    it('sets data-theme="dark" on the html element', () => {
      const m = loadModule();
      m.setTheme('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('sets data-theme="light" on the html element', () => {
      const m = loadModule();
      m.setTheme('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('persists the theme to localStorage under the correct key', () => {
      const m = loadModule();
      m.setTheme('dark');
      expect(localStorage.getItem('sr-voice-studio-theme')).toBe('dark');
    });

    it('still updates the DOM even when localStorage.setItem throws', () => {
      const m = loadModule();
      const original = localStorage.setItem.bind(localStorage);
      localStorage.setItem = () => { throw new Error('quota exceeded'); };

      // Must not throw and must still update the attribute.
      expect(() => m.setTheme('dark')).not.toThrow();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      localStorage.setItem = original;
    });

    it('overwrites a previously set theme', () => {
      const m = loadModule();
      m.setTheme('dark');
      m.setTheme('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(localStorage.getItem('sr-voice-studio-theme')).toBe('light');
    });
  });

  // -------------------------------------------------------------------------
  // initTheme  (also called automatically when module loads)
  // -------------------------------------------------------------------------

  describe('initTheme()', () => {
    it('applies a saved theme from localStorage on module load', () => {
      localStorage.setItem('sr-voice-studio-theme', 'dark');
      // The IIFE calls initTheme() immediately, so the attribute is set during
      // require().
      loadModule();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('falls back to light when no theme is saved and system is light', () => {
      stubMatchMedia({ prefersDark: false });
      loadModule();
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('falls back to dark when no theme is saved and system prefers dark', () => {
      stubMatchMedia({ prefersDark: true });
      loadModule();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('saved theme takes precedence over system dark preference', () => {
      localStorage.setItem('sr-voice-studio-theme', 'light');
      stubMatchMedia({ prefersDark: true });
      loadModule();
      // Explicit saved value wins over OS preference.
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('calling initTheme() explicitly applies the current saved theme', () => {
      const m = loadModule();
      localStorage.setItem('sr-voice-studio-theme', 'dark');
      // Clear the attribute that the auto-init just set.
      document.documentElement.removeAttribute('data-theme');
      m.initTheme();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  // -------------------------------------------------------------------------
  // toggleTheme
  // -------------------------------------------------------------------------

  describe('toggleTheme()', () => {
    it('switches from light to dark', () => {
      const m = loadModule();
      document.documentElement.setAttribute('data-theme', 'light');
      m.toggleTheme();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('switches from dark to light', () => {
      const m = loadModule();
      document.documentElement.setAttribute('data-theme', 'dark');
      m.toggleTheme();
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('defaults to dark when data-theme is unrecognised', () => {
      // If current !== DARK, the next theme is always DARK.
      const m = loadModule();
      document.documentElement.setAttribute('data-theme', 'unknown');
      m.toggleTheme();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('persists the toggled value to localStorage', () => {
      const m = loadModule();
      document.documentElement.setAttribute('data-theme', 'light');
      m.toggleTheme();
      expect(localStorage.getItem('sr-voice-studio-theme')).toBe('dark');
    });

    it('round-trips correctly: two toggles restore the original theme', () => {
      const m = loadModule();
      document.documentElement.setAttribute('data-theme', 'light');
      m.toggleTheme();
      m.toggleTheme();
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });
});
