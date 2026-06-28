import type { Page } from '@playwright/test'

/**
 * 画面リグレッション安定化のための準備:
 * - 外部フォント / Material Icons など、ネットワーク状況に左右される CSS とフォントを遮断
 * - PWA SW を抑止
 * - フォントの読込フェーズを待ち、サブピクセル差を最小化
 * - 時計を固定（今日表示の壁時計依存を排除）
 *
 * これで CI / ローカルでも同じ「フォールバック・フォント + 文字どおりの "add" 表記」で
 * 描画される。Material Symbols のグリフではなく "add"/"close" 等のテキストが表示されるが、
 * 画面遷移リグレッションを検出する目的では十分。
 */
export async function prepareForSnapshot(page: Page): Promise<void> {
  await page.clock.setFixedTime(new Date('2026-06-28T08:30:00'))

  // 外部フォント / アイコン CSS / Google CSS を遮断
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort())
  await page.route(/cdn\.jsdelivr\.net/, (route) => route.abort())

  // PWA SW の登録を抑止（registerSW.js も含む）
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      get: () => undefined,
    })
  })
}

/** ページ遷移後にフォント読込フェーズの解決を待つ。 */
export async function settle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
}
