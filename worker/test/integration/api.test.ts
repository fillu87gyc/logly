import { env } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../../src/interface/http/router'
import type { EntryDto, StatsDto } from '../../src/application/queries/dto'

const app = createApp()

async function call(method: string, path: string, body?: unknown): Promise<Response> {
  const init: RequestInit = { method }
  if (body !== undefined) {
    init.body = JSON.stringify(body)
    init.headers = { 'content-type': 'application/json' }
  }
  return app.fetch(new Request(`http://test${path}`, init), env)
}

async function reset(): Promise<void> {
  await env.DB.batch([
    env.DB.prepare('DELETE FROM events'),
    env.DB.prepare('DELETE FROM rm_entries'),
    env.DB.prepare('DELETE FROM rm_daily_category'),
  ])
}

beforeEach(reset)

const entry = {
  occurredAt: '2026-06-28T07:15',
  category: 'work',
  title: 'デザインレビュー',
  note: 'メモ',
  meta: [{ icon: 'schedule', text: '90分' }],
}

describe('Entry API (CQRS + Event Sourcing)', () => {
  it('作成 → 日別取得で 1 件返る', async () => {
    const created = await call('POST', '/api/entries', entry)
    expect(created.status).toBe(201)
    const { id } = (await created.json()) as { id: string }
    expect(id).toBeTruthy()

    const list = await call('GET', '/api/entries?date=2026-06-28')
    expect(list.status).toBe(200)
    const entries = (await list.json()) as EntryDto[]
    expect(entries).toHaveLength(1)
    expect(entries[0]!.title).toBe('デザインレビュー')
    expect(entries[0]!.time).toBe('07:15')
    expect(entries[0]!.icon).toBe('laptop_mac') // カテゴリ参照から付与
    expect(entries[0]!.meta).toEqual([{ icon: 'schedule', text: '90分' }])
  })

  it('編集で日付が移動すると旧日付から消え新日付に出る・統計も増減', async () => {
    const { id } = (await (await call('POST', '/api/entries', entry)).json()) as { id: string }

    const edited = await call('PUT', `/api/entries/${id}`, {
      ...entry,
      occurredAt: '2026-06-29T09:00',
      category: 'food',
      title: '昼食',
    })
    expect(edited.status).toBe(204)

    const old = (await (await call('GET', '/api/entries?date=2026-06-28')).json()) as EntryDto[]
    expect(old).toHaveLength(0)
    const moved = (await (await call('GET', '/api/entries?date=2026-06-29')).json()) as EntryDto[]
    expect(moved).toHaveLength(1)
    expect(moved[0]!.category).toBe('food')

    const stats = (await (await call('GET', '/api/stats?range=m&date=2026-06-29')).json()) as StatsDto
    const food = stats.categoryBreakdown.find((c) => c.key === 'food')
    expect(food?.count).toBe(1)
    expect(stats.categoryBreakdown.find((c) => c.key === 'work')).toBeUndefined()
  })

  it('削除で一覧/統計から消えるがイベントは残る', async () => {
    const { id } = (await (await call('POST', '/api/entries', entry)).json()) as { id: string }
    expect((await call('DELETE', `/api/entries/${id}`)).status).toBe(204)

    const list = (await (await call('GET', '/api/entries?date=2026-06-28')).json()) as EntryDto[]
    expect(list).toHaveLength(0)

    const events = await env.DB.prepare(
      'SELECT event_type FROM events WHERE aggregate_id = ?1 ORDER BY version',
    )
      .bind(id)
      .all<{ event_type: string }>()
    expect(events.results.map((r) => r.event_type)).toEqual(['EntryLogged', 'EntryDeleted'])
  })

  it('version 不一致の編集は 409', async () => {
    const { id } = (await (await call('POST', '/api/entries', entry)).json()) as { id: string }
    // 現在 version=1。期待値 5 を渡すと競合。
    const res = await call('PUT', `/api/entries/${id}?expectedVersion=5`, entry)
    expect(res.status).toBe(409)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('VERSION_CONFLICT')
  })

  it('入力不正は 400', async () => {
    const res = await call('POST', '/api/entries', { ...entry, title: '' })
    expect(res.status).toBe(400)
  })

  it('存在しない Entry の編集は 404', async () => {
    const res = await call('PUT', '/api/entries/01ARZ3NDEKTSV4RRFFQ69G5FAV', entry)
    expect(res.status).toBe(404)
  })

  it('カテゴリ参照を返す', async () => {
    const res = await call('GET', '/api/categories')
    expect(res.status).toBe(200)
    const cats = (await res.json()) as { key: string }[]
    expect(cats.map((c) => c.key)).toContain('work')
    expect(cats).toHaveLength(9)
  })

  it('週統計のバーが期間日数ぶん返る', async () => {
    await call('POST', '/api/entries', entry)
    const stats = (await (await call('GET', '/api/stats?range=w&date=2026-06-28')).json()) as StatsDto
    expect(stats.bars).toHaveLength(7)
    expect(stats.total).toBe(1)
  })
})
