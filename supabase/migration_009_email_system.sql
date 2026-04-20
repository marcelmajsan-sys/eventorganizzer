-- Migration 009: Email sustav — predlošci, automatizacije, logovi

-- Email predlošci
CREATE TABLE IF NOT EXISTS email_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  subject     TEXT NOT NULL,
  body        TEXT NOT NULL,
  button_text TEXT,
  button_url  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email automatizacije
CREATE TABLE IF NOT EXISTS email_automations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  trigger_type   TEXT NOT NULL DEFAULT 'benefit_deadline',
  days_before    INT  NOT NULL DEFAULT 7,
  template_id    UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  custom_subject TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email logovi (za deduplication i tracking)
CREATE TABLE IF NOT EXISTS email_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id  UUID REFERENCES email_automations(id) ON DELETE SET NULL,
  benefit_id     UUID,
  recipient      TEXT NOT NULL,
  subject        TEXT NOT NULL,
  sent_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status         TEXT NOT NULL DEFAULT 'sent',
  error_message  TEXT
);

-- Dodaj reminder_email na sponsor_benefits
ALTER TABLE sponsor_benefits
  ADD COLUMN IF NOT EXISTS reminder_email TEXT;

-- Indeksi za brže upite
CREATE INDEX IF NOT EXISTS idx_email_logs_benefit_id    ON email_logs(benefit_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_automation_id ON email_logs(automation_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at       ON email_logs(sent_at);
