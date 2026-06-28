import type { Category, MetaItem } from '../../domain/entry/values'

/**
 * 読み取りモデルへの抽象的な変更操作（CQRS のプロジェクション結果）。
 * インフラ（D1）がこれを SQL 文へ翻訳し、イベント追記と同一トランザクションで適用する。
 * ここに D1 依存は持たせない（ドメイン/アプリは Cloudflare 非依存）。
 */
export type ReadModelOp =
  | { kind: 'upsertEntry'; entry: ReadModelEntry }
  | { kind: 'deleteEntry'; id: string }
  | { kind: 'adjustDailyCategory'; date: string; category: Category; delta: number }

export interface ReadModelEntry {
  id: string
  occurredAt: string
  date: string
  category: Category
  title: string
  note?: string
  meta: MetaItem[]
}
