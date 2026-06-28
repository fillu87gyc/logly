import { Icon } from './Icon'
import { DAYSTRIP, ENTRIES, SUMMARY } from '../lib/data'

interface HomeScreenProps {
  onOpenAI: () => void
  onOpenDetail: (index: number) => void
}

export function HomeScreen({ onOpenAI, onOpenDetail }: HomeScreenProps) {
  return (
    <div className="ll-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 0 120px', animation: 'll-fade 220ms ease both' }}>
      {/* header */}
      <div style={{ padding: '12px 24px 8px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--ink-faint)', letterSpacing: '0.18em', fontWeight: 600, textTransform: 'uppercase' }}>
            2025年11月14日 (金)
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 4, fontFamily: "'Fraunces','Noto Serif JP',serif", lineHeight: 1 }}>
            今日
          </div>
        </div>
        <button
          onClick={onOpenAI}
          style={{ border: 'none', background: 'var(--ink)', color: 'var(--paper-card)', width: 42, height: 42, borderRadius: 999, boxShadow: '0 2px 6px rgba(28,25,23,0.18)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
        >
          <Icon name="auto_awesome" size={22} />
        </button>
      </div>

      {/* day selector strip */}
      <div className="ll-scroll" style={{ display: 'flex', gap: 8, padding: '12px 24px 20px', overflowX: 'auto' }}>
        {DAYSTRIP.map((d) => {
          const bg = d.today ? 'var(--ink)' : d.future ? 'transparent' : 'var(--paper-card)'
          const fg = d.today ? 'var(--paper-card)' : d.future ? 'var(--ink-mute)' : 'var(--ink)'
          const border = d.today ? 'var(--ink)' : d.future ? 'rgba(120,80,30,0.15)' : 'rgba(120,80,30,0.12)'
          const shadow = d.today ? '0 4px 12px rgba(28,25,23,0.25)' : d.future ? 'none' : '0 1px 2px rgba(120,80,30,0.05)'
          return (
            <div
              key={d.dow + d.day}
              style={{ flex: '0 0 auto', width: 44, height: 60, borderRadius: 16, background: bg, color: fg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, border: `1px solid ${border}`, boxShadow: shadow }}
            >
              <div style={{ fontSize: 10, letterSpacing: '0.05em', opacity: 0.7 }}>{d.dow}</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{d.day}</div>
            </div>
          )
        })}
      </div>

      {/* summary chips */}
      <div style={{ display: 'flex', gap: 8, padding: '0 24px 20px', flexWrap: 'wrap' }}>
        {SUMMARY.map((s) => (
          <div
            key={s.label}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 999, background: 'var(--paper-card)', border: '1px solid rgba(120,80,30,0.12)', boxShadow: '0 1px 2px rgba(120,80,30,0.05)' }}
          >
            <Icon name={s.icon} size={14} color={s.color} />
            <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 500 }}>{s.label}</span>
            <span style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 700 }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* timeline */}
      <div style={{ padding: '4px 24px 24px' }}>
        {ENTRIES.map((e, i) => (
          <div
            key={e.time}
            onClick={() => onOpenDetail(i)}
            style={{ display: 'grid', gridTemplateColumns: '56px 1fr', gap: 14, padding: '4px 0', cursor: 'pointer' }}
          >
            {/* time + rail */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-faint)', fontVariantNumeric: 'tabular-nums', paddingTop: 14, fontFamily: "'Fraunces',serif" }}>
                {e.time}
              </div>
              <div style={{ marginTop: 8, width: 14, height: 14, borderRadius: 999, background: e.color, boxShadow: `0 0 0 4px var(--paper), 0 0 0 5px ${e.color}33` }} />
              <div style={{ flex: 1, width: 2, background: 'rgba(120,80,30,0.18)', marginTop: 4 }} />
            </div>
            {/* card */}
            <div style={{ background: 'var(--paper-card)', border: '1px solid rgba(120,80,30,0.08)', boxShadow: '0 1px 2px rgba(120,80,30,0.04), 0 6px 16px rgba(120,80,30,0.06)', borderRadius: 18, padding: '14px 16px', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Icon name={e.icon} size={16} color={e.color} />
                <span style={{ fontSize: 11, fontWeight: 600, color: e.color, letterSpacing: '0.04em' }}>{e.category}</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.45, letterSpacing: '-0.01em', color: 'var(--ink)', fontFamily: "'Noto Sans JP',sans-serif" }}>
                {e.title}
              </div>
              {e.note && (
                <div style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, marginTop: 6 }}>{e.note}</div>
              )}
              {!!e.meta?.length && (
                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  {e.meta.map((m) => (
                    <div key={m.text} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--ink-faint)' }}>
                      <Icon name={m.icon} size={13} />
                      <span>{m.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* end of day */}
        <div style={{ textAlign: 'center', padding: '24px 0 8px', fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.3em', fontWeight: 600 }}>
          — END OF DAY —
        </div>
      </div>
    </div>
  )
}
