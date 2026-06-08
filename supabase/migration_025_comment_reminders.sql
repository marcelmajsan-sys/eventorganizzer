-- migration_025: follow up podsjetnici za komentare
-- Pokreni u oba projekta (2025 i 2026)

CREATE TABLE IF NOT EXISTS sponsor_comment_reminders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id  UUID REFERENCES sponsors(id) ON DELETE CASCADE,
  comment_id  UUID REFERENCES sponsor_comments(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  admin_email  TEXT NOT NULL,
  remind_at    DATE NOT NULL,
  sent         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scr_unsent ON sponsor_comment_reminders (remind_at) WHERE sent = FALSE;
