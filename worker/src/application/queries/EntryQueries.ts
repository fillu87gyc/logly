import type { MetaItem } from '../../domain/entry/values'
import { categoryDisplay } from '../categories'
import type { QueryPort, ReadModelRow } from '../ports'
import type { EntryDto } from './dto'

function toDto(row: ReadModelRow): EntryDto {
  const cat = categoryDisplay(row.category)
  const meta = JSON.parse(row.meta) as MetaItem[]
  const time = row.occurred_at.includes('T') ? row.occurred_at.slice(11, 16) : ''
  return {
    id: row.id,
    occurredAt: row.occurred_at,
    date: row.date,
    time,
    category: row.category,
    categoryLabel: cat.label,
    icon: cat.icon,
    color: cat.color,
    title: row.title,
    ...(row.note != null ? { note: row.note } : {}),
    meta,
  }
}

export class EntryQueries {
  constructor(private readonly dao: QueryPort) {}

  async byDay(date: string): Promise<EntryDto[]> {
    const rows = await this.dao.listByDate(date)
    return rows.map(toDto)
  }

  async byRange(from: string, to: string): Promise<EntryDto[]> {
    const rows = await this.dao.listByRange(from, to)
    return rows.map(toDto)
  }
}
