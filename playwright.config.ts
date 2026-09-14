import { defineConfig, devices } from '@playwright/test';

/**
 * Smoke tests E2E para storebasc (AnandaStore V2)
 * Objetivo: validar que las rutas públicas críticas renderizan en el despliegue real.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  retries: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'https://storebasc.vercel.app',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
