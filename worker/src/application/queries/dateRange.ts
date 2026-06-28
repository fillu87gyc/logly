export type StatRange = 'w' | 'm' | 'y'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function toUtc(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`)
}

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function addDays(date: string, days: number): string {
  const d = toUtc(date)
  d.setUTCDate(d.getUTCDate() + days)
  return fmt(d)
}

export function isDateString(value: string): boolean {
  if (!DATE_RE.test(value)) return false
  const d = toUtc(value)
  return !Number.isNaN(d.getTime()) && fmt(d) === value
}

/**
 * 統計の対象期間を算出する（カレンダー基準）。
 * - w: 参照日を含む週（月曜〜日曜）
 * - m: 参照日の月の 1 日〜末日
 * - y: 参照日の年の 1/1〜12/31
 */
export function resolveRange(range: StatRange, refDate: string): { from: string; to: string } {
  const d = toUtc(refDate)
  switch (range) {
    case 'w': {
      const dow = (d.getUTCDay() + 6) % 7 // 月曜=0
      const from = addDays(refDate, -dow)
      return { from, to: addDays(from, 6) }
    }
    case 'm': {
      const y = d.getUTCFullYear()
      const m = d.getUTCMonth()
      const from = fmt(new Date(Date.UTC(y, m, 1)))
      const to = fmt(new Date(Date.UTC(y, m + 1, 0)))
      return { from, to }
    }
    case 'y': {
      const y = d.getUTCFullYear()
      return { from: `${y}-01-01`, to: `${y}-12-31` }
    }
  }
}

/** from..to の各日付（YYYY-MM-DD）を列挙する。 */
export function eachDay(from: string, to: string): string[] {
  const days: string[] = []
  let cur = from
  // 上限ガード（連続範囲の暴走を防ぐ）
  for (let i = 0; i < 400 && cur <= to; i++) {
    days.push(cur)
    cur = addDays(cur, 1)
  }
  return days
}
