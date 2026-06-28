import type { DailyCategoryCount, QueryPort, ReadModelRow } from '../../application/ports'

/** 読み取りモデル（rm_*）を直接 SELECT するクエリ実装。ドメイン層を経由しない。 */
export class D1QueryDao implements QueryPort {
  constructor(private readonly db: D1Database) {}

  async listByDate(date: string): Promise<ReadModelRow[]> {
    const { results } = await this.db
      .prepare(
        `SELECT id, occurred_at, date, category, title, note, meta
           FROM rm_entries
          WHERE date = ?1
          ORDER BY occurred_at ASC`,
      )
      .bind(date)
      .all<ReadModelRow>()
    return results
  }

  async listByRange(from: string, to: string): Promise<ReadModelRow[]> {
    const { results } = await this.db
      .prepare(
        `SELECT id, occurred_at, date, category, title, note, meta
           FROM rm_entries
          WHERE date >= ?1 AND date <= ?2
          ORDER BY occurred_at ASC`,
      )
      .bind(from, to)
      .all<ReadModelRow>()
    return results
  }

  async dailyCategoryCounts(from: string, to: string): Promise<DailyCategoryCount[]> {
    const { results } = await this.db
      .prepare(
        `SELECT date, category, count
           FROM rm_daily_category
          WHERE date >= ?1 AND date <= ?2 AND count > 0
          ORDER BY date ASC`,
      )
      .bind(from, to)
      .all<DailyCategoryCount>()
    return results
  }
}
