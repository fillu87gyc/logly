import { test, expect } from '@playwright/test'
import { installApiMock } from '../shared/api-mock'

test.describe('AddModal – 記録の追加フロー', () => {
  test.beforeEach(async ({ page }) => {
    // App の listEntriesByDay() は壁時計の日付に依存する。Playwright の Clock API で固定する。
    await page.clock.setFixedTime(new Date('2026-06-28T08:30:00'))
  })

  test('+ ボタンでモーダルが開く / 閉じる', async ({ page }) => {
    await installApiMock(page, { today: '2026-06-28' })
    await page.goto('/')

    await openAddModal(page)
    await expect(page.getByText('記録を追加')).toBeVisible()
    await expect(page.getByText('カテゴリから選ぶ')).toBeVisible()

    // close ボタン
    await page.getByText('close', { exact: true }).click()
    await expect(page.getByText('記録を追加')).toBeHidden()
  })

  test('カテゴリ選択 → タイトル入力 → 保存で API に POST し、タイムラインに反映される', async ({ page }) => {
    const state = await installApiMock(page, { today: '2026-06-28' })
    await page.goto('/')

    await openAddModal(page)

    // カテゴリ「仕事」を選ぶ（label 文字列で識別）
    await page.getByText('仕事', { exact: true }).click()

    // 詳細フォームが現れる
    const title = page.getByPlaceholder('タイトル（例: ジムでトレーニング）')
    await expect(title).toBeVisible()
    await title.fill('Playwright で追加した記録')

    const note = page.getByPlaceholder('メモ（任意）')
    await note.fill('E2E メモ')

    await page.getByRole('button', { name: '保存する' }).click()

    // モーダルが閉じる
    await expect(page.getByText('記録を追加')).toBeHidden()

    // タイムラインに新エントリが反映される
    await expect(page.getByText('Playwright で追加した記録')).toBeVisible()
    await expect(page.getByText('E2E メモ')).toBeVisible()

    // モック側の状態にも 1 件追加されている
    expect(state.entries).toHaveLength(1)
    expect(state.entries[0]?.title).toBe('Playwright で追加した記録')
    expect(state.entries[0]?.category).toBe('work')
  })

  test('カテゴリ未選択ではフォームが出ず、保存ボタンも存在しない', async ({ page }) => {
    await installApiMock(page, { today: '2026-06-28' })
    await page.goto('/')

    await openAddModal(page)
    await expect(page.getByPlaceholder('タイトル（例: ジムでトレーニング）')).toBeHidden()
    await expect(page.getByRole('button', { name: '保存する' })).toHaveCount(0)
  })
})

async function openAddModal(page: import('@playwright/test').Page): Promise<void> {
  // TabBar の中央 "+" ボタン。Icon は name="add" のリテラル文字を span に置く。
  await page.getByText('add', { exact: true }).first().click()
}
