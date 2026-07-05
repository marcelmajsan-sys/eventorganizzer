-- migration_040: ukloni preširoki javni SELECT na ulaznicama
--
-- Problem: migration_029 je dodala policy "tickets_public_read"
-- (FOR SELECT TO anon USING (type = 'ticket')) na sponsor_contacts.
-- Anon ključ je javan, pa je preko PostgREST-a bilo tko mogao izlistati
-- SVE ulaznice sa svim kolonama (ime, email, telefon, tvrtka, interni notes).
--
-- Javna stranica ulaznice (/[slug]) čita podatke service-role klijentom
-- na serveru, pa joj ova policy uopće ne treba.
--
-- Pokrenuti u OBA Supabase projekta (2026 i 2025).

DROP POLICY IF EXISTS "tickets_public_read" ON public.sponsor_contacts;
