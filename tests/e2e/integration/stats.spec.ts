import { test, expect } from '@playwright/test'
import { api } from './_env'

/**
 * 統計タブのフル E2E: 実 D1 にデータを撒き、SPA が `/api/stats` の結果で
 * 画面（範囲タブ・カテゴリ内訳）を描画できることを検証する。
 */
test.describe('Integration – Stats screen', () => {
  const refDate = '2030-07-15'

  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date(`${refDate}T08:30:00`))
  })

  test('実 API のデータで Stats タブが描画される', async ({ page, request }) => {
    const seeds: { id: string }[] = []
    for (const cat of ['work', 'food', 'ex'] as const) {
      const res = await request.post(api('/api/entries'), {
        data: { occurredAt: `${refDate}T10:00`, category: cat, title: `stats:${cat}:${Date.now()}` },
      })
      expect(res.status()).toBe(201)
      seeds.push((await res.json()) as { id: string })
    }

    await page.goto('/')

    // Stats タブへ
    const statsRequest = page.waitForResponse((r) => r.url().includes('/api/stats') && r.status() === 200)
    await page.getByText('統計', { exact: true }).click()
    await statsRequest

    // 範囲タブ（segmented control）が描画される。「週」「年」は曜日ラベルと衝突しないので exact 一致で OK。
    // 「月」だけは Monday バーと衝突するため、segmented control 内の最初の要素として確認する。
    await expect(page.getByText('週', { exact: true })).toBeVisible()
    await expect(page.getByText('年', { exact: true })).toBeVisible()
    await expect(page.getByText('月', { exact: true }).first()).toBeVisible()

    // 今週のアクティビティ等のタイトルが描画される（いずれかは表示）
    const oneOfTitles = page
      .getByText(/今週のアクティビティ|今月のアクティビティ|今年のアクティビティ/)
      .first()
    await expect(oneOfTitles).toBeVisible()

    // 月タブに切替えると /api/stats?range=m が走る
    const monthlyRequest = page.waitForResponse(
      (r) => r.url().includes('/api/stats') && r.url().includes('range=m') && r.status() === 200,
    )
    await page.getByText('月', { exact: true }).first().click()
    await monthlyRequest

    // 後始末
    for (const s of seeds) await request.delete(api(`/api/entries/${s.id}`))
  })
})
