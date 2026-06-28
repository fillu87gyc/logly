import { test, expect } from '@playwright/test'
import { api } from './_env'

/**
 * SPA → 実 Worker への到達性と基礎契約を確認する。
 * - `/api/health` が 200 を返す
 * - `/api/categories` が 9 件返る
 * - SPA トップは API 接続成功で「END OF DAY」マーカまで描画される
 */
test.describe('Integration – API connectivity', () => {
  test('実 API のヘルスとカテゴリ', async ({ request }) => {
    const health = await request.get(api('/api/health'))
    expect(health.status()).toBe(200)
    expect(await health.json()).toEqual({ ok: true })

    const cats = await request.get(api('/api/categories'))
    expect(cats.status()).toBe(200)
    const body = (await cats.json()) as { key: string }[]
    expect(body).toHaveLength(9)
    expect(body.map((c) => c.key)).toEqual(
      expect.arrayContaining(['work', 'food', 'ex', 'sleep', 'other']),
    )
  })

  test('SPA トップが実 API を叩いて初回ロードに成功する', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2030-06-15T08:30:00'))

    // フックしてレスポンスを観察する（モックではない）
    const apiCall = page.waitForResponse(
      (res) => res.url().includes('/api/entries') && res.status() === 200,
    )
    await page.goto('/')
    await apiCall

    await expect(page.getByText('今日', { exact: true })).toBeVisible()
    await expect(page.getByText('— END OF DAY —')).toBeVisible()
  })
})
