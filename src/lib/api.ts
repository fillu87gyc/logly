import type { Entry, MetaItem } from './types'

/**
 * バックエンド（Cloudflare Worker / worker/）の API クライアント。
 * - ベース URL は `VITE_API_BASE`（未設定なら同一オリジンの /api）。
 * - 認証は Cloudflare Access が前段で行うため、ここでは credentials を送るのみ。
 */
const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ?? ''

/** API が返す Entry（worker 側 EntryDto と一致）。 */
export interface ApiEntry {
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
  meta: MetaItem[]
}

export interface ApiStats {
  range: 'w' | 'm' | 'y'
  from: string
  to: string
  total: number
  bars: { date: string; total: number; byCategory: Record<string, number> }[]
  categoryBreakdown: { key: string; label: string; icon: string; color: string; count: number; pct: number }[]
}

export interface ApiCategory {
  key: string
  label: string
  icon: string
  color: string
}

export interface EntryInput {
  occurredAt: string
  category: string
  title: string
  note?: string | null
  meta?: MetaItem[]
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    credentials: 'include',
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  })
  if (!res.ok) {
    let message = `${res.status}`
    try {
      const body = (await res.json()) as { error?: { message?: string } }
      if (body.error?.message) message = body.error.message
    } catch {
      /* ignore */
    }
    throw new Error(`API ${path} failed: ${message}`)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const api = {
  listEntriesByDay: (date: string) => request<ApiEntry[]>(`/entries?date=${encodeURIComponent(date)}`),
  listEntriesByRange: (from: string, to: string) =>
    request<ApiEntry[]>(`/entries?from=${from}&to=${to}`),
  getStats: (range: 'w' | 'm' | 'y', date?: string) =>
    request<ApiStats>(`/stats?range=${range}${date ? `&date=${date}` : ''}`),
  getCategories: () => request<ApiCategory[]>(`/categories`),
  createEntry: (input: EntryInput) =>
    request<{ id: string }>(`/entries`, { method: 'POST', body: JSON.stringify(input) }),
  updateEntry: (id: string, input: EntryInput, expectedVersion?: number) =>
    request<void>(`/entries/${id}${expectedVersion != null ? `?expectedVersion=${expectedVersion}` : ''}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),
  deleteEntry: (id: string, expectedVersion?: number) =>
    request<void>(`/entries/${id}${expectedVersion != null ? `?expectedVersion=${expectedVersion}` : ''}`, {
      method: 'DELETE',
    }),
}

/** API の Entry を、画面が使う Entry 形へ変換する（category はラベル表示）。 */
export function apiEntryToEntry(a: ApiEntry): Entry {
  return {
    time: a.time,
    category: a.categoryLabel,
    icon: a.icon,
    color: a.color,
    title: a.title,
    ...(a.note != null ? { note: a.note } : {}),
    ...(a.meta.length ? { meta: a.meta } : {}),
  }
}
