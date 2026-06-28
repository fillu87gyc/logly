import { defineWorkersConfig, readD1Migrations } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersConfig(async () => {
  // マイグレーションを読み込み、テスト用 D1 に適用できるようバインドする。
  const migrations = await readD1Migrations('./migrations')

  return {
    test: {
      setupFiles: ['./test/apply-migrations.ts'],
      poolOptions: {
        workers: {
          wrangler: { configPath: './wrangler.toml' },
          miniflare: {
            // ENV=dev で Access 認証をバイパスする。
            bindings: {
              ENV: 'dev',
              ACCESS_TEAM_DOMAIN: 'test.cloudflareaccess.com',
              ACCESS_AUD: 'test-aud',
              ALLOWED_EMAIL: 'tester@example.com',
              TEST_MIGRATIONS: migrations,
            },
          },
        },
      },
    },
  }
})
