import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.E2E_PORT ?? 4173)
const HOST = process.env.E2E_HOST ?? '127.0.0.1'
const BASE_URL = `http://${HOST}:${PORT}`

/**
 * Navigation / 画面リグレッション用 Playwright 設定。
 *
 * - 対象: `tests/e2e/navigation/**` のみ
 * - API: `page.route` で完全モック（外部依存ゼロ・高速）
 * - 検証軸: 画面遷移、モーダル開閉、要素の表示/非表示、視覚リグレッション
 *
 * 実バックエンドを通した E2E は `playwright.integration.config.ts` を参照。
 */
export default defineConfig({
  testDir: './tests/e2e/navigation',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    toHaveScreenshot: {
      // フォント読込のばらつき・サブピクセル差を許容
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
      caret: 'hide',
    },
  },
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
  // CI ではビルド済み bundle を `vite preview` で配信し、ローカルでは `vite dev`。
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
