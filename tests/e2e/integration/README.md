# Integration E2E

このディレクトリのテストは「ブラウザ → Vite preview/dev → fetch → 実 Worker
（wrangler dev）→ D1（miniflare）→ 投影 → クエリ → SPA 再描画」までの**フルスタック**
を一切モックせずに通す。

- 設定: ルートの `playwright.integration.config.ts`
- 実行: `npm run test:e2e:integration`
- 起動構成（Playwright `webServer` で 2 つ並列起動）
  - **wrangler dev** at `127.0.0.1:8788`（ENV=dev / Access バイパス、起動前に D1 マイグレーション）
  - **vite dev/preview** at `127.0.0.1:4174`（`VITE_API_BASE=http://127.0.0.1:8788` で実 API へ）
- DB 分離: シナリオごとに**ユニークな業務日付**（2030-06-15 / 07-15 / 08-15 …）を用いる。
  事前リセットや test-only エンドポイントを設けず、runn と同じ流儀でアイソレートする。

## 何を保証するか

`runn` 側が API の振る舞いを HTTP 単体で網羅するのに対し、ここでは
「SPA の状態と API の状態が一致するか」を駆動から検証する。

- AddModal 経由で作成 → タイムラインに反映 → 実 D1 にイベントが残る
- DetailModal で編集・削除 → 実 D1 の version / event_type が進む
- Stats タブ → 実 API の集計を描画する
