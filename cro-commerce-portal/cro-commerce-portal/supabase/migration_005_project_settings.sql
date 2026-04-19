-- Run in Supabase SQL Editor.
-- Works whether both projects share one database or each has its own.

CREATE TABLE IF NOT EXISTS project_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Each project has its own keyed row so they never overwrite each other.
INSERT INTO project_settings (key, value) VALUES
  ('conference_date_2026', '2026-10-13'),
  ('conference_date_2025', '2025-06-10')
ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_admins (
  email      TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO project_admins (email) VALUES
  ('marcel@ecommerce.hr'),
  ('udruga@ecommerce.hr'),
  ('laura@ecommerce.hr')
ON CONFLICT (email) DO NOTHING;
