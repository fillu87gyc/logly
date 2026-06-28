import { test, expect } from '@playwright/test'
import { installApiMock, installApiOutage, buildEntry } from './fixtures/api-mock'

test.describe('Home screen', () => {
  test('初期表示で「今日」ヘッダと END OF DAY を描画する（API モック空）', async ({ page }) => {
    await installApiMock(page)
    await page.goto('/')

    await expect(page.getByText('今日', { exact: true })).toBeVisible()
    await expect(page.getByText('— END OF DAY —')).toBeVisible()
  })

  test('API 障害時はモックデータにフォールバックして既存のタイムラインを描画する', async ({ page }) => {
    await installApiOutage(page)
    await page.goto('/')

    // モック ENTRIES（src/lib/data.ts）が描画されることを確認
    await expect(page.getByText('起床、コーヒー1杯')).toBeVisible()
    await expect(page.getByText('デザインレビュー')).toBeVisible()
    await expect(page.getByText('ジムでトレーニング')).toBeVisible()
  })

  test('API 接続時はサーバの entries を描画する', async ({ page }) => {
    // App は localDateParts() で「今日」を判断する。Playwright の Clock API で固定する。
    await page.clock.setFixedTime(new Date('2026-06-28T08:30:00'))

    await installApiMock(page, {
      today: '2026-06-28',
      initialEntries: [
        buildEntry({
          occurredAt: '2026-06-28T08:00',
          category: 'work',
          title: 'API 接続テストの記録',
          note: '実 API ベース',
        }),
      ],
    })

    await page.goto('/')
    await expect(page.getByText('API 接続テストの記録')).toBeVisible()
  })
})
