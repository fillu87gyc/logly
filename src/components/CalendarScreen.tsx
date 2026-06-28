import { Icon } from './Icon'
import { CAL_DOTS, LEGEND } from '../lib/data'

const DOWS = ['日', '月', '火', '水', '木', '金', '土']

function buildCells() {
  const cells: { day: number | ''; isToday: boolean; future: boolean; dots: string[] }[] = []
  for (let i = 0; i < 6; i++) cells.push({ day: '', isToday: false, future: false, dots: [] })
  for (let d = 1; d <= 30; d++) {
    cells.push({ day: d, isToday: d === 14, future: d > 14, dots: CAL_DOTS[d] || [] })
  }
  return cells
}

export function CalendarScreen() {
  const cells = buildCells()

  return (
    <div className="ll-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 0 140px', animation: 'll-fade 220ms ease both' }}>
      {/* header */}
      <div style={{ padding: '12px 24px 16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 600 }}>2025年</div>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 2, fontFamily: "'Fraunces','Noto Serif JP',serif", color: 'var(--ink)' }}>
            11月
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={{ border: 'none', background: 'rgba(120,80,30,0.08)', color: 'var(--ink-soft)', width: 36, height: 36, borderRadius: 999, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <Icon name="chevron_left" round size={20} />
          </button>
          <button style={{ border: 'none', background: 'rgba(120,80,30,0.08)', color: 'var(--ink-soft)', width: 36, height: 36, borderRadius: 999, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <Icon name="chevron_right" round size={20} />
          </button>
        </div>
      </div>

      {/* DOW header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 16px', gap: 4 }}>
        {DOWS.map((label, i) => (
          <div
            key={label}
            style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: i === 0 ? '#ef4444' : i === 6 ? '#3b82f6' : '#71717a', letterSpacing: '0.05em', padding: '6px 0' }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '4px 16px 16px', gap: 4 }}>
        {cells.map((c, i) => {
          const bg = c.day === '' ? 'transparent' : c.isToday ? 'var(--ink)' : c.future ? 'transparent' : 'var(--paper-card)'
          const border = c.day === '' ? 'transparent' : c.isToday ? 'var(--ink)' : c.future ? 'rgba(120,80,30,0.08)' : 'rgba(120,80,30,0.1)'
          const fg = c.future ? 'var(--ink-mute)' : c.isToday ? 'var(--paper-card)' : 'var(--ink)'
          const shadow = c.isToday ? '0 4px 12px rgba(28,25,23,0.18)' : 'none'
          const hasDots = !c.future && c.dots.length > 0
          return (
            <div
              key={i}
              style={{ aspectRatio: '1', borderRadius: 14, background: bg, border: `1px solid ${border}`, padding: 6, display: 'flex', flexDirection: 'column', gap: 4, position: 'relative', boxShadow: shadow }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: fg, fontVariantNumeric: 'tabular-nums' }}>{c.day}</div>
              {hasDots && (
                <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginTop: 'auto' }}>
                  {c.dots.map((color, di) => (
                    <div key={di} style={{ width: 5, height: 5, borderRadius: 999, background: color }} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* legend */}
      <div style={{ padding: '8px 24px 20px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {LEGEND.map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#a1a1aa' }}>
            <div style={{ width: 7, height: 7, borderRadius: 999, background: l.color }} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>

      {/* streaks card */}
      <div style={{ margin: '0 20px', background: 'var(--paper-card)', border: '1px solid rgba(120,80,30,0.08)', boxShadow: '0 1px 2px rgba(120,80,30,0.04), 0 6px 16px rgba(120,80,30,0.06)', borderRadius: 20, padding: '18px 18px 14px' }}>
        <div style={{ fontSize: 11, color: 'var(--ink-faint)', fontWeight: 700, letterSpacing: '0.18em', marginBottom: 12 }}>CONTINUITY</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: 4, color: 'var(--ink)', fontFamily: "'Fraunces',serif" }}>
              42<span style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 600 }}>日</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 4 }}>記録の連続日数</div>
          </div>
          <div>
            <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: 4, color: 'var(--ink)', fontFamily: "'Fraunces',serif" }}>
              228<span style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 600 }}>件</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 4 }}>今月の記録</div>
          </div>
        </div>
      </div>
    </div>
  )
}
