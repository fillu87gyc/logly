import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.E2E_PORT ?? 4173)
const HOST = process.env.E2E_HOST ?? '127.0.0.1'
const BASE_URL = `http://${HOST}:${PORT}`

/**
 * Navigation / 画面遷移リグレッション用 Playwright 設定。
 *
 * - 対象: `tests/e2e/navigation/**` のみ
 * - API: `page.route` で完全モック（外部依存ゼロ・高速）
 * - 検証軸: 画面遷移、モーダル開閉、要素の表示/非表示、入力フロー
 *
 * ピクセル単位の視覚リグレッション（`toHaveScreenshot`）はあえて含めていない。
 * このアプリは Material Icons / Google Fonts を CDN 経由でロードしており、
 * フォント自己ホスト化なしに環境差を吸収する safe な baseline を作るのが難しい
 * （CDN 到達失敗時はアイコンがリテラル文字に落ち、本番では出ない見た目を「正解」
 * にしてしまう）。リグレッションは DOM 構造ベースで担保している。
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
