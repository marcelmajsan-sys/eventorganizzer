-- Migration 029: Per-user read status za notifikacije
-- Zamjenjuje dijeljeni boolean `read` s tablicom notification_reads per korisnik

CREATE TABLE IF NOT EXISTS notification_reads (
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL,
  read_at         TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (notification_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_reads_user_id
  ON notification_reads(user_id);

ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;

-- Svaki korisnik upravlja samo vlastitim zapisima
CREATE POLICY "authenticated_own_reads" ON notification_reads
  FOR ALL TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
