-- migration_017_enable_rls_all_tables.sql
-- Uključuje Row Level Security na sve public tablice koje je nemaju
-- i dodaje politike koje održavaju trenutno ponašanje aplikacije.
--
-- Sigurno za ponovno pokretanje (idempotentno): svaka politika ima DROP IF EXISTS.
-- Pokreni cijelo u Supabase SQL Editoru kao jedan query.
--
-- VAŽNO: NE dira sponsor_contacts i sponsor_users — njih su riješile
-- migration_013 i migration_015. Promjena ovdje bi razbila partner pristup.

BEGIN;

-- =============================================================================
-- HELPER: provjera je li trenutni korisnik admin
-- =============================================================================
-- SECURITY DEFINER da izbjegnemo rekurziju kad politika na project_admins
-- treba čitati project_admins. STABLE da Postgres može keširati rezultat
-- unutar iste query-je. Wrappiran auth.uid() u (SELECT ...) je Supabase
-- preporučeni performance pattern.

CREATE OR REPLACE FUNCTION public.is_project_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_admins pa
    WHERE pa.email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_project_admin() TO authenticated;

-- =============================================================================
-- project_admins — self-check SELECT only
-- =============================================================================
-- Svaki authenticated user može pročitati svoj vlastiti redak (da app može
-- provjeriti "jesam li ja admin"). INSERT/UPDATE/DELETE ide isključivo preko
-- service role klijenta u userManagement.ts server actionu.

ALTER TABLE public.project_admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "self_check_admin" ON public.project_admins;
CREATE POLICY "self_check_admin" ON public.project_admins
  FOR SELECT TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid())));

-- =============================================================================
-- GRUPA A — samo admin (čisto admin panel)
-- =============================================================================

-- tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_all_tasks" ON public.tasks;
CREATE POLICY "admin_all_tasks" ON public.tasks
  FOR ALL TO authenticated
  USING (public.is_project_admin())
  WITH CHECK (public.is_project_admin());

-- notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_all_notifications" ON public.notifications;
CREATE POLICY "admin_all_notifications" ON public.notifications
  FOR ALL TO authenticated
  USING (public.is_project_admin())
  WITH CHECK (public.is_project_admin());

-- packages
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_all_packages" ON public.packages;
CREATE POLICY "admin_all_packages" ON public.packages
  FOR ALL TO authenticated
  USING (public.is_project_admin())
  WITH CHECK (public.is_project_admin());

-- package_types (kategorije paketa za PackageTypeManager)
ALTER TABLE public.package_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_all_package_types" ON public.package_types;
CREATE POLICY "admin_all_package_types" ON public.package_types
  FOR ALL TO authenticated
  USING (public.is_project_admin())
  WITH CHECK (public.is_project_admin());

-- project_settings
ALTER TABLE public.project_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_all_project_settings" ON public.project_settings;
CREATE POLICY "admin_all_project_settings" ON public.project_settings
  FOR ALL TO authenticated
  USING (public.is_project_admin())
  WITH CHECK (public.is_project_admin());

-- budget_items
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_all_budget_items" ON public.budget_items;
CREATE POLICY "admin_all_budget_items" ON public.budget_items
  FOR ALL TO authenticated
  USING (public.is_project_admin())
  WITH CHECK (public.is_project_admin());

-- email_templates
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_all_email_templates" ON public.email_templates;
CREATE POLICY "admin_all_email_templates" ON public.email_templates
  FOR ALL TO authenticated
  USING (public.is_project_admin())
  WITH CHECK (public.is_project_admin());

-- email_automations
ALTER TABLE public.email_automations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_all_email_automations" ON public.email_automations;
CREATE POLICY "admin_all_email_automations" ON public.email_automations
  FOR ALL TO authenticated
  USING (public.is_project_admin())
  WITH CHECK (public.is_project_admin());

-- email_logs
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_all_email_logs" ON public.email_logs;
CREATE POLICY "admin_all_email_logs" ON public.email_logs
  FOR ALL TO authenticated
  USING (public.is_project_admin())
  WITH CHECK (public.is_project_admin());

-- =============================================================================
-- GRUPA B — admin full + partner SELECT vlastitog sponzora
-- =============================================================================
-- Partner UPDATE/INSERT/DELETE na sponsors/files ne postoji u trenutnoj
-- aplikaciji (updatePrimaryContact ide preko admin klijenta). Ako jednog
-- dana zatreba — doda se posebna politika.

-- sponsors
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_sponsors" ON public.sponsors;
CREATE POLICY "admin_all_sponsors" ON public.sponsors
  FOR ALL TO authenticated
  USING (public.is_project_admin())
  WITH CHECK (public.is_project_admin());

DROP POLICY IF EXISTS "partner_read_own_sponsor" ON public.sponsors;
CREATE POLICY "partner_read_own_sponsor" ON public.sponsors
  FOR SELECT TO authenticated
  USING (id = public.get_my_sponsor_id());

-- sponsor_benefits
ALTER TABLE public.sponsor_benefits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_benefits" ON public.sponsor_benefits;
CREATE POLICY "admin_all_benefits" ON public.sponsor_benefits
  FOR ALL TO authenticated
  USING (public.is_project_admin())
  WITH CHECK (public.is_project_admin());

DROP POLICY IF EXISTS "partner_read_own_benefits" ON public.sponsor_benefits;
CREATE POLICY "partner_read_own_benefits" ON public.sponsor_benefits
  FOR SELECT TO authenticated
  USING (sponsor_id = public.get_my_sponsor_id());

-- files
-- Pretpostavka: files tablica ima sponsor_id kolonu. Ako kolona ima
-- drugačiji naziv, zamijeni u USING klauzuli ispod.
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_files" ON public.files;
CREATE POLICY "admin_all_files" ON public.files
  FOR ALL TO authenticated
  USING (public.is_project_admin())
  WITH CHECK (public.is_project_admin());

DROP POLICY IF EXISTS "partner_read_own_files" ON public.files;
CREATE POLICY "partner_read_own_files" ON public.files
  FOR SELECT TO authenticated
  USING (sponsor_id = public.get_my_sponsor_id());

-- =============================================================================
-- GRUPA C — admin full + svi authenticated SELECT (program je javan unutar app-a)
-- =============================================================================

-- program_sessions
ALTER TABLE public.program_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_program" ON public.program_sessions;
CREATE POLICY "admin_all_program" ON public.program_sessions
  FOR ALL TO authenticated
  USING (public.is_project_admin())
  WITH CHECK (public.is_project_admin());

DROP POLICY IF EXISTS "authenticated_read_program" ON public.program_sessions;
CREATE POLICY "authenticated_read_program" ON public.program_sessions
  FOR SELECT TO authenticated
  USING (true);

COMMIT;

-- =============================================================================
-- VERIFIKACIJA — pokreni odvojeno nakon migracije
-- =============================================================================
-- Sve tablice u public shemi trebaju imati rowsecurity = true:
--
--   SELECT tablename, rowsecurity FROM pg_tables
--   WHERE schemaname = 'public' ORDER BY rowsecurity, tablename;
--
-- Pregled svih politika:
--
--   SELECT tablename, policyname, cmd, roles FROM pg_policies
--   WHERE schemaname = 'public' ORDER BY tablename, policyname;