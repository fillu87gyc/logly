import { Icon } from './Icon'
import { TABS } from '../lib/data'
import type { Tab } from '../lib/types'

const COLS: Record<string, number> = { home: 1, calendar: 2, stats: 4, profile: 5 }

interface TabBarProps {
  tab: Tab
  onTab: (tab: Tab) => void
  onOpenAdd: () => void
}

export function TabBar({ tab, onTab, onOpenAdd }: TabBarProps) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0 16px 28px', pointerEvents: 'none' }}>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr 80px 1fr 1fr', alignItems: 'center', background: 'var(--paper-card)', border: '1px solid rgba(120,80,30,0.1)', borderRadius: 28, padding: '10px 6px', pointerEvents: 'auto', boxShadow: '0 4px 12px rgba(28,25,23,0.06), 0 12px 32px rgba(28,25,23,0.1)' }}>
        {TABS.filter((t) => t.key !== 'spacer').map((t) => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => onTab(t.key as Tab)}
              style={{ gridColumn: COLS[t.key], border: 'none', background: active ? 'rgba(120,80,30,0.08)' : 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 0', margin: '0 4px', borderRadius: 18, color: active ? 'var(--ink)' : 'var(--ink-mute)', transition: 'background 180ms ease' }}
            >
              <Icon name={t.icon} round size={24} />
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.02em', fontFamily: "'Noto Sans JP',sans-serif" }}>{t.label}</span>
            </button>
          )
        })}
        {/* big center add button */}
        <button
          onClick={onOpenAdd}
          style={{ position: 'absolute', left: '50%', top: -22, transform: 'translateX(-50%)', width: 56, height: 56, borderRadius: 999, border: 'none', background: 'linear-gradient(180deg, #292524, #1c1917)', color: 'var(--paper-card)', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: '0 6px 18px rgba(28,25,23,0.35), 0 0 0 5px var(--paper)' }}
        >
          <Icon name="add" round size={28} style={{ fontWeight: 700 }} />
        </button>
      </div>
    </div>
  )
}
