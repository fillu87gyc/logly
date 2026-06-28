import { CATEGORIES } from '../categories'
import type { QueryPort } from '../ports'
import { eachDay, resolveRange, type StatRange } from './dateRange'
import type { CatBreakDto, StatBarDto, StatsDto } from './dto'

export class StatsQuery {
  constructor(private readonly dao: QueryPort) {}

  async get(range: StatRange, refDate: string): Promise<StatsDto> {
    const { from, to } = resolveRange(range, refDate)
    const counts = await this.dao.dailyCategoryCounts(from, to)

    // 日付×カテゴリのバー
    const byDate = new Map<string, StatBarDto>()
    for (const date of eachDay(from, to)) {
      byDate.set(date, { date, total: 0, byCategory: {} })
    }
    const catTotals = new Map<string, number>()
    let total = 0

    for (const row of counts) {
      const bar = byDate.get(row.date)
      if (bar) {
        bar.byCategory[row.category] = (bar.byCategory[row.category] ?? 0) + row.count
        bar.total += row.count
      }
      catTotals.set(row.category, (catTotals.get(row.category) ?? 0) + row.count)
      total += row.count
    }

    const maxCat = Math.max(1, ...catTotals.values())
    const categoryBreakdown: CatBreakDto[] = CATEGORIES.map((c) => {
      const count = catTotals.get(c.key) ?? 0
      return {
        key: c.key,
        label: c.label,
        icon: c.icon,
        color: c.color,
        count,
        pct: Math.round((count / maxCat) * 100),
      }
    }).filter((c) => c.count > 0)

    return {
      range,
      from,
      to,
      total,
      bars: [...byDate.values()],
      categoryBreakdown,
    }
  }
}
