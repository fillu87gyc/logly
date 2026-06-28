/**
 * Worker の実行環境バインディング。
 * - `DB`: Cloudflare D1（Event Store + Read Model）
 * - `ACCESS_*`: Cloudflare Access の JWT 検証に使う設定
 * - `ALLOWED_EMAIL`: 唯一の所有者（1 人用）。これ以外の email は 401。
 * - `ENV`: `dev` のときは Access 認証をバイパスする。
 */
export interface Env {
  DB: D1Database
  ENV: string
  ACCESS_TEAM_DOMAIN: string
  ACCESS_AUD: string
  ALLOWED_EMAIL: string
}
