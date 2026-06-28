/** ドメイン/アプリケーションで用いる基底エラー群。HTTP 層で適切なステータスに変換する。 */

/** 不変条件違反・入力不正（→ 400） */
export class DomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DomainError'
  }
}

/** 対象集約が存在しない（→ 404） */
export class NotFoundError extends Error {
  constructor(message = 'not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

/** 楽観ロック競合（version 不一致 / UNIQUE 違反）（→ 409） */
export class VersionConflictError extends Error {
  constructor(message = 'version conflict') {
    super(message)
    this.name = 'VersionConflictError'
  }
}
