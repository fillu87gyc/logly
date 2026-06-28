import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Env } from '../../env'
import { CreateEntryHandler } from '../../application/commands/CreateEntry'
import { DeleteEntryHandler } from '../../application/commands/DeleteEntry'
import { EditEntryHandler } from '../../application/commands/EditEntry'
import { CATEGORIES } from '../../application/categories'
import { EntryQueries } from '../../application/queries/EntryQueries'
import { StatsQuery } from '../../application/queries/StatsQuery'
import { isDateString } from '../../application/queries/dateRange'
import { D1QueryDao } from '../../infrastructure/d1/D1QueryDao'
import { D1Store } from '../../infrastructure/d1/D1Store'
import { DomainError } from '../../domain/shared/errors'
import { entryBodySchema, statRangeSchema } from './dto'
import { toErrorResponse } from './errors'
import { accessMiddleware } from './middleware/access'

type Vars = { actor: string }

export function createApp(): Hono<{ Bindings: Env; Variables: Vars }> {
  const app = new Hono<{ Bindings: Env; Variables: Vars }>()

  // CORS: フロント（SPA）のオリジンのみ許可する想定。1 人用なので緩めでも可。
  app.use('/api/*', cors({ origin: (o) => o, credentials: true }))

  // 認証（Cloudflare Access）。/api/health は監視用に認証不要。
  app.get('/api/health', (c) => c.json({ ok: true }))
  app.use('/api/*', accessMiddleware)

  app.onError((err, c) => toErrorResponse(c, err))

  // --- Commands ---
  app.post('/api/entries', async (c) => {
    const body = entryBodySchema.parse(await c.req.json())
    const handler = new CreateEntryHandler(new D1Store(c.env.DB), c.get('actor'))
    const result = await handler.handle(body)
    return c.json(result, 201)
  })

  app.put('/api/entries/:id', async (c) => {
    const body = entryBodySchema.parse(await c.req.json())
    const expectedVersion = parseVersion(c.req.query('expectedVersion'))
    const store = new D1Store(c.env.DB)
    const handler = new EditEntryHandler(store, store, c.get('actor'))
    await handler.handle({ id: c.req.param('id'), ...body, ...(expectedVersion !== undefined ? { expectedVersion } : {}) })
    return c.body(null, 204)
  })

  app.delete('/api/entries/:id', async (c) => {
    const expectedVersion = parseVersion(c.req.query('expectedVersion'))
    const store = new D1Store(c.env.DB)
    const handler = new DeleteEntryHandler(store, store, c.get('actor'))
    await handler.handle({ id: c.req.param('id'), ...(expectedVersion !== undefined ? { expectedVersion } : {}) })
    return c.body(null, 204)
  })

  // --- Queries ---
  app.get('/api/entries', async (c) => {
    const queries = new EntryQueries(new D1QueryDao(c.env.DB))
    const date = c.req.query('date')
    const from = c.req.query('from')
    const to = c.req.query('to')
    if (date) {
      if (!isDateString(date)) throw new DomainError('invalid date (YYYY-MM-DD)')
      return c.json(await queries.byDay(date))
    }
    if (from && to) {
      if (!isDateString(from) || !isDateString(to)) throw new DomainError('invalid from/to')
      return c.json(await queries.byRange(from, to))
    }
    throw new DomainError('date or from&to is required')
  })

  app.get('/api/stats', async (c) => {
    const range = statRangeSchema.parse(c.req.query('range') ?? 'w')
    const refDate = c.req.query('date') ?? new Date().toISOString().slice(0, 10)
    if (!isDateString(refDate)) throw new DomainError('invalid date (YYYY-MM-DD)')
    const stats = new StatsQuery(new D1QueryDao(c.env.DB))
    return c.json(await stats.get(range, refDate))
  })

  app.get('/api/categories', (c) => c.json(CATEGORIES))

  return app
}

function parseVersion(raw: string | undefined): number | undefined {
  if (raw === undefined) return undefined
  const n = Number(raw)
  if (!Number.isInteger(n) || n < 0) throw new DomainError('invalid expectedVersion')
  return n
}
