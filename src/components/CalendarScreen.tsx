import { useEffect, useMemo, useState } from 'react'
import { Icon } from './Icon'
import { CAL_DOTS, LEGEND } from '../lib/data'
import { api, localDateParts, type ApiEntry } from '../lib/api'

const DOWS = ['日', '月', '火', '水', '木', '金', '土']
const pad = (n: number) => String(n).padStart(2, '0')

export function CalendarScreen() {
  // 表示中の年・月（month は 0 始まり）。初期値は今月。
  const [view, setView] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  // null = ローディング / 未判定、配列 = 実データ。
  const [entries, setEntries] = useState<ApiEntry[] | null>(null)
  // false のときはバックエンド未接続としてモック表示にフォールバックする。
  const [connected, setConnected] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    const from = `${view.year}-${pad(view.month + 1)}-01`
    const daysInMonth = new Date(Date.UTC(view.year, view.month + 1, 0)).getUTCDate()
    const to = `${view.year}-${pad(view.month + 1)}-${pad(daysInMonth)}`
    void (async () => {
      try {
        const es = await api.listEntriesByRange(from, to)
        if (cancelled) return
        setEntries(es)
        setConnected(true)
      } catch {
        if (cancelled) return
        setEntries(null)
        setConnected(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [view])

  const isMock = connected === false

  // 表示対象の年・月（モック時は従来の 2025年11月）。
  const y = isMock ? 2025 : view.year
  const m = isMock ? 10 : view.month

  const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate()
  const firstDow = new Date(Date.UTC(y, m, 1)).getUTCDay()
  const todayStr = localDateParts().date

  // 日 → カテゴリ色（重複排除）。
  const dayColors = useMemo(() => {
    const map = new Map<number, string[]>()
    if (!entries) return map
    for (const e of entries) {
      const day = Number(e.date.slice(8, 10))
      const arr = map.get(day) ?? []
      if (!arr.includes(e.color)) arr.push(e.color)
      map.set(day, arr)
    }
    return map
  }, [entries])

  const dotsForDay = (day: number): string[] => (isMock ? CAL_DOTS[day] ?? [] : dayColors.get(day) ?? [])

  const cellMeta = (day: number) => {
    if (isMock) return { isToday: day === 14, future: day > 14 }
    const cellStr = `${y}-${pad(m + 1)}-${pad(day)}`
    return { isToday: cellStr === todayStr, future: cellStr > todayStr }
  }

  // 連続記録日数・今月の記録件数。
  const { streak, monthCount } = useMemo(() => {
    if (isMock) return { streak: 42, monthCount: 228 }
    const days = new Set(dayColors.keys())
    const todayDay = `${y}-${pad(m + 1)}` === todayStr.slice(0, 7) ? Number(todayStr.slice(8, 10)) : null
    let end = todayDay ?? daysInMonth
    while (end >= 1 && !days.has(end)) end--
    let s = 0
    for (let d = end; d >= 1 && days.has(d); d--) s++
    return { streak: s, monthCount: entries?.length ?? 0 }
  }, [isMock, dayColors, entries, y, m, daysInMonth, todayStr])

  const cells: { day: number | '' }[] = []
  for (let i = 0; i < firstDow; i++) cells.push({ day: '' })
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d })

  const goMonth = (delta: number) => {
    if (isMock) return // モック時は固定表示
    setView((v) => {
      const next = new Date(Date.UTC(v.year, v.month + delta, 1))
      return { year: next.getUTCFullYear(), month: next.getUTCMonth() }
    })
  }

  return (
    <div className="ll-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 0 140px', animation: 'll-fade 220ms ease both' }}>
      {/* header */}
      <div style={{ padding: '12px 24px 16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 600 }}>{y}年</div>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 2, fontFamily: "'Fraunces','Noto Serif JP',serif", color: 'var(--ink)' }}>
            {m + 1}月
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => goMonth(-1)} style={{ border: 'none', background: 'rgba(120,80,30,0.08)', color: 'var(--ink-soft)', width: 36, height: 36, borderRadius: 999, display: 'grid', placeItems: 'center', cursor: isMock ? 'default' : 'pointer', opacity: isMock ? 0.5 : 1 }}>
            <Icon name="chevron_left" round size={20} />
          </button>
          <button onClick={() => goMonth(1)} style={{ border: 'none', background: 'rgba(120,80,30,0.08)', color: 'var(--ink-soft)', width: 36, height: 36, borderRadius: 999, display: 'grid', placeItems: 'center', cursor: isMock ? 'default' : 'pointer', opacity: isMock ? 0.5 : 1 }}>
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
          if (c.day === '') {
            return <div key={i} style={{ aspectRatio: '1' }} />
          }
          const { isToday, future } = cellMeta(c.day)
          const dots = dotsForDay(c.day)
          const bg = isToday ? 'var(--ink)' : future ? 'transparent' : 'var(--paper-card)'
          const border = isToday ? 'var(--ink)' : future ? 'rgba(120,80,30,0.08)' : 'rgba(120,80,30,0.1)'
          const fg = future ? 'var(--ink-mute)' : isToday ? 'var(--paper-card)' : 'var(--ink)'
          const shadow = isToday ? '0 4px 12px rgba(28,25,23,0.18)' : 'none'
          const hasDots = !future && dots.length > 0
          return (
            <div
              key={i}
              style={{ aspectRatio: '1', borderRadius: 14, background: bg, border: `1px solid ${border}`, padding: 6, display: 'flex', flexDirection: 'column', gap: 4, position: 'relative', boxShadow: shadow }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: fg, fontVariantNumeric: 'tabular-nums' }}>{c.day}</div>
              {hasDots && (
                <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginTop: 'auto' }}>
                  {dots.slice(0, 4).map((color, di) => (
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
              {streak}<span style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 600 }}>日</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 4 }}>記録の連続日数</div>
          </div>
          <div>
            <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: 4, color: 'var(--ink)', fontFamily: "'Fraunces',serif" }}>
              {monthCount}<span style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 600 }}>件</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 4 }}>今月の記録</div>
          </div>
        </div>
      </div>
    </div>
  )
}
