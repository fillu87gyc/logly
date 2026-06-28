/**
 * ドメインイベントの基底型。
 * イベントソーシングでは、集約の全状態変化をイベントとして表現する。
 */
export interface DomainEvent {
  /** イベント種別の判別子（例: 'EntryLogged'） */
  readonly type: string
  /** 対象集約の ID */
  readonly aggregateId: string
  /** 業務上の発生時刻（ISO8601） */
  readonly occurredAt: string
}

/**
 * Event Store に永続化されたイベント 1 件（メタ情報付き）。
 * `version` は集約内の連番（1 始まり）。`sequence` はグローバル追記順。
 */
export interface StoredEvent {
  readonly sequence: number
  readonly aggregateId: string
  readonly aggregateType: string
  readonly version: number
  readonly eventType: string
  readonly payload: string // JSON 文字列
  readonly occurredAt: string
  readonly recordedAt: string
  readonly actor: string | null
}
