import type { Page, Route } from '@playwright/test'

/**
 * Worker (`/api/*`) を Playwright の Route Interception で完全にモックする。
 * E2E は SPA の挙動だけを検証する責務（API 本体は runn 側でカバー済み）。
 */

export interface MockEntry {
  id: string
  occurredAt: string
  date: string
  time: string
  category: string
  categoryLabel: string
  icon: string
  color: string
  title: string
  note?: string
  meta: { icon: string; text: string }[]
}

const CATEGORY_INDEX: Record<string, { label: string; icon: string; color: string }> = {
  work: { label: '仕事', icon: 'laptop_mac', color: '#3b82f6' },
  food: { label: '食事', icon: 'restaurant', color: '#f97316' },
  drink: { label: '飲み会', icon: 'local_bar', color: '#ef4444' },
  ex: { label: '運動', icon: 'fitness_center', color: '#22c55e' },
  move: { label: '移動', icon: 'directions_subway', color: '#a78bfa' },
  sleep: { label: '睡眠', icon: 'bedtime', color: '#6366f1' },
  diary: { label: '日記', icon: 'menu_book', color: '#ec4899' },
  money: { label: '出費', icon: 'payments', color: '#14b8a6' },
  other: { label: 'その他', icon: 'more_horiz', color: '#a1a1aa' },
}

export interface ApiMock {
  /** 現在保持しているエントリ（state を持つので作成 → 一覧の往復が成立する）。 */
  entries: MockEntry[]
  /** デフォルトの「今日」日付。 */
  today: string
}

interface InstallOptions {
  initialEntries?: MockEntry[]
  /** 起動時に `今日`（壁時計）として返す日付。固定して時計依存を排除する。 */
  today?: string
}

export function buildEntry(input: {
  id?: string
  occurredAt: string
  category: string
  title: string
  note?: string
  meta?: { icon: string; text: string }[]
}): MockEntry {
  const cat = CATEGORY_INDEX[input.category]
  if (!cat) throw new Error(`unknown category in test mock: ${input.category}`)
  const [date, hhmm] = input.occurredAt.split('T') as [string, string]
  return {
    id: input.id ?? `e_${Math.random().toString(36).slice(2, 10)}`,
    occurredAt: input.occurredAt,
    date,
    time: hhmm.slice(0, 5),
    category: input.category,
    categoryLabel: cat.label,
    icon: cat.icon,
    color: cat.color,
    title: input.title,
    ...(input.note != null ? { note: input.note } : {}),
    meta: input.meta ?? [],
  }
}

export async function installApiMock(page: Page, opts: InstallOptions = {}): Promise<ApiMock> {
  const state: ApiMock = {
    entries: opts.initialEntries ? [...opts.initialEntries] : [],
    today: opts.today ?? '2026-06-28',
  }

  await page.route('**/api/categories', (route: Route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        Object.entries(CATEGORY_INDEX).map(([key, v]) => ({ key, ...v })),
      ),
    })
  })

  await page.route('**/api/entries**', async (route: Route) => {
    const req = route.request()
    const url = new URL(req.url())
    const path = url.pathname.replace(/.*\/api\/entries/, '')

    // GET /api/entries?date=&from=&to=
    if (req.method() === 'GET' && path === '') {
      const date = url.searchParams.get('date')
      const from = url.searchParams.get('from')
      const to = url.searchParams.get('to')
      let result = state.entries
      if (date) result = result.filter((e) => e.date === date)
      else if (from && to) result = result.filter((e) => e.date >= from && e.date <= to)
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(result),
      })
      return
    }

    // POST /api/entries
    if (req.method() === 'POST' && path === '') {
      const body = JSON.parse(req.postData() ?? '{}') as {
        occurredAt: string
        category: string
        title: string
        note?: string
        meta?: { icon: string; text: string }[]
      }
      const created = buildEntry(body)
      state.entries.push(created)
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: created.id }),
      })
      return
    }

    // PUT /api/entries/:id
    if (req.method() === 'PUT' && /^\/[^/]+$/.test(path)) {
      const id = path.slice(1)
      const idx = state.entries.findIndex((e) => e.id === id)
      if (idx < 0) {
        await route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
        return
      }
      const body = JSON.parse(req.postData() ?? '{}') as {
        occurredAt: string
        category: string
        title: string
        note?: string
        meta?: { icon: string; text: string }[]
      }
      state.entries[idx] = buildEntry({ id, ...body })
      await route.fulfill({ status: 204, body: '' })
      return
    }

    // DELETE /api/entries/:id
    if (req.method() === 'DELETE' && /^\/[^/]+$/.test(path)) {
      const id = path.slice(1)
      state.entries = state.entries.filter((e) => e.id !== id)
      await route.fulfill({ status: 204, body: '' })
      return
    }

    await route.fulfill({ status: 405, body: '' })
  })

  await page.route('**/api/stats**', (route: Route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        range: 'w',
        from: state.today,
        to: state.today,
        total: state.entries.length,
        bars: [],
        categoryBreakdown: [],
      }),
    })
  })

  return state
}

/** 何もモックしない場合、SPA はモックデータにフォールバックする。 */
export async function installApiOutage(page: Page): Promise<void> {
  await page.route('**/api/**', (route) => route.abort())
}
