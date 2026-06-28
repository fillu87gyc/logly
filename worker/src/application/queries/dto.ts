import type { MetaItem } from '../../domain/entry/values'

/** API が返す Entry。フロント `src/lib/types.ts` の Entry と互換（id 等を追加）。 */
export interface EntryDto {
  id: string
  occurredAt: string
  date: string
  time: string // HH:mm
  category: string // カテゴリキー
  categoryLabel: string
  icon: string
  color: string
  title: string
  note?: string
  meta: MetaItem[]
}

/** 統計レスポンス。 */
export interface StatsDto {
  range: 'w' | 'm' | 'y'
  from: string
  to: string
  total: number
  bars: StatBarDto[]
  categoryBreakdown: CatBreakDto[]
}

export interface StatBarDto {
  date: string
  total: number
  byCategory: Record<string, number>
}

export interface CatBreakDto {
  key: string
  label: string
  icon: string
  color: string
  count: number
  pct: number // 0..100（最大カテゴリ比）
}
