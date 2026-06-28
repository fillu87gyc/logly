import { test, expect } from '@playwright/test'
import { installApiMock, buildEntry } from '../shared/api-mock'

test.describe('DetailModal – 編集 / 削除フロー', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-06-28T08:30:00'))
  })

  test('タイムラインのエントリをタップ → 詳細モーダルが開く / close で閉じる', async ({ page }) => {
    await installApiMock(page, {
      today: '2026-06-28',
      initialEntries: [
        buildEntry({
          occurredAt: '2026-06-28T09:30',
          category: 'work',
          title: '詳細を開く対象',
          note: 'モーダルに展開される note',
        }),
      ],
    })
    await page.goto('/')

    await page.getByText('詳細を開く対象').click()

    // モーダル固有の要素で開いていることを確認（MEMO ラベル / edit / delete_outline はモーダルにのみ存在）
    await expect(page.getByText('MEMO', { exact: true })).toBeVisible()
    await expect(page.getByText('edit', { exact: true })).toBeVisible()
    await expect(page.getByText('delete_outline', { exact: true })).toBeVisible()

    // close ボタン（左端の close アイコン）で閉じる
    await page.getByText('close', { exact: true }).first().click()
    await expect(page.getByText('MEMO', { exact: true })).toBeHidden()
  })

  test('編集ボタン → タイトル書き換え → 変更を保存 で PUT が走る', async ({ page }) => {
    const state = await installApiMock(page, {
      today: '2026-06-28',
      initialEntries: [
        buildEntry({
          occurredAt: '2026-06-28T09:30',
          category: 'work',
          title: '編集前タイトル',
        }),
      ],
    })
    await page.goto('/')

    await page.getByText('編集前タイトル').click()
    await page.getByText('edit', { exact: true }).click()

    const titleInput = page.locator('input[value="編集前タイトル"]')
    await expect(titleInput).toBeVisible()
    await titleInput.fill('編集後タイトル')

    await page.getByRole('button', { name: '変更を保存' }).click()

    // モーダルは閉じる
    await expect(page.getByRole('button', { name: '変更を保存' })).toBeHidden()
    // タイムラインに新タイトルが反映される
    await expect(page.getByText('編集後タイトル')).toBeVisible()
    // モック state も更新済み
    expect(state.entries[0]?.title).toBe('編集後タイトル')
  })

  test('削除ボタン → confirm 承認 で DELETE が走り、タイムラインから消える', async ({ page }) => {
    const state = await installApiMock(page, {
      today: '2026-06-28',
      initialEntries: [
        buildEntry({
          occurredAt: '2026-06-28T09:30',
          category: 'work',
          title: '削除対象エントリ',
        }),
      ],
    })
    page.on('dialog', (dialog) => void dialog.accept())
    await page.goto('/')

    await expect(page.getByText('削除対象エントリ')).toHaveCount(1)
    await page.getByText('削除対象エントリ').click()
    await page.getByText('delete_outline', { exact: true }).click()

    // モーダルが閉じ、タイムラインからも消える
    await expect(page.getByText('MEMO', { exact: true })).toBeHidden()
    await expect(page.getByText('削除対象エントリ')).toHaveCount(0)
    expect(state.entries).toHaveLength(0)
  })

  test('削除確認で cancel するとエントリは消えない', async ({ page }) => {
    const state = await installApiMock(page, {
      today: '2026-06-28',
      initialEntries: [
        buildEntry({
          occurredAt: '2026-06-28T09:30',
          category: 'work',
          title: 'cancel テスト',
        }),
      ],
    })
    page.on('dialog', (dialog) => void dialog.dismiss())
    await page.goto('/')

    // 初期はタイムラインに 1 件
    await expect(page.getByText('cancel テスト')).toHaveCount(1)
    await page.getByText('cancel テスト').click()
    // モーダルが開いた状態で同じテキストが 2 箇所（タイムライン + モーダルヘッダ）
    await expect(page.getByText('cancel テスト')).toHaveCount(2)

    await page.getByText('delete_outline', { exact: true }).click()

    // dialog を dismiss → state も DOM も維持される（モーダルは開いたまま）
    await expect(page.getByText('cancel テスト')).toHaveCount(2)
    expect(state.entries).toHaveLength(1)
  })
})
