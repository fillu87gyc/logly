import { applyD1Migrations, env } from 'cloudflare:test'

// 各テストワーカー起動時に、読み込んだマイグレーションをテスト用 D1 に適用する。
await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)
