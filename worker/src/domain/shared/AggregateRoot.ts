import type { DomainEvent } from './DomainEvent'

/**
 * イベントソーシングの集約ルート基底クラス。
 *
 * - `raise(event)`: 新しい変更。状態へ apply し、未コミットイベントに積む。
 * - `replay(event)`: 履歴からの再構築。状態へ apply し version を進める。
 * - 具象クラスは `apply(event)` で純粋な状態遷移のみを実装する（副作用禁止）。
 */
export abstract class AggregateRoot<E extends DomainEvent> {
  private _version = 0
  private _uncommitted: E[] = []

  /** 現在のバージョン（適用済みイベント数）。楽観ロックの期待値に使う。 */
  get version(): number {
    return this._version
  }

  /** 未コミット（未永続化）のイベント列。 */
  get uncommittedEvents(): readonly E[] {
    return this._uncommitted
  }

  /** 永続化完了後に未コミットイベントをクリアする。 */
  markCommitted(): void {
    this._uncommitted = []
  }

  /** 新しい変更を起こす。 */
  protected raise(event: E): void {
    this.apply(event)
    this._version++
    this._uncommitted.push(event)
  }

  /** 履歴イベントから状態を再構築する（未コミットには積まない）。 */
  protected replay(event: E): void {
    this.apply(event)
    this._version++
  }

  /** 具象集約が実装する状態遷移（副作用なし）。 */
  protected abstract apply(event: E): void
}
