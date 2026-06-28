import { Icon } from './Icon'
import { CATEGORIES } from '../lib/data'

interface AddModalProps {
  onClose: () => void
  onOpenAI: () => void
}

export function AddModal({ onClose, onOpenAI }: AddModalProps) {
  return (
    <div
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 90, background: 'var(--paper-card)',
        borderRadius: '28px 28px 0 0', padding: '8px 0 28px', animation: 'll-sheet 280ms cubic-bezier(0.32,0.72,0,1) both',
        maxHeight: '80%', boxShadow: '0 -10px 40px rgba(28,25,23,0.18)', display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{ width: 36, height: 5, borderRadius: 999, background: 'rgba(120,80,30,0.2)', margin: '0 auto 4px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px 16px' }}>
        <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Fraunces','Noto Serif JP',serif", color: 'var(--ink)' }}>記録を追加</div>
        <button onClick={onClose} style={{ border: 'none', background: 'rgba(120,80,30,0.08)', color: 'var(--ink-soft)', width: 32, height: 32, borderRadius: 999, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <Icon name="close" round size={18} />
        </button>
      </div>

      {/* AI shortcut */}
      <div
        onClick={onOpenAI}
        style={{ margin: '0 20px 16px', padding: '14px 16px', background: 'linear-gradient(135deg, #fed7aa, #fdba74)', border: '1px solid rgba(194,65,12,0.25)', borderRadius: 20, boxShadow: '0 4px 12px rgba(194,65,12,0.1)', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
      >
        <div style={{ width: 36, height: 36, borderRadius: 12, background: '#c2410c', display: 'grid', placeItems: 'center', boxShadow: '0 2px 6px rgba(194,65,12,0.2)' }}>
          <Icon name="auto_awesome" size={18} color="var(--paper-card)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Noto Sans JP',sans-serif", color: '#7c2d12' }}>話しかけて記録する</div>
          <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2 }}>「昨日の夜、友達と飲みに行って…」</div>
        </div>
        <Icon name="chevron_right" round size={18} color="#71717a" />
      </div>

      <div style={{ padding: '0 20px 8px', fontSize: 11, fontWeight: 700, color: 'var(--ink-faint)', letterSpacing: '0.18em' }}>カテゴリから選ぶ</div>

      <div style={{ padding: '8px 16px 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, overflowY: 'auto' }}>
        {CATEGORIES.map((c) => (
          <div
            key={c.key}
            style={{ aspectRatio: '1', background: 'var(--paper-card)', border: '1px solid rgba(120,80,30,0.08)', boxShadow: '0 1px 2px rgba(120,80,30,0.04), 0 6px 16px rgba(120,80,30,0.06)', borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${c.color}1f`, display: 'grid', placeItems: 'center' }}>
              <Icon name={c.icon} size={22} color={c.color} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, fontFamily: "'Noto Sans JP',sans-serif" }}>{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
