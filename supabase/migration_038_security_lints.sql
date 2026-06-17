-- migration_038_security_lints.sql
-- Rješava Supabase database linter upozorenja:
--   0011 function_search_path_mutable          (9 funkcija)
--   0028 anon_security_definer_function_executable        (8 funkcija)
--   0029 authenticated_security_definer_function_executable (djelomično)
--   0025 public_bucket_allows_listing          (sponsor-files bucket)
--
-- Pokreni cijelo u Supabase SQL Editoru, ZA OBA PROJEKTA (2026 i 2025).
-- Idempotentno je — sigurno za ponovno pokretanje.
--
-- VAŽNO — zašto NE diramo authenticated EXECUTE na 4 helper funkcije:
--   public.is_admin(), public.is_project_admin(), public.get_my_sponsor_id(),
--   public.is_sponsor() pozivaju se UNUTAR RLS policy-ja za rolu `authenticated`
--   (migration_013, migration_017). Oduzimanje EXECUTE od `authenticated` srušilo
--   bi partnerski i admin pristup. Njihovo 0029 upozorenje ostaje NAMJERNO —
--   funkcije vraćaju samo podatke o pozivatelju (boolean / vlastiti sponsor_id),
--   pa nema curenja podataka.

BEGIN;

-- =============================================================================
-- 1) FUNCTION SEARCH PATH MUTABLE (lint 0011) — pin search_path na svim rutinama
-- =============================================================================
-- SET search_path = public, pg_temp je ne-lomljiv izbor: sve nekvalificirane
-- reference (public tablice) i dalje rade, a auth.* je već schema-kvalificiran.
--
-- Dinamički preko pg_proc — radi za bilo koju signaturu i tip (function ILI
-- procedure). Ovo izbjegava grešku ako add_sponsor_with_benefits u živoj bazi
-- ima drugačiju signaturu nego u migration_001. ALTER ROUTINE pokriva oboje.

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'is_admin',
        'is_project_admin',
        'is_sponsor',
        'get_my_sponsor_id',
        'notify_admin_on_contact_insert',
        'notify_admin_on_task_insert',
        'notify_contract_accepted',
        'record_partner_login_notification',
        'add_sponsor_with_benefits'
      )
  LOOP
    EXECUTE format('ALTER ROUTINE %s SET search_path = public, pg_temp', r.sig);
  END LOOP;
END $$;

-- =============================================================================
-- 2) SECURITY DEFINER EXECUTE GRANTS (lint 0028 / 0029)
-- =============================================================================
-- Supabase default-no GRANT-a EXECUTE na PUBLIC (uključuje anon + authenticated).
-- Zato moramo REVOKE od PUBLIC pa eksplicitno re-GRANT samo gdje treba.
-- service_role (backend / admin klijent) dobiva EXECUTE svugdje — trusted je.

-- ── Trigger funkcije: nitko ih ne smije zvati direktno (okidaju ih triggeri,
--    izvršavaju se kao owner). Revoke od svih → čisti 0028 I 0029. ────────────
REVOKE EXECUTE ON FUNCTION public.notify_admin_on_contact_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_admin_on_task_insert()    FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_contract_accepted()       FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.notify_admin_on_contact_insert() TO service_role;
GRANT  EXECUTE ON FUNCTION public.notify_admin_on_task_insert()    TO service_role;
GRANT  EXECUTE ON FUNCTION public.notify_contract_accepted()       TO service_role;

-- ── RPC koju zove SAMO backend preko service_role klijenta. ──────────────────
--    Čisti 0028 (anon) i 0029 (authenticated).
REVOKE EXECUTE ON FUNCTION public.record_partner_login_notification(uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.record_partner_login_notification(uuid, text, text) TO service_role;

-- ── RLS helper funkcije: zadrži EXECUTE za authenticated (TREBA RLS-u),
--    ali oduzmi anon (njega RLS policyji nikad ne pogađaju → čisti 0028). ──────
REVOKE EXECUTE ON FUNCTION public.is_admin()          FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_project_admin()  FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_sponsor()        FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_my_sponsor_id() FROM PUBLIC, anon;

GRANT  EXECUTE ON FUNCTION public.is_admin()          TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.is_project_admin()  TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.is_sponsor()        TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.get_my_sponsor_id() TO authenticated, service_role;

-- =============================================================================
-- 3) PUBLIC BUCKET ALLOWS LISTING (lint 0025) — sponsor-files
-- =============================================================================
-- sponsor-files je PUBLIC bucket → download preko public URL-a radi i bez SELECT
-- policy-ja na storage.objects. App ne koristi storage `.list()` (popis datoteka
-- dolazi iz `files` tablice), pa široki "authenticated read" policy samo
-- nepotrebno dopušta listanje svih objekata. Brišemo ga.
-- Upload (INSERT) i brisanje (DELETE) policyji ostaju netaknuti.

DROP POLICY IF EXISTS "authenticated read" ON storage.objects;

COMMIT;

-- =============================================================================
-- PREOSTALA UPOZORENJA NAKON OVE MIGRACIJE (oba namjerna / Dashboard-only):
-- =============================================================================
-- • 0029 za is_admin / is_project_admin / is_sponsor / get_my_sponsor_id
--   → NAMJERNO. Te funkcije moraju biti izvršive za `authenticated` jer ih
--     pozivaju RLS policyji. Ne cure podatke (vraćaju samo info o pozivatelju).
--     (Napredna opcija ako baš želiš ukloniti i to: premjesti ih u privatnu
--      shemu npr. `private.` i prepiši SVE RLS policyje da referenciraju
--      private.is_admin() itd. — invazivno i rizično; ne preporučujem.)
--
-- • auth_leaked_password_protection → NE može se SQL-om. Uključi u Dashboardu:
--     Authentication → Policies → "Leaked password protection" → Enable.
--     (Provjerava lozinke protiv HaveIBeenPwned.) Napravi u OBA projekta.
