-- Event Store（追記専用・イミュータブル）
-- 設計書 §5.1 に対応。
CREATE TABLE IF NOT EXISTS events (
  sequence       INTEGER PRIMARY KEY AUTOINCREMENT, -- グローバル追記順
  aggregate_id   TEXT    NOT NULL,
  aggregate_type TEXT    NOT NULL,                   -- 'Entry'
  version        INTEGER NOT NULL,                   -- 集約内バージョン (1,2,3..)
  event_type     TEXT    NOT NULL,                   -- 'EntryLogged' 等
  payload        TEXT    NOT NULL,                   -- JSON
  occurred_at    TEXT    NOT NULL,                   -- ISO8601（業務時刻）
  recorded_at    TEXT    NOT NULL,                   -- ISO8601（記録時刻）
  actor          TEXT,                               -- 記録者 email（1 人用は固定）
  UNIQUE (aggregate_id, version)                     -- 楽観ロック
);

CREATE INDEX IF NOT EXISTS idx_events_aggregate ON events (aggregate_id, version);
