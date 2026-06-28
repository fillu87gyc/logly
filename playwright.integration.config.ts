import { defineConfig, devices } from '@playwright/test'

const SPA_PORT = Number(process.env.E2E_SPA_PORT ?? 4174)
const API_PORT = Number(process.env.E2E_API_PORT ?? 8788)
const HOST = process.env.E2E_HOST ?? '127.0.0.1'
const SPA_URL = `http://${HOST}:${SPA_PORT}`
const API_URL = `http://${HOST}:${API_PORT}`

/**
 * フルスタック・インテグレーション用 Playwright 設定。
 *
 * - 対象: `tests/e2e/integration/**`
 * - API: 実 `wrangler dev --local`（D1 / イベントソース / 投影込み）
 * - SPA: `VITE_API_BASE` を実 API に向けた `vite dev`
 * - 検証軸: ブラウザ → fetch → Hono → D1 → 投影 → クエリ → SPA 再描画の往復
 *
 * シナリオ間の DB 分離は「ユニークな業務日付」で行う（runn と同じ流儀）。
 * これにより事前リセットや test-only エンドポイントを追加せずに済む。
 */
export default defineConfig({
  testDir: './tests/e2e/integration',
  // フル E2E は state を実 D1 で共有するためシリアル実行
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-integration' }]]
    : 'list',
  use: {
    baseURL: SPA_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    extraHTTPHeaders: {
      // wrangler dev 側で ENV=dev のときは Access バイパスのため不要だが、明示しておく。
      'X-E2E-Run': 'playwright-integration',
    },
  },
  projects: [
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 5'] },
    },
  ],
  // 2 つの webServer を並列起動: ① wrangler dev（実 Worker + D1）② vite dev（VITE_API_BASE 注入）
  webServer: [
    {
      // worker 起動前にローカル D1 のマイグレーションを当てる（idempotent）
      command:
        `npx wrangler d1 migrations apply logly --local` +
        ` && npx wrangler dev --local --ip ${HOST} --port ${API_PORT} --var ENV:dev`,
      cwd: 'worker',
      url: `${API_URL}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command:
        process.env.CI
          ? `npm run build && npm run preview -- --host ${HOST} --port ${SPA_PORT} --strictPort`
          : `npm run dev -- --host ${HOST} --port ${SPA_PORT} --strictPort`,
      url: `${SPA_URL}/`,
      env: {
        VITE_API_BASE: API_URL,
      },
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
})
