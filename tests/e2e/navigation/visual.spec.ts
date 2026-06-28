import { test, expect } from '@playwright/test'
import { installApiMock, buildEntry } from '../shared/api-mock'
import { prepareForSnapshot, settle } from '../shared/visual-helpers'

/**
 * 画面リグレッション（Pixel-level）.
 *
 * 目的は「想定外の DOM/レイアウト変化を検知する」こと。フォントや色味の
 * 微妙な差は `maxDiffPixelRatio` で吸収する（playwright.config.ts）。
 *
 * 初回 / 意図的な UI 変更時は `npm run test:e2e:update` でベースラインを更新する。
 */
test.describe('Visual regression – 主要画面', () => {
  test.beforeEach(async ({ page }) => {
    await prepareForSnapshot(page)
  })

  test('Home – 固定 3 件のタイムライン', async ({ page }) => {
    await installApiMock(page, {
      today: '2026-06-28',
      initialEntries: [
        buildEntry({
          id: 'fixed-1',
          occurredAt: '2026-06-28T08:00',
          category: 'work',
          title: 'スナップショット用 work',
          note: '安定スナップショットのための固定 note',
          meta: [{ icon: 'schedule', text: '30分' }],
        }),
        buildEntry({
          id: 'fixed-2',
          occurredAt: '2026-06-28T12:30',
          category: 'food',
          title: 'スナップショット用 food',
        }),
        buildEntry({
          id: 'fixed-3',
          occurredAt: '2026-06-28T18:00',
          category: 'ex',
          title: 'スナップショット用 ex',
          note: 'ジムで 1 時間',
        }),
      ],
    })
    await page.goto('/')
    await settle(page)

    await expect(page).toHaveScreenshot('home.png', { fullPage: true })
  })

  test('AddModal – カテゴリ選択前', async ({ page }) => {
    await installApiMock(page, { today: '2026-06-28' })
    await page.goto('/')
    await settle(page)

    await page.getByText('add', { exact: true }).first().click()
    await expect(page.getByText('記録を追加')).toBeVisible()
    await settle(page)

    await expect(page).toHaveScreenshot('add-modal-empty.png', { fullPage: true })
  })

  test('Profile（マイ）画面', async ({ page }) => {
    await installApiMock(page, { today: '2026-06-28' })
    await page.goto('/')
    await page.getByText('マイ', { exact: true }).click()
    await settle(page)

    await expect(page).toHaveScreenshot('profile.png', { fullPage: true })
  })
})
