import { useState } from 'react'
import { Icon } from './Icon'
import { SETTINGS } from '../lib/data'

export function ProfileScreen() {
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(SETTINGS.filter((s) => s.isToggle).map((s) => [s.label, !!s.on])),
  )

  return (
    <div className="ll-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 0 140px', animation: 'll-fade 220ms ease both' }}>
      {/* header */}
      <div style={{ padding: '12px 24px 16px' }}>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', fontFamily: "'Fraunces','Noto Serif JP',serif", color: 'var(--ink)' }}>マイ</div>
      </div>

      {/* profile card */}
      <div style={{ margin: '0 20px 16px', background: 'var(--paper-card)', border: '1px solid rgba(120,80,30,0.08)', boxShadow: '0 1px 2px rgba(120,80,30,0.04), 0 6px 16px rgba(120,80,30,0.06)', borderRadius: 20, padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: 999, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' }}>
          N
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em', fontFamily: "'Noto Sans JP',sans-serif" }}>なつき</div>
          <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>記録開始から 312 日 · 1,847 件</div>
        </div>
        <Icon name="chevron_right" round size={20} color="var(--ink-mute)" />
      </div>

      {/* settings list */}
      <div style={{ margin: '0 20px 16px', background: 'var(--paper-card)', border: '1px solid rgba(120,80,30,0.08)', boxShadow: '0 1px 2px rgba(120,80,30,0.04), 0 6px 16px rgba(120,80,30,0.06)', borderRadius: 20, overflow: 'hidden' }}>
        {SETTINGS.map((s, i) => {
          const on = toggles[s.label]
          return (
            <div
              key={s.label}
              onClick={() => s.isToggle && setToggles((t) => ({ ...t, [s.label]: !t[s.label] }))}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: i === SETTINGS.length - 1 ? 'none' : '1px solid rgba(120,80,30,0.08)', cursor: s.isToggle ? 'pointer' : 'default' }}
            >
              <div style={{ width: 30, height: 30, borderRadius: 8, background: s.bg, display: 'grid', placeItems: 'center' }}>
                <Icon name={s.icon} size={16} color={s.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontFamily: "'Noto Sans JP',sans-serif", color: 'var(--ink)', fontWeight: 500 }}>{s.label}</div>
                {s.sub && <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2 }}>{s.sub}</div>}
              </div>
              {s.isToggle ? (
                <div
                  style={{ width: 44, height: 26, background: on ? 'var(--ink)' : 'rgba(120,80,30,0.18)', borderRadius: 999, padding: 2, boxSizing: 'border-box', display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)' }}
                >
                  <div style={{ width: 22, height: 22, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.6)' }} />
                </div>
              ) : (
                <Icon name="chevron_right" round size={18} color="var(--ink-mute)" />
              )}
            </div>
          )
        })}
      </div>

      <div style={{ textAlign: 'center', fontSize: 11, color: '#52525b', letterSpacing: '0.05em', padding: '8px 0' }}>Lifelog · v1.0.0</div>
    </div>
  )
}
