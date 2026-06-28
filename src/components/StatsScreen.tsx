import { useEffect, useState, type ReactNode } from 'react'
import { Icon } from './Icon'
import { CATEGORIES, CAT_BREAK, STAT_BARS, STAT_RANGES } from '../lib/data'
import type { CatBreakItem } from '../lib/types'
import { api, localDateParts, type ApiStats } from '../lib/api'

type Range = 'w' | 'm' | 'y'

const DOWS = ['日', '月', '火', '水', '木', '金', '土']
const PREV_LABEL: Record<Range, string> = { w: '先週', m: '先月', y: '昨年' }
const TITLE: Record<Range, string> = { w: '今週のアクティビティ', m: '今月のアクティビティ', y: '今年のアクティビティ' }

interface DisplayBar {
  label: string
  total: number
  byCategory: Record<string, number>
  today: boolean
  future: boolean
  showLabel: boolean
}

interface StatsView {
  rangeLabel: string
  title: string
  total: number
  badge: { text: string; positive: boolean } | null
  bars: DisplayBar[]
  cats: CatBreakItem[]
  insight: ReactNode
}

/** 'YYYY-MM-DD' を壁時計に依存せず曜日インデックス(日=0)へ。 */
function dowOf(date: string): number {
  return new Date(`${date}T00:00:00.000Z`).getUTCDay()
}

/** API レスポンスを画面表示用の View へ整形する。 */
function buildView(stats: ApiStats, range: Range, prevTotal: number | null): StatsView {
  const today = localDateParts().date

  // 期間ラベル
  let rangeLabel: string
  if (range === 'w') {
    const [, fm, fd] = stats.from.split('-')
    const [, tm, td] = stats.to.split('-')
    rangeLabel = `${+fm}月${+fd}日 — ${+tm}月${+td}日`
  } else if (range === 'm') {
    const [y, m] = stats.from.split('-')
    rangeLabel = `${y}年${+m}月`
  } else {
    rangeLabel = `${stats.from.split('-')[0]}年`
  }

  // バー：週=日次、月=日次、年=月次に集約
  let bars: DisplayBar[]
  if (range === 'y') {
    const buckets = new Map<string, { total: number; byCategory: Record<string, number> }>()
    for (const b of stats.bars) {
      const key = b.date.slice(0, 7)
      const cur = buckets.get(key) ?? { total: 0, byCategory: {} }
      cur.total += b.total
      for (const [k, v] of Object.entries(b.byCategory)) cur.byCategory[k] = (cur.byCategory[k] ?? 0) + v
      buckets.set(key, cur)
    }
    const todayMonth = today.slice(0, 7)
    bars = [...buckets.entries()].map(([key, v]) => ({
      label: `${+key.split('-')[1]}`,
      total: v.total,
      byCategory: v.byCategory,
      today: key === todayMonth,
      future: key > todayMonth,
      showLabel: true,
    }))
  } else {
    const n = stats.bars.length
    bars = stats.bars.map((b, i) => ({
      label: range === 'w' ? DOWS[dowOf(b.date)] : `${+b.date.split('-')[2]}`,
      total: b.total,
      byCategory: b.byCategory,
      today: b.date === today,
      future: b.date > today,
      showLabel: range === 'w' || n <= 16 || i % 5 === 0 || b.date === today,
    }))
  }

  // 前期間比
  let badge: StatsView['badge'] = null
  if (prevTotal != null && prevTotal > 0) {
    const pct = Math.round(((stats.total - prevTotal) / prevTotal) * 100)
    badge = { text: `${pct >= 0 ? '+' : ''}${pct}% vs ${PREV_LABEL[range]}`, positive: pct >= 0 }
  }

  return {
    rangeLabel,
    title: TITLE[range],
    total: stats.total,
    badge,
    bars,
    cats: stats.categoryBreakdown,
    insight: buildInsight(stats, bars, range),
  }
}

/** 集計データから素朴なインサイト文を組み立てる（LLM 不使用）。 */
function buildInsight(stats: ApiStats, bars: DisplayBar[], range: Range): ReactNode {
  if (stats.total === 0) {
    return <>この期間の記録はまだありません。今日のできごとから書き留めてみましょう。</>
  }
  const top = [...stats.categoryBreakdown].sort((a, b) => b.count - a.count)[0]
  const active = bars.filter((b) => !b.future).reduce((m, b) => (b.total > m.total ? b : m), bars[0])
  const unit = range === 'y' ? '月' : range === 'w' ? '曜日' : '日'
  return (
    <>
      最も多いカテゴリは「{top.label}」で{' '}
      <span style={{ color: '#fbbf24', fontWeight: 700, fontFamily: "'Fraunces',serif" }}>{top.count}</span>件。
      {active && active.total > 0 && (
        <>
          {' '}
          <span style={{ color: '#fbbf24', fontWeight: 700, fontFamily: "'Fraunces',serif" }}>{active.label}</span>
          {unit}に最も活動していました。
        </>
      )}
    </>
  )
}

/** バックエンド未接続時のフォールバック View（従来のモック）。 */
function mockView(): StatsView {
  return {
    rangeLabel: '11月8日 — 11月14日',
    title: TITLE.w,
    total: 38,
    badge: { text: '+12% vs 先週', positive: true },
    bars: STAT_BARS.map((b) => ({
      label: b.label,
      total: b.total,
      byCategory: { work: b.work, food: b.food, ex: b.ex },
      today: !!b.today,
      future: !!b.future,
      showLabel: true,
    })),
    cats: CAT_BREAK,
    insight: (
      <>
        飲み会の翌日は、運動の記録が{' '}
        <span style={{ color: '#fbbf24', fontWeight: 700, fontFamily: "'Fraunces',serif" }}>62%</span> 減る傾向。
        木曜以降に予定を詰めすぎないとよさそう。
      </>
    ),
  }
}

export function StatsScreen() {
  const [range, setRange] = useState<Range>('w')
  // null = バックエンド未接続（モックにフォールバック）
  const [stats, setStats] = useState<ApiStats | null>(null)
  const [prevTotal, setPrevTotal] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const s = await api.getStats(range)
        if (cancelled) return
        setStats(s)
        // 前期間（from の前日が属する期間）の合計を取得して増減を出す。
        try {
          const prevRef = addDays(s.from, -1)
          const prev = await api.getStats(range, prevRef)
          if (!cancelled) setPrevTotal(prev.total)
        } catch {
          if (!cancelled) setPrevTotal(null)
        }
      } catch {
        if (!cancelled) {
          setStats(null)
          setPrevTotal(null)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [range])

  const view = stats ? buildView(stats, range, prevTotal) : mockView()
  const maxBar = Math.max(1, ...view.bars.map((b) => b.total))
  const dense = view.bars.length > 10

  return (
    <div className="ll-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 0 140px', animation: 'll-fade 220ms ease both' }}>
      {/* header */}
      <div style={{ padding: '12px 24px 16px' }}>
        <div style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 600 }}>{view.rangeLabel}</div>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 2, fontFamily: "'Fraunces','Noto Serif JP',serif", color: 'var(--ink)' }}>
          {view.title}
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
              {view.total} <span style={{ fontSize: 13, color: 'var(--ink-faint)', fontWeight: 500 }}>件</span>
            </div>
          </div>
          {view.badge && (
            <div
              style={{
                fontSize: 11,
                color: view.badge.positive ? '#15803d' : '#b91c1c',
                background: view.badge.positive ? '#dcfce7' : '#fee2e2',
                padding: '4px 10px', borderRadius: 999, fontWeight: 700,
                border: `1px solid ${view.badge.positive ? 'rgba(21,128,61,0.15)' : 'rgba(185,28,28,0.15)'}`,
              }}
            >
              {view.badge.text}
            </div>
          )}
        </div>
        {/* bars */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${view.bars.length}, 1fr)`, gap: dense ? 3 : 8, height: 140, alignItems: 'end', paddingTop: 8 }}>
          {view.bars.map((b, bi) => {
            const isZero = !b.future && b.total === 0
            const height = b.future || isZero ? 8 : Math.max(8, (b.total / maxBar) * 100)
            const stack = b.future
              ? [{ color: 'rgba(120,80,30,0.06)', flex: 1 }]
              : isZero
                ? [{ color: 'rgba(120,80,30,0.12)', flex: 1 }]
                : CATEGORIES.filter((c) => (b.byCategory[c.key] ?? 0) > 0).map((c) => ({ color: c.color, flex: b.byCategory[c.key] }))
            const fg = b.today ? 'var(--ink)' : b.future ? 'var(--ink-mute)' : 'var(--ink-faint)'
            return (
              <div key={bi} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '100%', maxWidth: dense ? 14 : 22, display: 'flex', flexDirection: 'column-reverse', gap: 2, height: `${height}%` }}>
                  {stack.map((s, si) => (
                    <div key={si} style={{ background: s.color, flex: s.flex, borderRadius: 3 }} />
                  ))}
                </div>
                <div style={{ fontSize: 10, color: fg, fontWeight: 600, height: 12, fontVariantNumeric: 'tabular-nums' }}>
                  {b.showLabel ? b.label : ''}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* category breakdown */}
      <div style={{ margin: '0 20px 16px', background: 'var(--paper-card)', border: '1px solid rgba(120,80,30,0.08)', boxShadow: '0 1px 2px rgba(120,80,30,0.04), 0 6px 16px rgba(120,80,30,0.06)', borderRadius: 20, padding: 18 }}>
        <div style={{ fontSize: 11, color: 'var(--ink-faint)', fontWeight: 700, letterSpacing: '0.18em', marginBottom: 14 }}>CATEGORIES</div>
        {view.cats.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--ink-faint)' }}>この期間の記録はまだありません。</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {view.cats.map((c) => (
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
        )}
      </div>

      {/* insight */}
      <div style={{ margin: '0 20px', background: 'var(--ink)', border: '1px solid var(--ink)', borderRadius: 22, padding: 20, boxShadow: '0 6px 18px rgba(28,25,23,0.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Icon name="auto_awesome" size={16} color="#fbbf24" />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: '#fbbf24' }}>INSIGHT</span>
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.6, color: '#d4d4d8', fontFamily: "'Noto Sans JP',sans-serif" }}>
          {view.insight}
        </div>
      </div>
    </div>
  )
}

/** 'YYYY-MM-DD' に日数を加算（UTC 基準）。 */
function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00.000Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}
