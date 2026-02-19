import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'site',
          root: './site',
          environment: 'jsdom',
          include: ['__tests__/**/*.test.{js,ts}'],
          coverage: {
            provider: 'v8',
            thresholds: { branches: 95, functions: 95, lines: 95, statements: 95 },
          },
        },
      },
      {
        test: {
          name: 'admin',
          root: './admin-dashboard',
          environment: 'jsdom',
          include: ['__tests__/**/*.test.{js,jsx,ts,tsx}'],
          coverage: {
            provider: 'v8',
            thresholds: { branches: 95, functions: 95, lines: 95, statements: 95 },
          },
        },
      },
      {
        test: {
          name: 'functions',
          root: './functions',
          environment: 'node',
          include: ['__tests__/**/*.test.{js,ts}'],
          coverage: {
            provider: 'v8',
            thresholds: { branches: 95, functions: 95, lines: 95, statements: 95 },
          },
        },
      },
    ],
  },
});
