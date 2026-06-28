import type { EntrySnapshotView } from '../../domain/entry/Entry'
import type { ReadModelOp } from './ReadModelStore'

/**
 * 集約の変更前後スナップショットの差分から、読み取りモデル操作を導出する。
 * - 作成: before=null, after=snapshot
 * - 編集: before=旧snapshot, after=新snapshot（日付/カテゴリ変更も差分で吸収）
 * - 削除: before=旧snapshot, after=null
 *
 * イベント種別に依存せず before/after の差分だけで全ケースを表現する。
 */
export function diffReadModelOps(
  id: string,
  before: EntrySnapshotView | null,
  after: EntrySnapshotView | null,
): ReadModelOp[] {
  const ops: ReadModelOp[] = []

  if (after) {
    ops.push({
      kind: 'upsertEntry',
      entry: {
        id: after.id,
        occurredAt: after.occurredAt,
        date: after.date,
        category: after.category,
        title: after.title,
        ...(after.note !== undefined ? { note: after.note } : {}),
        meta: after.meta,
      },
    })
  } else {
    ops.push({ kind: 'deleteEntry', id })
  }

  // 日次×カテゴリ集計の増減（旧を減らし、新を増やす）
  if (before) {
    ops.push({ kind: 'adjustDailyCategory', date: before.date, category: before.category, delta: -1 })
  }
  if (after) {
    ops.push({ kind: 'adjustDailyCategory', date: after.date, category: after.category, delta: +1 })
  }

  return ops
}
