import type { Env } from './env'
import { createApp } from './interface/http/router'

/**
 * Worker のエントリポイント（composition root）。
 * Hono アプリを生成して fetch を委譲する。
 */
const app = createApp()

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Response | Promise<Response> {
    return app.fetch(request, env, ctx)
  },
}
