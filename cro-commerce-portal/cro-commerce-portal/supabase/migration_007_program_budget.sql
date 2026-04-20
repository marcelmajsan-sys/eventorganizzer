-- Program sessions
CREATE TABLE IF NOT EXISTS program_sessions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  time_start   TEXT NOT NULL,
  time_end     TEXT NOT NULL,
  stage        TEXT NOT NULL DEFAULT 'future'
               CHECK (stage IN ('future', 'action', 'wonderland', 'all')),
  speaker_name TEXT,
  topic        TEXT NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'talk'
               CHECK (session_type IN ('talk', 'panel', 'fireside', 'keynote', 'break', 'networking')),
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_program_sessions_sort ON program_sessions(time_start, sort_order);

-- Budget items
CREATE TABLE IF NOT EXISTS budget_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category   TEXT NOT NULL,
  vendor     TEXT,
  amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
  status     TEXT NOT NULL DEFAULT 'pending'
             CHECK (status IN ('pending', 'paid', 'cancelled')),
  notes      TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budget_items_sort ON budget_items(sort_order, created_at);
