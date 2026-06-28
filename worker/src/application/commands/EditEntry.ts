import { Entry, type EntryInput } from '../../domain/entry/Entry'
import { ENTRY_AGGREGATE_TYPE } from '../../domain/entry/events'
import { EntryId } from '../../domain/entry/values'
import { NotFoundError, VersionConflictError } from '../../domain/shared/errors'
import { diffReadModelOps } from '../projections/EntryProjection'
import type { EventReader, WriteStore } from '../ports'

export interface EditEntryCommand extends EntryInput {
  id: string
  /** 楽観ロックの期待バージョン。未指定なら現在値を採用（単独利用者なので緩め）。 */
  expectedVersion?: number
}

export class EditEntryHandler {
  constructor(
    private readonly reader: EventReader,
    private readonly store: WriteStore,
    private readonly actor: string | null,
  ) {}

  async handle(cmd: EditEntryCommand): Promise<void> {
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
    entry.edit(cmd)
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
