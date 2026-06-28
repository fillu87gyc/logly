import { useState } from 'react'
import { Icon } from './Icon'
import { CAT_BREAK, STAT_BARS, STAT_RANGES } from '../lib/data'

export function StatsScreen() {
  const [range, setRange] = useState<string>('w')
  const maxBar = Math.max(...STAT_BARS.map((b) => b.total))

  return (
    <div className="ll-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 0 140px', animation: 'll-fade 220ms ease both' }}>
      {/* header */}
      <div style={{ padding: '12px 24px 16px' }}>
        <div style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 600 }}>11月8日 — 11月14日</div>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 2, fontFamily: "'Fraunces','Noto Serif JP',serif", color: 'var(--ink)' }}>
          今週のアクティビティ
        </div>
      </div>

      {/* segmented */}
      <div style={{ margin: '0 24px 18px', padding: 4, background: 'rgba(120,80,30,0.07)', border: '1px solid rgba(120,80,30,0.1)', borderRadius: 14, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        {STAT_RANGES.map((r) => (
          <div
            key={r.key}
            onClick={() => setRange(r.key)}
            style={{ textAlign: 'center', padding: '8px 0', fontSize: 13, fontWeight: 600, borderRadius: 9, background: range === r.key ? 'var(--ink)' : 'transparent', color: range === r.key ? 'var(--paper-card)' : 'var(--ink-faint)', cursor: 'pointer' }}
          >
            {r.label}
          </div>
        ))}
      </div>

      {/* bar chart card */}
      <div style={{ margin: '0 20px 16px', background: 'var(--paper-card)', border: '1px solid rgba(120,80,30,0.08)', boxShadow: '0 1px 2px rgba(120,80,30,0.04), 0 6px 16px rgba(120,80,30,0.06)', borderRadius: 20, padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--ink-faint)', fontWeight: 700, letterSpacing: '0.18em' }}>RECORDS</div>
            <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 4, color: 'var(--ink)', fontFamily: "'Fraunces',serif" }}>
              38 <span style={{ fontSize: 13, color: 'var(--ink-faint)', fontWeight: 500 }}>件</span>
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#15803d', background: '#dcfce7', padding: '4px 10px', borderRadius: 999, fontWeight: 700, border: '1px solid rgba(21,128,61,0.15)' }}>
            +12% vs 先週
          </div>
        </div>
        {/* bars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, height: 140, alignItems: 'end', paddingTop: 8 }}>
          {STAT_BARS.map((b) => {
            const height = b.future ? 8 : Math.max(8, (b.total / maxBar) * 100)
            const stack = b.future
              ? [{ color: 'rgba(120,80,30,0.06)', flex: 1 }]
              : [
                  { color: '#3b82f6', flex: b.work || 0.01 },
                  { color: '#f97316', flex: b.food || 0.01 },
                  { color: '#22c55e', flex: b.ex || 0.01 },
                ].filter((s) => s.flex > 0.05)
            const fg = b.today ? 'var(--ink)' : b.future ? 'var(--ink-mute)' : 'var(--ink-faint)'
            return (
              <div key={b.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '100%', maxWidth: 22, display: 'flex', flexDirection: 'column-reverse', gap: 2, height: `${height}%` }}>
                  {stack.map((s, si) => (
                    <div key={si} style={{ background: s.color, flex: s.flex, borderRadius: 3 }} />
                  ))}
                </div>
                <div style={{ fontSize: 10, color: fg, fontWeight: 600 }}>{b.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* category breakdown */}
      <div style={{ margin: '0 20px 16px', background: 'var(--paper-card)', border: '1px solid rgba(120,80,30,0.08)', boxShadow: '0 1px 2px rgba(120,80,30,0.04), 0 6px 16px rgba(120,80,30,0.06)', borderRadius: 20, padding: 18 }}>
        <div style={{ fontSize: 11, color: 'var(--ink-faint)', fontWeight: 700, letterSpacing: '0.18em', marginBottom: 14 }}>CATEGORIES</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {CAT_BREAK.map((c) => (
            <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `${c.color}1f`, display: 'grid', placeItems: 'center' }}>
                <Icon name={c.icon} size={16} color={c.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{c.label}</span>
                  <span style={{ fontSize: 13, color: '#a1a1aa', fontVariantNumeric: 'tabular-nums' }}>{c.count}件</span>
                </div>
                <div style={{ height: 4, background: 'rgba(120,80,30,0.08)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${c.pct}%`, background: c.color, borderRadius: 999 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* insight */}
      <div style={{ margin: '0 20px', background: 'var(--ink)', border: '1px solid var(--ink)', borderRadius: 22, padding: 20, boxShadow: '0 6px 18px rgba(28,25,23,0.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Icon name="auto_awesome" size={16} color="#fbbf24" />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: '#fbbf24' }}>INSIGHT</span>
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.6, color: '#d4d4d8', fontFamily: "'Noto Sans JP',sans-serif" }}>
          飲み会の翌日は、運動の記録が <span style={{ color: '#fbbf24', fontWeight: 700, fontFamily: "'Fraunces',serif" }}>62%</span> 減る傾向。木曜以降に予定を詰めすぎないとよさそう。
        </div>
      </div>
    </div>
  )
}
