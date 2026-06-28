import { Entry, type EntryInput } from '../../domain/entry/Entry'
import { ENTRY_AGGREGATE_TYPE } from '../../domain/entry/events'
import { EntryId } from '../../domain/entry/values'
import { diffReadModelOps } from '../projections/EntryProjection'
import type { WriteStore } from '../ports'

export interface CreateEntryCommand extends EntryInput {}

export class CreateEntryHandler {
  constructor(
    private readonly store: WriteStore,
    private readonly actor: string | null,
  ) {}

  async handle(cmd: CreateEntryCommand): Promise<{ id: string }> {
    const id = EntryId.next()
    const entry = Entry.log(id, cmd)

    const ops = diffReadModelOps(id.value, null, entry.snapshot())

    await this.store.commit({
      aggregateId: id.value,
      aggregateType: ENTRY_AGGREGATE_TYPE,
      expectedVersion: 0,
      events: entry.uncommittedEvents,
      actor: this.actor,
      readModelOps: ops,
    })

    return { id: id.value }
  }
}
