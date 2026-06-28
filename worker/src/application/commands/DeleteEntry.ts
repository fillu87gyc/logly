import { Entry } from '../../domain/entry/Entry'
import { ENTRY_AGGREGATE_TYPE } from '../../domain/entry/events'
import { EntryId } from '../../domain/entry/values'
import { NotFoundError, VersionConflictError } from '../../domain/shared/errors'
import { diffReadModelOps } from '../projections/EntryProjection'
import type { EventReader, WriteStore } from '../ports'

export interface DeleteEntryCommand {
  id: string
  expectedVersion?: number
}

export class DeleteEntryHandler {
  constructor(
    private readonly reader: EventReader,
    private readonly store: WriteStore,
    private readonly actor: string | null,
  ) {}

  async handle(cmd: DeleteEntryCommand): Promise<void> {
    const id = EntryId.from(cmd.id)
    const history = await this.reader.load(id.value)
    if (history.length === 0) throw new NotFoundError(`entry not found: ${cmd.id}`)

    const entry = Entry.fromHistory(id, history)
    if (entry.isDeleted) throw new NotFoundError(`entry not found: ${cmd.id}`)

    const expectedVersion = entry.version
    if (cmd.expectedVersion !== undefined && cmd.expectedVersion !== expectedVersion) {
      throw new VersionConflictError(
        `expected version ${cmd.expectedVersion} but was ${expectedVersion}`,
      )
    }

    const before = entry.snapshot()
    entry.delete()
    const ops = diffReadModelOps(id.value, before, entry.snapshot())

    await this.store.commit({
      aggregateId: id.value,
      aggregateType: ENTRY_AGGREGATE_TYPE,
      expectedVersion,
      events: entry.uncommittedEvents,
      actor: this.actor,
      readModelOps: ops,
    })
  }
}
