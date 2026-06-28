-- 読み取りモデル（イベントから投影されるクエリ最適化テーブル）
-- 設計書 §6.1 に対応。

-- 日別一覧用にフラット化した Entry
CREATE TABLE IF NOT EXISTS rm_entries (
  id          TEXT PRIMARY KEY,
  occurred_at TEXT NOT NULL,                  -- ISO8601
  date        TEXT NOT NULL,                  -- 'YYYY-MM-DD'（検索キー）
  category    TEXT NOT NULL,
  title       TEXT NOT NULL,
  note        TEXT,
  meta        TEXT NOT NULL DEFAULT '[]'      -- JSON: MetaItem[]
);

CREATE INDEX IF NOT EXISTS idx_rm_entries_date ON rm_entries (date);

-- 日次×カテゴリ集計（統計・カレンダードット用）
CREATE TABLE IF NOT EXISTS rm_daily_category (
  date     TEXT NOT NULL,
  category TEXT NOT NULL,
  count    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (date, category)
);
