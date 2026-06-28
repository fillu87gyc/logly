import { z } from 'zod'
import { CATEGORY_KEYS } from '../../domain/entry/values'

const metaItemSchema = z.object({
  icon: z.string().max(64),
  text: z.string().max(200),
})

/** POST /api/entries / PUT /api/entries/:id のボディ。 */
export const entryBodySchema = z.object({
  occurredAt: z.string().min(1),
  category: z.enum(CATEGORY_KEYS),
  title: z.string().min(1),
  note: z.string().nullish(),
  meta: z.array(metaItemSchema).max(20).optional(),
})

export type EntryBody = z.infer<typeof entryBodySchema>

/** PUT/DELETE の楽観ロック期待バージョン（任意）。 */
export const expectedVersionSchema = z.number().int().nonnegative().optional()

export const statRangeSchema = z.enum(['w', 'm', 'y'])
