import { Icon } from './Icon'
import { AI_CHIPS } from '../lib/data'

interface AIModalProps {
  onClose: () => void
}

export function AIModal({ onClose }: AIModalProps) {
  return (
    <div
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, top: 60, zIndex: 90, background: '#f7ecd9',
        borderRadius: '28px 28px 0 0', padding: '8px 0 0', boxShadow: '0 -10px 40px rgba(28,25,23,0.18)',
        animation: 'll-sheet 280ms cubic-bezier(0.32,0.72,0,1) both', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}
    >
      <div style={{ width: 36, height: 5, borderRadius: 999, background: 'rgba(120,80,30,0.2)', margin: '0 auto 4px' }} />
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px 16px' }}>
        <button onClick={onClose} style={{ border: 'none', background: 'transparent', color: 'var(--ink-faint)', fontSize: 15, cursor: 'pointer', padding: '4px 0', fontFamily: "'Noto Sans JP',sans-serif" }}>
          キャンセル
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="auto_awesome" size={16} color="var(--paper-card)" />
          <span style={{ fontSize: 15, fontWeight: 600, fontFamily: "'Noto Sans JP',sans-serif" }}>話して記録</span>
        </div>
        <button style={{ border: 'none', background: 'var(--ink)', color: 'var(--paper-card)', padding: '7px 16px', borderRadius: 999, boxShadow: '0 2px 6px rgba(28,25,23,0.18)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Noto Sans JP',sans-serif" }}>
          保存
        </button>
      </div>

      {/* input bubble */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ background: 'var(--paper-card)', border: '1px solid rgba(120,80,30,0.08)', boxShadow: '0 1px 2px rgba(120,80,30,0.04), 0 6px 16px rgba(120,80,30,0.06)', borderRadius: 20, padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-faint)', letterSpacing: '0.18em', marginBottom: 8 }}>あなたの入力</div>
          <div style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--ink)', fontFamily: "'Noto Sans JP',sans-serif" }}>
            昨日の夜、Aさんと渋谷の三六九で7時半から飲んでた。生3杯とハイボール2杯、刺身と焼鳥。4,200円。終電逃してタクシーで帰宅、1,800円。
          </div>
        </div>
      </div>

      {/* divider with label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 24px 14px' }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(120,80,30,0.15)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="auto_awesome" size={13} color="var(--paper-card)" />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#c2410c', letterSpacing: '0.2em' }}>AI が 3 件に整理</span>
        </div>
        <div style={{ flex: 1, height: 1, background: 'rgba(120,80,30,0.15)' }} />
      </div>

      {/* parsed entries */}
      <div className="ll-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {AI_CHIPS.map((c) => (
          <div
            key={c.time + c.label}
            style={{ background: 'var(--paper-card)', border: '1px solid rgba(120,80,30,0.08)', boxShadow: '0 1px 2px rgba(120,80,30,0.04), 0 6px 16px rgba(120,80,30,0.06)', borderRadius: 18, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12, animation: 'll-fade 300ms ease both' }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 12, background: `${c.color}1f`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Icon name={c.icon} size={18} color={c.color} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: c.color, letterSpacing: '0.04em' }}>{c.label}</span>
                <span style={{ fontSize: 11, color: '#71717a', fontVariantNumeric: 'tabular-nums' }}>{c.time}</span>
              </div>
              <div style={{ fontSize: 14, color: '#44403c', lineHeight: 1.6, fontFamily: "'Noto Sans JP',sans-serif" }}>{c.detail}</div>
            </div>
            <button style={{ border: 'none', background: 'rgba(120,80,30,0.08)', color: 'var(--ink-soft)', width: 28, height: 28, borderRadius: 999, display: 'grid', placeItems: 'center', flexShrink: 0, cursor: 'pointer' }}>
              <Icon name="edit" round size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
