import { describe, expect, it } from 'vitest'
import { Entry } from '../../src/domain/entry/Entry'
import { EntryId } from '../../src/domain/entry/values'
import { DomainError } from '../../src/domain/shared/errors'

const id = EntryId.from('01ARZ3NDEKTSV4RRFFQ69G5FAV')

const base = {
  occurredAt: '2026-06-28T07:15',
  category: 'work',
  title: 'デザインレビュー',
}

describe('Entry 集約', () => {
  it('log で EntryLogged を 1 件 raise し version=1', () => {
    const entry = Entry.log(id, base)
    expect(entry.version).toBe(1)
    expect(entry.uncommittedEvents).toHaveLength(1)
    expect(entry.uncommittedEvents[0]!.type).toBe('EntryLogged')
    expect(entry.snapshot()?.date).toBe('2026-06-28')
    expect(entry.snapshot()?.occurredAt).toBe('2026-06-28T07:15')
  })

  it('title 必須の不変条件', () => {
    expect(() => Entry.log(id, { ...base, title: '   ' })).toThrow(DomainError)
  })

  it('未知カテゴリを拒否', () => {
    expect(() => Entry.log(id, { ...base, category: 'unknown' })).toThrow(DomainError)
  })

  it('fromHistory でイベント列から再構築できる', () => {
    const logged = Entry.log(id, base)
    const events = [...logged.uncommittedEvents]
    const rebuilt = Entry.fromHistory(id, events)
    expect(rebuilt.version).toBe(1)
    expect(rebuilt.uncommittedEvents).toHaveLength(0) // 再構築は未コミットに積まない
    expect(rebuilt.snapshot()?.title).toBe('デザインレビュー')
  })

  it('edit で日付・カテゴリを変更できる', () => {
    const logged = Entry.log(id, base)
    const rebuilt = Entry.fromHistory(id, [...logged.uncommittedEvents])
    rebuilt.edit({ ...base, occurredAt: '2026-06-29T09:00', category: 'food', title: '昼食' })
    expect(rebuilt.version).toBe(2)
    expect(rebuilt.snapshot()?.date).toBe('2026-06-29')
    expect(rebuilt.snapshot()?.category).toBe('food')
  })

  it('削除後はコマンドを拒否する', () => {
    const logged = Entry.log(id, base)
    const rebuilt = Entry.fromHistory(id, [...logged.uncommittedEvents])
    rebuilt.delete()
    expect(rebuilt.isDeleted).toBe(true)
    expect(rebuilt.snapshot()).toBeNull()
    const deleted = Entry.fromHistory(id, [
      ...logged.uncommittedEvents,
      ...rebuilt.uncommittedEvents,
    ])
    expect(() => deleted.edit(base)).toThrow(DomainError)
    expect(() => deleted.delete()).toThrow(DomainError)
  })
})
