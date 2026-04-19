CREATE TABLE IF NOT EXISTS sponsor_contacts (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  email      TEXT,
  phone      TEXT,
  role       TEXT,
  type       TEXT NOT NULL DEFAULT 'contact' CHECK (type IN ('contact', 'ticket')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sponsor_contacts_sponsor ON sponsor_contacts(sponsor_id);
