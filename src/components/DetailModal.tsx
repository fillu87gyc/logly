import { useState, type CSSProperties } from 'react'
import { Icon } from './Icon'
import type { Entry } from '../lib/types'
import type { ApiEntry, EntryInput } from '../lib/api'

interface DetailModalProps {
  entry: Entry
  /** API 接続時のみ存在（id/occurredAt/category を保持）。未接続(モック)時は undefined。 */
  apiEntry?: ApiEntry | undefined
  onClose: () => void
  onUpdate: (id: string, input: EntryInput) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function DetailModal({ entry, apiEntry, onClose, onUpdate, onDelete }: DetailModalProps) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(entry.title)
  const [note, setNote] = useState(entry.note ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const writable = apiEntry !== undefined // モック表示時は編集/削除不可

  const save = async () => {
    if (!apiEntry) return
    setBusy(true)
    setError(null)
    try {
      await onUpdate(apiEntry.id, {
        occurredAt: apiEntry.occurredAt,
        category: apiEntry.category,
        title: title.trim(),
        note: note.trim() ? note.trim() : null,
        meta: apiEntry.meta,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : '更新に失敗しました')
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!apiEntry) return
    if (!confirm('この記録を削除しますか？')) return
    setBusy(true)
    setError(null)
    try {
      await onDelete(apiEntry.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : '削除に失敗しました')
      setBusy(false)
    }
  }

  return (
    <div
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 90, background: 'var(--paper-card)',
        borderRadius: '28px 28px 0 0', padding: '8px 0 28px', animation: 'll-sheet 280ms cubic-bezier(0.32,0.72,0,1) both',
        display: 'flex', flexDirection: 'column', boxShadow: '0 -10px 40px rgba(28,25,23,0.18)',
      }}
    >
      <div style={{ width: 36, height: 5, borderRadius: 999, background: 'rgba(120,80,30,0.2)', margin: '0 auto 4px' }} />
      {/* close + actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px 12px' }}>
        <button onClick={onClose} style={iconBtn()}>
          <Icon name="close" round size={18} />
        </button>
        {writable && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setEditing((v) => !v)} disabled={busy} style={iconBtn()}>
              <Icon name={editing ? 'close' : 'edit'} round size={16} />
            </button>
            <button onClick={remove} disabled={busy} style={iconBtn('#fee2e2', '#b91c1c')}>
              <Icon name="delete_outline" round size={16} />
            </button>
          </div>
        )}
      </div>

      {/* category header */}
      <div style={{ padding: '4px 24px 20px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 999, background: `${entry.color}1f`, marginBottom: 14 }}>
          <Icon name={entry.icon} size={14} color={entry.color} />
          <span style={{ fontSize: 12, fontWeight: 700, color: entry.color, letterSpacing: '0.04em' }}>{entry.category}</span>
        </div>

        {editing ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', fontSize: 24, fontWeight: 700, padding: '6px 10px', border: '1px solid rgba(120,80,30,0.18)', borderRadius: 12, background: 'var(--paper)', color: 'var(--ink)', outline: 'none', fontFamily: "'Noto Sans JP',sans-serif" }}
          />
        ) : (
          <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.01em', fontFamily: "'Fraunces','Noto Serif JP',serif", color: 'var(--ink)' }}>
            {entry.title}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, color: 'var(--ink-faint)', fontSize: 13, fontFamily: "'Fraunces',serif" }}>
          <Icon name="schedule" size={14} />
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{entry.time}</span>
          {apiEntry && (
            <>
              <span style={{ margin: '0 4px' }}>·</span>
              <span>{apiEntry.date}</span>
            </>
          )}
        </div>
      </div>

      {/* note */}
      {editing ? (
        <div style={{ margin: '0 20px 16px' }}>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="メモ（任意）"
            rows={4}
            style={{ width: '100%', resize: 'vertical', padding: 14, border: '1px solid rgba(120,80,30,0.18)', borderRadius: 18, background: 'var(--paper)', color: '#44403c', fontSize: 15, lineHeight: 1.7, outline: 'none', fontFamily: "'Noto Sans JP',sans-serif" }}
          />
        </div>
      ) : (
        entry.note && (
          <div style={{ margin: '0 20px 16px', padding: 16, background: 'var(--paper-card)', border: '1px solid rgba(120,80,30,0.08)', boxShadow: '0 1px 2px rgba(120,80,30,0.04), 0 6px 16px rgba(120,80,30,0.06)', borderRadius: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-faint)', letterSpacing: '0.18em', marginBottom: 8 }}>MEMO</div>
            <div style={{ fontSize: 15, lineHeight: 1.8, color: '#44403c', fontFamily: "'Noto Sans JP',sans-serif" }}>{entry.note}</div>
          </div>
        )
      )}

      {/* meta */}
      {!editing && !!entry.meta?.length && (
        <div style={{ margin: '0 20px 16px', padding: '4px 16px', background: 'var(--paper-card)', border: '1px solid rgba(120,80,30,0.08)', boxShadow: '0 1px 2px rgba(120,80,30,0.04), 0 6px 16px rgba(120,80,30,0.06)', borderRadius: 18 }}>
          {entry.meta.map((m, i) => (
            <div key={m.text + i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i === entry.meta!.length - 1 ? 'none' : '1px solid rgba(120,80,30,0.08)' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(120,80,30,0.07)', display: 'grid', placeItems: 'center' }}>
                <Icon name={m.icon} size={15} color="var(--ink-faint)" />
              </div>
              <div style={{ fontSize: 14, color: '#44403c', fontFamily: "'Noto Sans JP',sans-serif" }}>{m.text}</div>
            </div>
          ))}
        </div>
      )}

      {error && <div style={{ padding: '0 24px 8px', fontSize: 12, color: '#b91c1c' }}>{error}</div>}

      {editing && (
        <div style={{ padding: '4px 20px 0' }}>
          <button
            onClick={save}
            disabled={busy || title.trim().length === 0}
            style={{
              width: '100%', padding: '14px 0', border: 'none', borderRadius: 16,
              background: busy || title.trim().length === 0 ? 'rgba(120,80,30,0.2)' : 'var(--ink)',
              color: 'var(--paper-card)', fontSize: 15, fontWeight: 700,
              cursor: busy || title.trim().length === 0 ? 'default' : 'pointer', fontFamily: "'Noto Sans JP',sans-serif",
            }}
          >
            {busy ? '保存中…' : '変更を保存'}
          </button>
        </div>
      )}
    </div>
  )
}

function iconBtn(bg = 'rgba(120,80,30,0.08)', color = 'var(--ink-soft)'): CSSProperties {
  return { border: 'none', background: bg, color, width: 32, height: 32, borderRadius: 999, display: 'grid', placeItems: 'center', cursor: 'pointer' }
}
