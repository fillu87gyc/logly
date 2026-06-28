import type { Page } from '@playwright/test'

/**
 * 画面リグレッション安定化のための準備:
 * - 時計を固定（今日表示の壁時計依存を排除）
 * - PWA SW を抑止（fetch を勝手に握らせない）
 *
 * 外部フォント（Google Fonts / Material Symbols）はあえて遮断しない。
 * 遮断するとアイコンがリテラル文字（"add", "close", ...）で出てしまい、
 * 本番では絶対に出ない見た目を「正解」にしてしまうため。
 * 描画安定化は `settle()` で `document.fonts.ready` を待って実現する。
 *
 * → Google Fonts に到達できない環境では視覚スナップショットは失敗する。
 *   ネットワーク到達性は本番でも前提なので、これは妥当な失敗。
 */
export async function prepareForSnapshot(page: Page): Promise<void> {
  await page.clock.setFixedTime(new Date('2026-06-28T08:30:00'))

  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      get: () => undefined,
    })
  })
}

/**
 * フォント読込・ネットワーク・レイアウト計算がすべて落ち着くのを待つ。
 * Material Symbols が読み込まれてアイコンがグリフ表示になってから返る。
 */
export async function settle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle')
  await page.evaluate(async () => {
    await document.fonts.ready
    // Material Symbols（mi / mir クラス）が解決されるまで明示的に待つ
    await Promise.all([
      document.fonts.load("16px 'Material Icons Outlined'").catch(() => undefined),
      document.fonts.load("16px 'Material Icons Round'").catch(() => undefined),
    ])
    // フォント差し替えに伴うレイアウト確定を 2 フレーム待つ
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(undefined))))
  })
}
