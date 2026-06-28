import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'
import type { Context, MiddlewareHandler } from 'hono'
import type { Env } from '../../../env'
import { UnauthenticatedError } from '../errors'

type Vars = { actor: string }
type AppContext = Context<{ Bindings: Env; Variables: Vars }>

// team domain ごとに JWKS をキャッシュする（リクエスト跨ぎで再利用）。
const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>()

function getJwks(teamDomain: string): ReturnType<typeof createRemoteJWKSet> {
  let jwks = jwksCache.get(teamDomain)
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`https://${teamDomain}/cdn-cgi/access/certs`))
    jwksCache.set(teamDomain, jwks)
  }
  return jwks
}

/**
 * Cloudflare Access の JWT を検証するミドルウェア。
 * - `ENV=dev` のときは検証をバイパスし、ALLOWED_EMAIL を actor として通す。
 * - 本番では `Cf-Access-Jwt-Assertion` を JWKS で検証し、
 *   署名・aud・iss・email（1 件固定）を確認する。
 */
export const accessMiddleware: MiddlewareHandler<{ Bindings: Env; Variables: Vars }> = async (
  c,
  next,
) => {
  const env = c.env

  if (env.ENV === 'dev') {
    c.set('actor', env.ALLOWED_EMAIL)
    await next()
    return
  }

  const token = c.req.header('Cf-Access-Jwt-Assertion')
  if (!token) throw new UnauthenticatedError('missing Access JWT')

  let payload: JWTPayload
  try {
    const result = await jwtVerify(token, getJwks(env.ACCESS_TEAM_DOMAIN), {
      issuer: `https://${env.ACCESS_TEAM_DOMAIN}`,
      audience: env.ACCESS_AUD,
    })
    payload = result.payload
  } catch {
    throw new UnauthenticatedError('invalid Access JWT')
  }

  const email = typeof payload.email === 'string' ? payload.email : undefined
  if (!email || email !== env.ALLOWED_EMAIL) {
    throw new UnauthenticatedError('email not allowed')
  }

  c.set('actor', email)
  await next()
}

export type { AppContext }
