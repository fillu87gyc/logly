import type { EntryEvent } from '../domain/entry/events'
import type { ReadModelOp } from './projections/ReadModelStore'

/** Event Store 読み出しポート（集約再構築用）。 */
export interface EventReader {
  /** 集約の全イベントを version 昇順で取得する。 */
  load(aggregateId: string): Promise<EntryEvent[]>
}

/** 1 つの集約に対する原子的書き込み（イベント追記＋読み取りモデル投影）。 */
export interface CommitArgs {
  aggregateId: string
  aggregateType: string
  /** 追記前に期待する集約バージョン（楽観ロック）。 */
  expectedVersion: number
  events: readonly EntryEvent[]
  actor: string | null
  /** 同一トランザクションで適用する読み取りモデル操作。 */
  readModelOps: readonly ReadModelOp[]
}

/**
 * 書き込みポート。イベント追記と読み取りモデル更新を 1 つの原子的単位で適用する。
 * version 競合時は VersionConflictError を投げる。
 */
export interface WriteStore {
  commit(args: CommitArgs): Promise<void>
}

/** 読み取りモデル参照ポート（クエリ用）。実体は D1QueryDao。 */
export interface QueryPort {
  listByDate(date: string): Promise<ReadModelRow[]>
  listByRange(from: string, to: string): Promise<ReadModelRow[]>
  dailyCategoryCounts(from: string, to: string): Promise<DailyCategoryCount[]>
}

export interface ReadModelRow {
  id: string
  occurred_at: string
  date: string
  category: string
  title: string
  note: string | null
  meta: string // JSON
}

export interface DailyCategoryCount {
  date: string
  category: string
  count: number
}
