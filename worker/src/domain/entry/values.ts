import { DomainError } from '../shared/errors'
import { isUlid, ulid } from '../shared/ulid'

/** 固定カテゴリ（src/lib/data.ts の CATEGORIES のキーに対応）。 */
export const CATEGORY_KEYS = [
  'work',
  'food',
  'drink',
  'ex',
  'move',
  'sleep',
  'diary',
  'money',
  'other',
] as const

export type Category = (typeof CATEGORY_KEYS)[number]

export function assertCategory(value: string): asserts value is Category {
  if (!(CATEGORY_KEYS as readonly string[]).includes(value)) {
    throw new DomainError(`unknown category: ${value}`)
  }
}

/** 集約 ID（ULID）。 */
export class EntryId {
  private constructor(readonly value: string) {}

  static next(): EntryId {
    return new EntryId(ulid())
  }

  static from(value: string): EntryId {
    if (!isUlid(value)) throw new DomainError(`invalid entry id: ${value}`)
    return new EntryId(value)
  }

  equals(other: EntryId): boolean {
    return this.value === other.value
  }
}

/**
 * 出来事の発生時刻。ライフログは「壁時計時刻」が意味を持つため、
 * タイムゾーン演算は行わず、与えられた ISO8601 文字列をそのまま解釈する。
 * `date`（YYYY-MM-DD）と `time`（HH:mm）を導出できる。
 */
const ISO_RE = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/

export class OccurredAt {
  private constructor(
    readonly iso: string,
    readonly date: string,
    readonly time: string,
  ) {}

  static from(value: string): OccurredAt {
    const m = ISO_RE.exec(value)
    if (!m) throw new DomainError(`invalid occurredAt (expected ISO8601): ${value}`)
    const [, date, hh, mm] = m
    const month = Number(date!.slice(5, 7))
    const day = Number(date!.slice(8, 10))
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      throw new DomainError(`invalid date: ${date}`)
    }
    if (Number(hh) > 23 || Number(mm) > 59) {
      throw new DomainError(`invalid time: ${hh}:${mm}`)
    }
    return new OccurredAt(value, date!, `${hh}:${mm}`)
  }
}

/** 記録のタイトル（必須・1〜120 文字）。 */
export class Title {
  private constructor(readonly value: string) {}

  static from(value: string): Title {
    const trimmed = value.trim()
    if (trimmed.length === 0) throw new DomainError('title is required')
    if (trimmed.length > 120) throw new DomainError('title too long (max 120)')
    return new Title(trimmed)
  }
}

/** 任意のメモ（0〜2000 文字）。 */
export class Note {
  private constructor(readonly value: string | undefined) {}

  static from(value: string | undefined | null): Note {
    if (value == null || value.trim().length === 0) return new Note(undefined)
    if (value.length > 2000) throw new DomainError('note too long (max 2000)')
    return new Note(value)
  }
}

/** 付帯情報（金額・所要時間・場所 等）。 */
export interface MetaItem {
  icon: string
  text: string
}

export function normalizeMeta(meta: readonly MetaItem[] | undefined): MetaItem[] {
  if (!meta) return []
  if (meta.length > 20) throw new DomainError('too many meta items (max 20)')
  return meta.map((m) => {
    if (typeof m.icon !== 'string' || typeof m.text !== 'string') {
      throw new DomainError('invalid meta item')
    }
    return { icon: m.icon, text: m.text }
  })
}
