import type { DomainEvent } from '../shared/DomainEvent'
import type { Category, MetaItem } from './values'

/** Entry 集約が発生させるドメインイベントのペイロード共通部（occurredAt は DomainEvent 由来）。 */
interface EntrySnapshot {
  category: Category
  title: string
  note?: string
  meta: MetaItem[]
}

export interface EntryLogged extends DomainEvent, EntrySnapshot {
  type: 'EntryLogged'
}

export interface EntryEdited extends DomainEvent, EntrySnapshot {
  type: 'EntryEdited'
}

export interface EntryDeleted extends DomainEvent {
  type: 'EntryDeleted'
}

export type EntryEvent = EntryLogged | EntryEdited | EntryDeleted

export const ENTRY_AGGREGATE_TYPE = 'Entry'
