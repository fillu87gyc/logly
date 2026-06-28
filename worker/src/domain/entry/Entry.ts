import { AggregateRoot } from '../shared/AggregateRoot'
import { DomainError } from '../shared/errors'
import type { EntryEvent } from './events'
import {
  assertCategory,
  EntryId,
  type Category,
  type MetaItem,
  Note,
  normalizeMeta,
  OccurredAt,
  Title,
} from './values'

/** 集約への入力（検証前の素値）。 */
export interface EntryInput {
  occurredAt: string
  category: string
  title: string
  note?: string | null
  meta?: MetaItem[]
}

/** 検証済みの不変条件を満たす値の束。 */
interface EntryState {
  occurredAt: OccurredAt
  category: Category
  title: Title
  note: Note
  meta: MetaItem[]
}

function validate(input: EntryInput): EntryState {
  assertCategory(input.category)
  return {
    occurredAt: OccurredAt.from(input.occurredAt),
    category: input.category,
    title: Title.from(input.title),
    note: Note.from(input.note),
    meta: normalizeMeta(input.meta),
  }
}

/**
 * 集約の現在状態のスナップショット（読み取りモデル投影の差分計算に使う）。
 * 削除済み・未生成のときは null。
 */
export interface EntrySnapshotView {
  id: string
  occurredAt: string
  date: string
  category: Category
  title: string
  note?: string
  meta: MetaItem[]
}

/**
 * Entry（ログ記録）集約ルート。イベントソーシングで状態を管理する。
 * 状態は `apply` でのみ変化し、`log`/`edit`/`delete` が対応イベントを raise する。
 */
export class Entry extends AggregateRoot<EntryEvent> {
  private _deleted = false
  private _state: EntrySnapshotView | undefined

  private constructor(readonly id: EntryId) {
    super()
  }

  /** 新規記録を作成する。 */
  static log(id: EntryId, input: EntryInput): Entry {
    const state = validate(input)
    const entry = new Entry(id)
    entry.raise({
      type: 'EntryLogged',
      aggregateId: id.value,
      occurredAt: state.occurredAt.iso,
      category: state.category,
      title: state.title.value,
      ...(state.note.value !== undefined ? { note: state.note.value } : {}),
      meta: state.meta,
    })
    return entry
  }

  /** イベント履歴から集約を再構築する。 */
  static fromHistory(id: EntryId, events: readonly EntryEvent[]): Entry {
    const entry = new Entry(id)
    entry.loadFrom(events)
    return entry
  }

  /** 記録を編集する。 */
  edit(input: EntryInput): void {
    this.ensureNotDeleted()
    const state = validate(input)
    this.raise({
      type: 'EntryEdited',
      aggregateId: this.id.value,
      occurredAt: state.occurredAt.iso,
      category: state.category,
      title: state.title.value,
      ...(state.note.value !== undefined ? { note: state.note.value } : {}),
      meta: state.meta,
    })
  }

  /** 記録を削除する（論理削除：削除イベントを追記）。 */
  delete(now: Date = new Date()): void {
    this.ensureNotDeleted()
    this.raise({
      type: 'EntryDeleted',
      aggregateId: this.id.value,
      occurredAt: now.toISOString(),
    })
  }

  get isDeleted(): boolean {
    return this._deleted
  }

  /** 現在状態のスナップショット（削除済み・未生成なら null）。 */
  snapshot(): EntrySnapshotView | null {
    if (this._deleted || !this._state) return null
    return this._state
  }

  /** 履歴再構築用（version を進める）。 */
  private loadFrom(events: readonly EntryEvent[]): void {
    for (const event of events) this.replay(event)
  }

  protected apply(event: EntryEvent): void {
    switch (event.type) {
      case 'EntryLogged':
      case 'EntryEdited':
        this._deleted = false
        this._state = {
          id: event.aggregateId,
          occurredAt: event.occurredAt,
          date: event.occurredAt.slice(0, 10),
          category: event.category,
          title: event.title,
          ...(event.note !== undefined ? { note: event.note } : {}),
          meta: event.meta,
        }
        break
      case 'EntryDeleted':
        this._deleted = true
        break
    }
  }

  private ensureNotDeleted(): void {
    if (this._deleted) throw new DomainError('entry is already deleted')
  }
}
