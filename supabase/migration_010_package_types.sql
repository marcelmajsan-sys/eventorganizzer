-- Dinamičke kategorije partnera
CREATE TABLE IF NOT EXISTS package_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO package_types (name, sort_order) VALUES
  ('Glavni', 1), ('Zlatni', 2), ('Srebrni', 3),
  ('Brončani', 4), ('Medijski', 5), ('Community', 6)
ON CONFLICT (name) DO NOTHING;

-- Ukloni hardkodirani CHECK constraint
ALTER TABLE sponsors DROP CONSTRAINT IF EXISTS sponsors_package_type_check;
