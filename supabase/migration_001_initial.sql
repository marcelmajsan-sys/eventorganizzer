-- ============================================================
-- CRO Commerce Sponzorski Portal — Supabase Migration
-- Verzija: 1.0.0
-- Pokrenite u: Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLICE
-- ============================================================

-- Paketi sponzorstva
CREATE TABLE IF NOT EXISTS packages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  price       INTEGER NOT NULL DEFAULT 0,
  benefits    JSONB NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sponzori
CREATE TABLE IF NOT EXISTS sponsors (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  package_type    TEXT NOT NULL CHECK (package_type IN ('Glavni', 'Zlatni', 'Srebrni', 'Brončani')),
  contact_email   TEXT NOT NULL,
  contact_name    TEXT NOT NULL,
  payment_status  TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'overdue')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Benefiti sponzora
CREATE TABLE IF NOT EXISTS sponsor_benefits (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sponsor_id    UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  benefit_name  TEXT NOT NULL,
  deadline      TIMESTAMPTZ NOT NULL,
  status        TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'overdue')),
  file_url      TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Zadaci
CREATE TABLE IF NOT EXISTS tasks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sponsor_id    UUID REFERENCES sponsors(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  due_date      DATE,
  assigned_to   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Datoteke
CREATE TABLE IF NOT EXISTS files (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sponsor_id    UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  benefit_id    UUID REFERENCES sponsor_benefits(id) ON DELETE SET NULL,
  filename      TEXT NOT NULL,
  storage_url   TEXT NOT NULL,
  file_size     BIGINT,
  mime_type     TEXT,
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Obavijesti
CREATE TABLE IF NOT EXISTS notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sponsor_id    UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  message       TEXT NOT NULL,
  read          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEKSI
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_sponsors_package_type    ON sponsors(package_type);
CREATE INDEX IF NOT EXISTS idx_sponsors_payment_status  ON sponsors(payment_status);
CREATE INDEX IF NOT EXISTS idx_sponsor_benefits_sponsor ON sponsor_benefits(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_benefits_status  ON sponsor_benefits(status);
CREATE INDEX IF NOT EXISTS idx_sponsor_benefits_deadline ON sponsor_benefits(deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_status             ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_sponsor            ON tasks(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_files_sponsor            ON files(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sponsor    ON notifications(sponsor_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE sponsors           ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_benefits   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks               ENABLE ROW LEVEL SECURITY;
ALTER TABLE files               ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;

-- Admin email lista
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT email IN ('marcel@cro-commerce.hr', 'dino@cro-commerce.hr', 'goran@cro-commerce.hr')
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sponzor može vidjeti samo svoje podatke
CREATE OR REPLACE FUNCTION get_my_sponsor_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id FROM sponsors
    WHERE contact_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paketi: čitanje za sve autentificirane
CREATE POLICY "packages_read_all" ON packages
  FOR SELECT USING (auth.role() = 'authenticated');

-- Sponzori: admin sve vidi, sponzor samo svoje
CREATE POLICY "sponsors_admin_all" ON sponsors
  FOR ALL USING (is_admin());

CREATE POLICY "sponsors_own_select" ON sponsors
  FOR SELECT USING (contact_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Benefiti: admin sve, sponzor samo svoje
CREATE POLICY "benefits_admin_all" ON sponsor_benefits
  FOR ALL USING (is_admin());

CREATE POLICY "benefits_own_select" ON sponsor_benefits
  FOR SELECT USING (sponsor_id = get_my_sponsor_id());

-- Zadaci: samo admin
CREATE POLICY "tasks_admin_all" ON tasks
  FOR ALL USING (is_admin());

-- Datoteke: admin sve, sponzor samo svoje
CREATE POLICY "files_admin_all" ON files
  FOR ALL USING (is_admin());

CREATE POLICY "files_own_all" ON files
  FOR ALL USING (sponsor_id = get_my_sponsor_id());

-- Obavijesti: admin sve, sponzor samo svoje
CREATE POLICY "notifications_admin_all" ON notifications
  FOR ALL USING (is_admin());

CREATE POLICY "notifications_own_all" ON notifications
  FOR ALL USING (sponsor_id = get_my_sponsor_id());

-- ============================================================
-- SUPABASE STORAGE
-- ============================================================

-- Kreirajte bucket "sponsor-files" u Storage dashboardu
-- ili pokrenite:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('sponsor-files', 'sponsor-files', true);

-- Storage policies (pokrenite nakon kreiranja bucketa):
/*
CREATE POLICY "sponsor_files_admin_all" ON storage.objects
  FOR ALL USING (bucket_id = 'sponsor-files' AND is_admin());

CREATE POLICY "sponsor_files_own_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'sponsor-files' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = get_my_sponsor_id()::text
  );

CREATE POLICY "sponsor_files_own_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'sponsor-files' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = get_my_sponsor_id()::text
  );
*/

-- ============================================================
-- SEED: PAKETI
-- ============================================================

INSERT INTO packages (name, price, benefits) VALUES
(
  'Glavni',
  15000,
  '["Govor na glavnoj pozornici", "Podcast pozornica", "VIP štand (premium lokacija)", "Naslovnica konferencijskog magazina", "3 stranice oglasa u magazinu", "10 kotizacija"]'
),
(
  'Zlatni',
  8000,
  '["Govor ili panel diskusija", "Veliki izložbeni štand", "Oglas u konferencijskom magazinu", "8 kotizacija"]'
),
(
  'Srebrni',
  4500,
  '["Workshop predavanje", "Veliki izložbeni štand", "Branding u goodie bag-u", "Oglas u magazinu (manja veličina)", "5 kotizacija"]'
),
(
  'Brončani',
  2000,
  '["Mali izložbeni štand", "Branding u goodie bag-u", "3 kotizacije"]'
)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- SEED: SPONZORI (CRO Commerce 2025)
-- ============================================================

-- Helper: insert sponzora i automatski kreira benefite
DO $$
DECLARE
  v_id UUID;

  -- Datum konferencije: 10. lipnja 2026.
  conf_date TIMESTAMPTZ := '2026-06-10 00:00:00+00';

  -- Rokovi relativno od konferencije
  d_logo     TIMESTAMPTZ := conf_date - INTERVAL '4 months';  -- Feb 10
  d_mag      TIMESTAMPTZ := conf_date - INTERVAL '3 months';  -- Mar 10
  d_workshop TIMESTAMPTZ := conf_date - INTERVAL '2 months';  -- Apr 10
  d_prez     TIMESTAMPTZ := conf_date - INTERVAL '1 month';   -- May 10
  d_goodie   TIMESTAMPTZ := conf_date - INTERVAL '5 months';  -- Jan 10
  d_kotiz    TIMESTAMPTZ := conf_date - INTERVAL '6 weeks';   -- Apr 30

  -- Procedura
  PROCEDURE add_sponsor_with_benefits(
    p_name TEXT,
    p_pkg TEXT,
    p_email TEXT,
    p_contact TEXT,
    p_payment TEXT,
    p_notes TEXT DEFAULT NULL
  )
  LANGUAGE plpgsql
  AS $proc$
  DECLARE
    v_sid UUID;
  BEGIN
    INSERT INTO sponsors (name, package_type, contact_email, contact_name, payment_status, notes)
    VALUES (p_name, p_pkg, p_email, p_contact, p_payment, p_notes)
    RETURNING id INTO v_sid;

    -- Benefiti po paketu
    IF p_pkg = 'Glavni' THEN
      INSERT INTO sponsor_benefits (sponsor_id, benefit_name, deadline, status) VALUES
        (v_sid, 'Govor na glavnoj pozornici',         d_prez,     'not_started'),
        (v_sid, 'Podcast pozornica',                   d_prez,     'not_started'),
        (v_sid, 'VIP štand (premium lokacija)',         d_logo,     'not_started'),
        (v_sid, 'Naslovnica konferencijskog magazina',  d_mag,      'not_started'),
        (v_sid, '3 stranice oglasa u magazinu',         d_mag,      'not_started'),
        (v_sid, '10 kotizacija',                        d_kotiz,    'not_started'),
        (v_sid, 'Logo visokom rezolucijom (AI/SVG)',    d_logo,     'not_started');

    ELSIF p_pkg = 'Zlatni' THEN
      INSERT INTO sponsor_benefits (sponsor_id, benefit_name, deadline, status) VALUES
        (v_sid, 'Govor ili panel diskusija',          d_prez,     'not_started'),
        (v_sid, 'Veliki izložbeni štand',              d_logo,     'not_started'),
        (v_sid, 'Oglas u konferencijskom magazinu',    d_mag,      'not_started'),
        (v_sid, '8 kotizacija',                        d_kotiz,    'not_started'),
        (v_sid, 'Logo visokom rezolucijom (AI/SVG)',   d_logo,     'not_started');

    ELSIF p_pkg = 'Srebrni' THEN
      INSERT INTO sponsor_benefits (sponsor_id, benefit_name, deadline, status) VALUES
        (v_sid, 'Workshop predavanje',                d_workshop, 'not_started'),
        (v_sid, 'Veliki izložbeni štand',              d_logo,     'not_started'),
        (v_sid, 'Branding u goodie bag-u',             d_goodie,   'not_started'),
        (v_sid, 'Oglas u magazinu (manja veličina)',   d_mag,      'not_started'),
        (v_sid, '5 kotizacija',                        d_kotiz,    'not_started'),
        (v_sid, 'Logo visokom rezolucijom (AI/SVG)',   d_logo,     'not_started');

    ELSIF p_pkg = 'Brončani' THEN
      INSERT INTO sponsor_benefits (sponsor_id, benefit_name, deadline, status) VALUES
        (v_sid, 'Mali izložbeni štand',               d_logo,     'not_started'),
        (v_sid, 'Branding u goodie bag-u',             d_goodie,   'not_started'),
        (v_sid, '3 kotizacije',                        d_kotiz,    'not_started'),
        (v_sid, 'Logo visokom rezolucijom (AI/SVG)',   d_logo,     'not_started');
    END IF;
  END;
  $proc$;

BEGIN
  -- GLAVNI SPONZOR
  CALL add_sponsor_with_benefits(
    'Shipshape', 'Glavni',
    'marketing@shipshape.hr', 'Ana Kovačić', 'paid',
    'Glavni sponzor CRO Commerce 2025. Preferiraju early morning slot na glavnoj pozornici.'
  );

  -- ZLATNI SPONZORI
  CALL add_sponsor_with_benefits(
    'Monri Payments', 'Zlatni',
    'events@monri.com', 'Ivan Perić', 'paid'
  );

  CALL add_sponsor_with_benefits(
    'DPD Hrvatska', 'Zlatni',
    'marketing@dpd.hr', 'Marija Novak', 'pending'
  );

  CALL add_sponsor_with_benefits(
    'Aiployees', 'Zlatni',
    'hello@aiployees.com', 'Tomislav Blažević', 'paid'
  );

  -- SREBRNI SPONZORI
  CALL add_sponsor_with_benefits(
    'Vivnetworks', 'Srebrni',
    'partnerships@vivnetworks.com', 'Sara Jurić', 'paid'
  );

  CALL add_sponsor_with_benefits(
    'Decta', 'Srebrni',
    'marketing@decta.com', 'Luka Babić', 'pending'
  );

  CALL add_sponsor_with_benefits(
    'Inchoo', 'Srebrni',
    'events@inchoo.net', 'Petra Horvat', 'paid'
  );

  CALL add_sponsor_with_benefits(
    'Lesnina XXXL', 'Srebrni',
    'marketing@lesnina.hr', 'Damir Matić', 'overdue',
    'Podsjetiti na uplatu drugog obroka.'
  );

  CALL add_sponsor_with_benefits(
    'Marker', 'Srebrni',
    'info@marker.hr', 'Ivana Šimić', 'paid'
  );

  CALL add_sponsor_with_benefits(
    'Pickpack', 'Srebrni',
    'hello@pickpack.hr', 'Kristina Vuković', 'pending'
  );

  CALL add_sponsor_with_benefits(
    'Boxnow', 'Srebrni',
    'partnerships@boxnow.hr', 'Vedran Knežević', 'paid'
  );

  CALL add_sponsor_with_benefits(
    'Bind', 'Srebrni',
    'marketing@bind.hr', 'Nikolina Kralj', 'pending'
  );

  -- BRONČANI SPONZORI
  CALL add_sponsor_with_benefits(
    'Humana Nova', 'Brončani',
    'info@humananova.hr', 'Renata Ciglar', 'paid'
  );

  CALL add_sponsor_with_benefits(
    'Seyfor', 'Brončani',
    'marketing@seyfor.com', 'Borna Radić', 'pending'
  );

  CALL add_sponsor_with_benefits(
    'Lloyds Design', 'Brončani',
    'hello@lloyds.hr', 'Marina Filipović', 'paid'
  );

  CALL add_sponsor_with_benefits(
    'MBE Hrvatska', 'Brončani',
    'info@mbe.hr', 'Josip Tomić', 'paid'
  );

  CALL add_sponsor_with_benefits(
    'GLS Croatia', 'Brončani',
    'marketing@gls-croatia.hr', 'Tina Đurić', 'overdue'
  );

  CALL add_sponsor_with_benefits(
    'Goodwill', 'Brončani',
    'events@goodwill.hr', 'Ante Barišić', 'pending'
  );
END $$;

-- ============================================================
-- SEED: ZADACI (demo)
-- ============================================================

INSERT INTO tasks (title, description, status, due_date, assigned_to) VALUES
  ('Kreirati template za dobrodošlicu sponzorima', 'Email template za slanje pristupnih podataka portalu', 'done', '2025-11-15', 'Marcel'),
  ('Setup Supabase Storage bucketa', 'Konfigurirati sponsor-files bucket s odgovarajućim RLS politikama', 'done', '2025-11-20', 'Dino'),
  ('Kontaktirati sve sponzore s neplaćenim statusom', 'Poslati payment reminder za pending i overdue sponzore', 'in_progress', '2025-12-05', 'Goran'),
  ('Dizajn rasporeda štandova', 'Nacrt za postavljanje štandova prema paketu sponzorstva', 'in_progress', '2025-12-15', 'Marcel'),
  ('Prikupiti logotipe od svih Srebrnih sponzora', 'Logo u AI/SVG formatu za goodie bag i magazin', 'todo', '2026-01-10', 'Dino'),
  ('Dogovoriti teme workshopova', 'Koordinacija s Srebrnim sponzorima oko tema i termina', 'todo', '2026-01-20', 'Marcel'),
  ('Finalizirati sadržaj magazina', 'Prikupiti sve oglase i tekste za tisak', 'todo', '2026-03-10', 'Goran'),
  ('Briefing za keynote govornika', 'Slanje tehničkih uputa i timing-a govornicima', 'todo', '2026-04-01', 'Marcel');

-- ============================================================
-- GOTOVO!
-- ============================================================

-- Provjera:
SELECT
  (SELECT COUNT(*) FROM sponsors) AS ukupno_sponzora,
  (SELECT COUNT(*) FROM sponsor_benefits) AS ukupno_benefita,
  (SELECT COUNT(*) FROM tasks) AS ukupno_zadataka,
  (SELECT COUNT(*) FROM packages) AS ukupno_paketa;
