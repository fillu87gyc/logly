import { Icon } from './Icon'
import type { Entry } from '../lib/types'

interface DetailModalProps {
  entry: Entry
  onClose: () => void
}

export function DetailModal({ entry, onClose }: DetailModalProps) {
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
        <button onClick={onClose} style={{ border: 'none', background: 'rgba(120,80,30,0.08)', color: 'var(--ink-soft)', width: 32, height: 32, borderRadius: 999, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <Icon name="close" round size={18} />
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ border: 'none', background: 'rgba(120,80,30,0.08)', color: 'var(--ink-soft)', width: 32, height: 32, borderRadius: 999, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <Icon name="edit" round size={16} />
          </button>
          <button style={{ border: 'none', background: '#fee2e2', color: '#b91c1c', width: 32, height: 32, borderRadius: 999, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <Icon name="delete_outline" round size={16} />
          </button>
        </div>
      </div>

      {/* category header */}
      <div style={{ padding: '4px 24px 20px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 999, background: `${entry.color}1f`, marginBottom: 14 }}>
          <Icon name={entry.icon} size={14} color={entry.color} />
          <span style={{ fontSize: 12, fontWeight: 700, color: entry.color, letterSpacing: '0.04em' }}>{entry.category}</span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.01em', fontFamily: "'Fraunces','Noto Serif JP',serif", color: 'var(--ink)' }}>
          {entry.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, color: 'var(--ink-faint)', fontSize: 13, fontFamily: "'Fraunces',serif" }}>
          <Icon name="schedule" size={14} />
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{entry.time}</span>
          <span style={{ margin: '0 4px' }}>·</span>
          <span>2025/11/14</span>
        </div>
      </div>

      {/* note */}
      {entry.note && (
        <div style={{ margin: '0 20px 16px', padding: 16, background: 'var(--paper-card)', border: '1px solid rgba(120,80,30,0.08)', boxShadow: '0 1px 2px rgba(120,80,30,0.04), 0 6px 16px rgba(120,80,30,0.06)', borderRadius: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-faint)', letterSpacing: '0.18em', marginBottom: 8 }}>MEMO</div>
          <div style={{ fontSize: 15, lineHeight: 1.8, color: '#44403c', fontFamily: "'Noto Sans JP',sans-serif" }}>{entry.note}</div>
        </div>
      )}

      {/* meta */}
      {!!entry.meta?.length && (
        <div style={{ margin: '0 20px 16px', padding: '4px 16px', background: 'var(--paper-card)', border: '1px solid rgba(120,80,30,0.08)', boxShadow: '0 1px 2px rgba(120,80,30,0.04), 0 6px 16px rgba(120,80,30,0.06)', borderRadius: 18 }}>
          {entry.meta.map((m, i) => (
            <div key={m.text} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i === entry.meta!.length - 1 ? 'none' : '1px solid rgba(120,80,30,0.08)' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(120,80,30,0.07)', display: 'grid', placeItems: 'center' }}>
                <Icon name={m.icon} size={15} color="var(--ink-faint)" />
              </div>
              <div style={{ fontSize: 14, color: '#44403c', fontFamily: "'Noto Sans JP',sans-serif" }}>{m.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
