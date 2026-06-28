import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.E2E_PORT ?? 4173)
const HOST = process.env.E2E_HOST ?? '127.0.0.1'
const BASE_URL = `http://${HOST}:${PORT}`

/**
 * Playwright E2E のエントリポイント。
 * - vite preview を webServer として起動し、ビルド済み SPA を本物のサーバから配信する。
 * - 既定ではモバイル Chromium（Pixel 5）の 1 プロジェクトのみ。
 * - API は各 spec が page.route で必要に応じてモックする（外部依存ゼロでテストが回る）。
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 5'] },
    },
  ],
  // CI ではビルド済み bundle を `vite preview` で配信し、ローカルでは `vite dev` で
  // ホットに走らせる。どちらも `public/` 配下（PWA manifest / icon）を同じ URL で返す。
  webServer: {
    command: process.env.CI
      ? `npm run preview -- --host ${HOST} --port ${PORT} --strictPort`
      : `npm run dev -- --host ${HOST} --port ${PORT} --strictPort`,
    url: `${BASE_URL}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
