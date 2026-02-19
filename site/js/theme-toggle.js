(function () {
  'use strict';

  const STORAGE_KEY = 'sr-voice-studio-theme';
  const DARK = 'dark';
  const LIGHT = 'light';

  function getSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return DARK;
    }
    return LIGHT;
  }

  function getSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // localStorage unavailable
    }
  }

  function initTheme() {
    const saved = getSavedTheme();
    const theme = saved || getSystemPreference();
    setTheme(theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === DARK ? LIGHT : DARK;
    setTheme(next);
  }

  // Initialize on load
  initTheme();

  // Listen for system preference changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!getSavedTheme()) {
        setTheme(e.matches ? DARK : LIGHT);
      }
    });
  }

  // Bind toggle button
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', toggleTheme);
    }
  });

  // Export for testing
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getSystemPreference, getSavedTheme, setTheme, initTheme, toggleTheme, STORAGE_KEY, DARK, LIGHT };
  }
})();
