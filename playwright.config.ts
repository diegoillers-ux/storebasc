import { defineConfig, devices } from '@playwright/test';

// Smoke de renderizado: no acredita pagos, inventario ni datos reales.
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: process.env.E2E_BASE_URL ? undefined : {
    command: 'npm run start -- --hostname 127.0.0.1',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: false,
    timeout: 60_000,
    env: { AUTH_SECRET: 'local-smoke-only-not-a-production-secret', AUTH_TRUST_HOST: 'true' },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
