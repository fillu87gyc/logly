import type { Context } from 'hono'
import { ZodError } from 'zod'
import { DomainError, NotFoundError, VersionConflictError } from '../../domain/shared/errors'

export interface ErrorBody {
  error: { code: string; message: string }
}

export class UnauthenticatedError extends Error {
  constructor(message = 'unauthenticated') {
    super(message)
    this.name = 'UnauthenticatedError'
  }
}

/** ドメイン/アプリのエラーを HTTP レスポンスへ変換する。 */
export function toErrorResponse(c: Context, err: unknown): Response {
  if (err instanceof ZodError) {
    const first = err.errors[0]
    const where = first?.path.join('.') ?? ''
    return json(c, 400, 'VALIDATION_FAILED', `${where ? `${where}: ` : ''}${first?.message ?? 'invalid input'}`)
  }
  if (err instanceof DomainError) {
    return json(c, 400, 'VALIDATION_FAILED', err.message)
  }
  if (err instanceof UnauthenticatedError) {
    return json(c, 401, 'UNAUTHENTICATED', err.message)
  }
  if (err instanceof NotFoundError) {
    return json(c, 404, 'NOT_FOUND', err.message)
  }
  if (err instanceof VersionConflictError) {
    return json(c, 409, 'VERSION_CONFLICT', err.message)
  }
  console.error('unhandled error', err)
  return json(c, 500, 'INTERNAL', 'internal server error')
}

function json(c: Context, status: number, code: string, message: string): Response {
  const body: ErrorBody = { error: { code, message } }
  return c.json(body, status as 400 | 401 | 404 | 409 | 500)
}
