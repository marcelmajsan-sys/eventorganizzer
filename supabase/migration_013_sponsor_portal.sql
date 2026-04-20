-- Migration 013: Sponsor portal — sponsor_users tablica + ažurirani RLS

-- Tablica koja veže Supabase Auth usera na sponzora
CREATE TABLE IF NOT EXISTS sponsor_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sponsor_id  UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  invited_by  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_sponsor_users_user_id     ON sponsor_users(user_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_users_sponsor_id  ON sponsor_users(sponsor_id);

ALTER TABLE sponsor_users ENABLE ROW LEVEL SECURITY;

-- Sponzor može vidjeti samo vlastiti red
CREATE POLICY "sponsor_users_own_select" ON sponsor_users
  FOR SELECT USING (user_id = auth.uid());

-- ─── Ažurirane DB funkcije ───────────────────────────────────────────────────

-- is_admin() — koristi project_admins tablicu umjesto hardkodiranih emailova
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_admins WHERE email = auth.email()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- get_my_sponsor_id() — via sponsor_users, ne via contact_email
CREATE OR REPLACE FUNCTION get_my_sponsor_id()
RETURNS UUID AS $$
  SELECT sponsor_id FROM sponsor_users WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- is_sponsor() — helper za RLS policyje
CREATE OR REPLACE FUNCTION is_sponsor()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM sponsor_users WHERE user_id = auth.uid());
$$ LANGUAGE sql SECURITY DEFINER;

-- ─── RLS policyji za sponsor_benefits ────────────────────────────────────────

-- Sponzor može čitati vlastite benefite
DROP POLICY IF EXISTS "benefits_own_select" ON sponsor_benefits;
CREATE POLICY "benefits_own_select" ON sponsor_benefits
  FOR SELECT USING (
    sponsor_id = get_my_sponsor_id()
    OR is_admin()
  );

-- Sponzor može mijenjati SAMO status, notes, assigned_to na vlastitim benefitima
DROP POLICY IF EXISTS "benefits_sponsor_update" ON sponsor_benefits;
CREATE POLICY "benefits_sponsor_update" ON sponsor_benefits
  FOR UPDATE
  USING (sponsor_id = get_my_sponsor_id())
  WITH CHECK (sponsor_id = get_my_sponsor_id());

-- ─── RLS policyji za tasks ────────────────────────────────────────────────────

-- Sponzor može čitati zadatke koji su vezani za njegov sponsor_id
DROP POLICY IF EXISTS "tasks_admin_all" ON tasks;
CREATE POLICY "tasks_admin_all" ON tasks
  FOR ALL USING (is_admin());

CREATE POLICY "tasks_sponsor_select" ON tasks
  FOR SELECT USING (sponsor_id = get_my_sponsor_id());

-- ─── RLS policy za sponsors ───────────────────────────────────────────────────

DROP POLICY IF EXISTS "sponsors_own_select" ON sponsors;
CREATE POLICY "sponsors_own_select" ON sponsors
  FOR SELECT USING (
    id = get_my_sponsor_id()
    OR is_admin()
  );
