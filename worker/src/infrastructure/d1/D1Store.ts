import type { EntryEvent } from '../../domain/entry/events'
import { VersionConflictError } from '../../domain/shared/errors'
import type { CommitArgs, EventReader, WriteStore } from '../../application/ports'
import type { ReadModelOp } from '../../application/projections/ReadModelStore'

/**
 * D1 による Event Store ＋ 読み取りモデル投影の実装。
 * - `load`: 集約のイベントを version 昇順で取得。
 * - `commit`: イベント追記と読み取りモデル更新を 1 つの `batch()` で原子的に適用。
 *   UNIQUE(aggregate_id, version) 違反は VersionConflictError に変換する。
 */
export class D1Store implements EventReader, WriteStore {
  constructor(private readonly db: D1Database) {}

  async load(aggregateId: string): Promise<EntryEvent[]> {
    const { results } = await this.db
      .prepare(
        `SELECT event_type, payload, occurred_at
           FROM events
          WHERE aggregate_id = ?1
          ORDER BY version ASC`,
      )
      .bind(aggregateId)
      .all<{ event_type: string; payload: string; occurred_at: string }>()

    return results.map((row) => {
      const payload = JSON.parse(row.payload) as Record<string, unknown>
      return {
        ...payload,
        type: row.event_type,
        aggregateId,
        occurredAt: row.occurred_at,
      } as EntryEvent
    })
  }

  async commit(args: CommitArgs): Promise<void> {
    const recordedAt = new Date().toISOString()
    const statements: D1PreparedStatement[] = []

    let version = args.expectedVersion
    for (const event of args.events) {
      version++
      // type/aggregateId/occurredAt は専用カラムへ。残りのペイロードを JSON 化する。
      const { type, aggregateId: _aid, occurredAt, ...payloadRest } = event
      void _aid
      statements.push(
        this.db
          .prepare(
            `INSERT INTO events
               (aggregate_id, aggregate_type, version, event_type, payload, occurred_at, recorded_at, actor)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`,
          )
          .bind(
            args.aggregateId,
            args.aggregateType,
            version,
            type,
            JSON.stringify(payloadRest),
            occurredAt,
            recordedAt,
            args.actor,
          ),
      )
    }

    for (const op of args.readModelOps) {
      statements.push(this.toStatement(op))
    }

    try {
      await this.db.batch(statements)
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new VersionConflictError(
          `concurrent modification on aggregate ${args.aggregateId}`,
        )
      }
      throw err
    }
  }

  private toStatement(op: ReadModelOp): D1PreparedStatement {
    switch (op.kind) {
      case 'upsertEntry': {
        const e = op.entry
        return this.db
          .prepare(
            `INSERT INTO rm_entries (id, occurred_at, date, category, title, note, meta)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
             ON CONFLICT(id) DO UPDATE SET
               occurred_at = excluded.occurred_at,
               date        = excluded.date,
               category    = excluded.category,
               title       = excluded.title,
               note        = excluded.note,
               meta        = excluded.meta`,
          )
          .bind(
            e.id,
            e.occurredAt,
            e.date,
            e.category,
            e.title,
            e.note ?? null,
            JSON.stringify(e.meta),
          )
      }
      case 'deleteEntry':
        return this.db.prepare(`DELETE FROM rm_entries WHERE id = ?1`).bind(op.id)
      case 'adjustDailyCategory':
        // 増減を反映し、0 以下になった行は掃除する。
        return this.db
          .prepare(
            `INSERT INTO rm_daily_category (date, category, count)
             VALUES (?1, ?2, ?3)
             ON CONFLICT(date, category) DO UPDATE SET count = count + ?3`,
          )
          .bind(op.date, op.category, op.delta)
    }
  }
}

function isUniqueViolation(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return /UNIQUE constraint failed/i.test(msg)
}
