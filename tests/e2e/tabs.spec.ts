import { test, expect } from '@playwright/test'
import { installApiMock } from './fixtures/api-mock'

test.describe('TabBar – スクリーン切り替え', () => {
  test('Home → 記録 → 統計 → マイ を切り替えるとそれぞれの画面が描画される', async ({ page }) => {
    await installApiMock(page, { today: '2026-06-28' })
    await page.goto('/')

    // 初期は Home
    await expect(page.getByText('今日', { exact: true })).toBeVisible()

    // 「記録」(calendar) タブ
    await page.getByText('記録', { exact: true }).click()
    await expect(page.getByText('今日', { exact: true })).toBeHidden()

    // 「統計」タブ
    await page.getByText('統計', { exact: true }).click()
    // 範囲タブ（週/月/年）は固定で常に描画される
    await expect(page.getByText('週', { exact: true })).toBeVisible()
    await expect(page.getByText('月', { exact: true })).toBeVisible()
    await expect(page.getByText('年', { exact: true })).toBeVisible()

    // 「マイ」タブ
    await page.getByText('マイ', { exact: true }).click()
    await expect(page.getByText('なつき', { exact: true })).toBeVisible()

    // 「ホーム」タブに戻る
    await page.getByText('ホーム', { exact: true }).click()
    await expect(page.getByText('今日', { exact: true })).toBeVisible()
  })
})
