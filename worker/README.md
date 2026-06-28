# logly-api （Cloudflare Workers バックエンド）

ライフログ `logly` のバックエンド。**DDD + 厳密な CQRS + イベントソーシング**で実装し、
永続化は **Cloudflare D1**、認証は **Cloudflare Access** に委譲する（利用者は本人 1 人）。

設計の詳細は [`../docs/design/backend.md`](../docs/design/backend.md) と
[`../docs/design/roadmap.md`](../docs/design/roadmap.md) を参照。

## レイヤ構成

```
src/
  domain/          # 集約(Entry)・値オブジェクト・ドメインイベント・ES 基盤（Cloudflare 非依存）
  application/     # コマンド/クエリ ハンドラ、プロジェクション、ポート
  infrastructure/  # D1 実装（Event Store + 読み取りモデル投影 + クエリ）
  interface/http/  # Hono ルート・DTO(Zod)・エラー・Access 認証ミドルウェア
  index.ts         # composition root
```

- 書き込み: コマンド → 集約をイベントから再構築 → 検証 → **イベント追記と読み取りモデル投影を
  同一 `D1.batch()` で原子的に適用**（`infrastructure/d1/D1Store.ts`）。
- 読み取り: 読み取りモデル（`rm_entries` / `rm_daily_category`）を直接 SELECT（ドメイン非経由）。
- 楽観ロック: `events` の `UNIQUE(aggregate_id, version)`。競合は HTTP 409。

## セットアップ

```bash
cd worker
npm install

# D1 を作成し、出力された database_id を wrangler.toml に反映する
npx wrangler d1 create logly

# マイグレーション適用（ローカル / 本番）
npm run migrate:local
npm run migrate:remote
```

## 開発・テスト

```bash
npm run dev          # wrangler dev（ローカル）。ENV=dev は Access 認証をバイパス
npm test             # vitest（ドメインユニット + vitest-pool-workers 結合テスト）
npm run typecheck    # tsc --noEmit
```

結合テストは実 D1（miniflare）に対し「イベント追記 → 同期投影 → クエリ」「編集の日付移動」
「削除」「version 競合 409」などを検証する（`test/integration/api.test.ts`）。

## API（§7）

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/api/health` | ヘルスチェック（認証不要） |
| POST | `/api/entries` | 作成 → `201 {id}` |
| PUT | `/api/entries/:id` | 編集（`?expectedVersion=` 任意） |
| DELETE | `/api/entries/:id` | 削除（`?expectedVersion=` 任意） |
| GET | `/api/entries?date=YYYY-MM-DD` | 日別一覧 |
| GET | `/api/entries?from=&to=` | 期間一覧 |
| GET | `/api/stats?range=w\|m\|y&date=` | 統計 |
| GET | `/api/categories` | 固定カテゴリ参照 |

## 認証（Cloudflare Access）

1. Access アプリケーションを作成し、保護対象に Worker（および Pages）を指定。
2. ポリシーで許可を**自分の email 1 件のみ**に限定。
3. `wrangler.toml` の `vars` を設定:
   - `ACCESS_TEAM_DOMAIN`（例 `your-team.cloudflareaccess.com`）
   - `ACCESS_AUD`（Access アプリの Application Audience タグ）
   - `ALLOWED_EMAIL`（許可する唯一の email）
   - `ENV`（本番は `production`。`dev` は認証バイパス）

Worker は `Cf-Access-Jwt-Assertion` を JWKS（`/cdn-cgi/access/certs`）で検証し、
署名・`aud`・発行者・`email` を確認する（`src/interface/http/middleware/access.ts`）。

## スコープ外（将来拡張・§12）

AI 自動整形 / カテゴリ編集 / リマインダー / 複数ユーザー / 非同期プロジェクション(Queues)。
