import type { Page } from '@playwright/test'

/**
 * 画面リグレッション安定化のための準備:
 * - 時計を固定（今日表示の壁時計依存を排除）
 * - PWA SW を抑止（fetch を勝手に握らない）
 *
 * Material Icons は public/fonts/ から自己ホストしているため、
 * CDN ブロックや遅延の影響を受けない。
 * 本文フォント（Inter / Noto Sans JP / Noto Serif JP / Fraunces）は
 * Google Fonts 経由で、到達できない環境ではシステムフォントに穏便に
 * フォールバックする（マーカや文字幅は同等）。
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
 * 自己ホストの Material Icons は確実にロードされるまで明示的に await する。
 */
export async function settle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle')
  await page.evaluate(async () => {
    // 自己ホストの Material Icons をリガチャ込みで強制ロードする。
    await Promise.all([
      document.fonts.load("22px 'Material Icons Outlined'", 'auto_awesome close add'),
      document.fonts.load("22px 'Material Icons Round'", 'today calendar_month insights'),
    ])
    await document.fonts.ready
    // フォント差し替えに伴うレイアウト確定を 2 フレーム待つ
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(undefined))))
  })
}
