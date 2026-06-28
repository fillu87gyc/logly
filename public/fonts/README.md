# Bundled fonts

このディレクトリのフォントは外部 CDN 依存を切るために同梱している。
すべて Apache License 2.0 の条件下で再配布する。

## Material Icons (`material-icons-outlined.woff2`, `material-icons-round.woff2`)

- Source: [google/material-design-icons](https://github.com/google/material-design-icons)
  （`fonts.gstatic.com` 経由で配信されている WOFF2 をそのまま取得）
- Copyright (c) Google Inc.
- License: Apache License 2.0
- 配布元のライセンス全文は [`LICENSE.txt`](./LICENSE.txt) を参照

## なぜ自己ホストか

- `fonts.googleapis.com/icon?family=Material+Icons+...` への到達が失敗した環境
  でアイコンが**リテラル文字**（"add"、"close" …）として描画される事故を防ぐため。
- PWA としてのオフライン挙動を素直にするため（Service Worker のプリキャッシュに含まれる）。
- ピクセル単位の視覚リグレッションテスト（`tests/e2e/navigation/visual.spec.ts`）
  の baseline を CI / 本番 / 開発のあいだで安定化するため。

## 更新方法

Material Icons はあまりリビジョンが進まないが、もし新版に追従したい場合:

```bash
# 1. 最新の WOFF2 を取得（モダンブラウザの UA を渡すと WOFF2 を返す）
UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
CSS=$(curl -sS -A "$UA" "https://fonts.googleapis.com/icon?family=Material+Icons+Outlined|Material+Icons+Round")
echo "$CSS" | grep -oE 'https://fonts.gstatic.com/[^)]+\.woff2'

# 2. それぞれ public/fonts/material-icons-{outlined,round}.woff2 に保存

# 3. LICENSE.txt も最新を取得
curl -sSL https://raw.githubusercontent.com/google/material-design-icons/master/LICENSE -o public/fonts/LICENSE.txt

# 4. ベースラインを再生成（CI に投げる: コミットメッセージに [update-visual]）
```
