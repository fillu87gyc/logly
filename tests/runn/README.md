# runn 外部プロセス API テスト

`worker/` を `wrangler dev --local` で実プロセスとして起動し、HTTP 経由で
[runn](https://github.com/k1LoW/runn) シナリオを実行する。in-process な vitest
（`worker/test/integration`）に対し、ここでは Workers ランタイム + miniflare D1 +
Hono ルーティング全体を実バイナリで通す。

## 前提

- Node.js 22
- `cd worker && npm ci`
- `runn` バイナリ（`go install github.com/k1LoW/runn/cmd/runn@latest`、または
  GitHub Releases）

## ローカル実行

```bash
# 1) ローカル D1 にマイグレーションを当てる（初回 & スキーマ更新時）
cd worker && npx wrangler d1 migrations apply logly --local

# 2) 別ターミナルで worker を起動
cd worker && npx wrangler dev --local --port 8787

# 3) シナリオを実行
runn run tests/runn/scenarios/**/*.yml --verbose
```

CI では同等手順を 1 ジョブで自動化している（`.github/workflows/ci.yml` の
`runn` ジョブ）。

## シナリオ設計

`worker/test/integration/api.test.ts` が同じ振る舞いを in-process でカバーする
ため、ここでは「外部プロセスとして起動した Worker が HTTP で正しく応答するか」
にフォーカスする。

- `scenarios/health.yml` — 認証不要のヘルスチェック
- `scenarios/categories.yml` — マスタ参照
- `scenarios/entries-lifecycle.yml` — 作成 → 一覧 → 編集 → 削除のフルフロー
- `scenarios/version-conflict.yml` — 楽観ロック 409
- `scenarios/validation.yml` — Zod / DomainError 由来の 400・404
- `scenarios/stats.yml` — 週次・月次集計

シナリオ間の DB 分離は「ユニークな業務日付」で行う。同じ DB に複数シナリオの
イベントが残るが、各テストは date を絞ったクエリで他の影響を受けない。

## ENV=dev による認証バイパス

`worker/wrangler.toml` の `[vars] ENV = "production"` を CI では `--var
ENV:dev` で上書きするか、`.dev.vars` で `ENV=dev` を設定する。これにより
Cloudflare Access のミドルウェアがバイパスされ、ローカルテストが通る。
