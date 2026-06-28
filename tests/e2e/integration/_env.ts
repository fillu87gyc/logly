/**
 * インテグレーション用エンドポイント定義。
 * Playwright の `baseURL` は SPA（vite）に向いているため、API（wrangler dev）への
 * 直接呼び出しはここで定義した絶対 URL を使う。
 *
 * 環境変数（`E2E_API_PORT` / `E2E_HOST`）でポートをずらせるよう、`playwright.integration.config.ts`
 * の defaults と一致させている。
 */
const HOST = process.env.E2E_HOST ?? '127.0.0.1'
const API_PORT = Number(process.env.E2E_API_PORT ?? 8788)

export const API_BASE = `http://${HOST}:${API_PORT}`
export const api = (path: string): string => `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`
