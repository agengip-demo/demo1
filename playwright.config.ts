import { defineConfig, devices } from '@playwright/test';

// BASE_URL set: test a deployed environment (pipeline step deploy-test).
// BASE_URL unset: build and start the app locally.
const externalBaseUrl = process.env.BASE_URL;
const port = Number(process.env.PORT ?? '3000');

export default defineConfig({
  testDir: 'tests/e2e',
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: externalBaseUrl ?? `http://127.0.0.1:${port}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: externalBaseUrl
    ? undefined
    : {
        command: 'npm run build && npm start',
        url: `http://127.0.0.1:${port}/healthz`,
        env: { PORT: String(port), HOST: '127.0.0.1' },
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
