import { test, expect } from '@playwright/test'
import { api } from './_env'

/**
 * フル E2E CRUD: SPA から「作成 → 一覧反映 → 編集 → 削除」を実 Worker / D1 に対して回す。
 * シナリオごとにユニークな業務日付を使い、DB 上で他のテストと衝突しないようにする。
 */
test.describe('Integration – CRUD via SPA UI', () => {
  const testDate = '2030-06-15'

  test.beforeEach(async ({ page }) => {
    // SPA は localDateParts() で「今日」を取りに行く。固定して entries クエリの日付を testDate に揃える。
    await page.clock.setFixedTime(new Date(`${testDate}T08:30:00`))
  })

  test('AddModal で作成すると、タイムラインに即時反映され実 API にも保存される', async ({ page, request }) => {
    const title = `e2e:create:${Date.now()}`

    await page.goto('/')
    await page.getByText('add', { exact: true }).first().click()
    await page.getByText('仕事', { exact: true }).click()
    await page.getByPlaceholder('タイトル（例: ジムでトレーニング）').fill(title)

    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/entries') && r.request().method() === 'POST' && r.status() === 201),
      page.getByRole('button', { name: '保存する' }).click(),
    ])

    // SPA タイムラインに即時反映
    await expect(page.getByText(title)).toBeVisible()

    // 実 API からも引ける（別経路で確認）
    const list = await request.get(api(`/api/entries?date=${testDate}`))
    expect(list.status()).toBe(200)
    const entries = (await list.json()) as { id: string; title: string; category: string }[]
    const created = entries.find((e) => e.title === title)
    expect(created).toBeDefined()
    expect(created?.category).toBe('work')

    // 後始末: 削除
    if (created) {
      const del = await request.delete(api(`/api/entries/${created.id}`))
      expect(del.status()).toBe(204)
    }
  })

  test('DetailModal の編集ボタンでタイトルを書き換え、UI と API の両方に反映される', async ({ page, request }) => {
    const originalTitle = `e2e:edit-src:${Date.now()}`
    const editedTitle = `e2e:edit-dst:${Date.now()}`

    // 事前データを API 直接で 1 件作る
    const created = await request.post(api('/api/entries'), {
      data: { occurredAt: `${testDate}T10:00`, category: 'work', title: originalTitle },
    })
    expect(created.status()).toBe(201)
    const { id } = (await created.json()) as { id: string }

    await page.goto('/')
    await page.getByText(originalTitle).click()
    await page.getByText('edit', { exact: true }).click()

    const titleInput = page.locator(`input[value="${originalTitle}"]`)
    await expect(titleInput).toBeVisible()
    await titleInput.fill(editedTitle)

    await Promise.all([
      page.waitForResponse((r) => r.url().includes(`/api/entries/${id}`) && r.request().method() === 'PUT' && r.status() === 204),
      page.getByRole('button', { name: '変更を保存' }).click(),
    ])

    await expect(page.getByText(editedTitle)).toBeVisible()
    await expect(page.getByText(originalTitle)).toBeHidden()

    // API 側も同じタイトルになっている
    const list = await request.get(api(`/api/entries?date=${testDate}`))
    const entries = (await list.json()) as { id: string; title: string }[]
    expect(entries.find((e) => e.id === id)?.title).toBe(editedTitle)

    // 後始末
    await request.delete(api(`/api/entries/${id}`))
  })

  test('DetailModal の削除で実 D1 から消え、イベントには EntryDeleted が残る', async ({ page, request }) => {
    const title = `e2e:delete:${Date.now()}`

    const created = await request.post(api('/api/entries'), {
      data: { occurredAt: `${testDate}T14:00`, category: 'food', title },
    })
    expect(created.status()).toBe(201)
    const { id } = (await created.json()) as { id: string }

    page.on('dialog', (dialog) => void dialog.accept())

    await page.goto('/')
    await page.getByText(title).click()

    await Promise.all([
      page.waitForResponse((r) => r.url().includes(`/api/entries/${id}`) && r.request().method() === 'DELETE' && r.status() === 204),
      page.getByText('delete_outline', { exact: true }).click(),
    ])

    // モーダル閉じ → タイムライン再フェッチで title 要素が DOM から全て消える
    await expect(page.getByText(title)).toHaveCount(0)

    // API 側にも残っていない
    const list = await request.get(api(`/api/entries?date=${testDate}`))
    const entries = (await list.json()) as { id: string }[]
    expect(entries.find((e) => e.id === id)).toBeUndefined()
  })
})
