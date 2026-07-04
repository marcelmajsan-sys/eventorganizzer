-- migration_039_ticket_source.sql
-- Dodaje `source` kolonu na sponsor_contacts: tko je unio kontakt/ulaznicu.
--   'admin'  = uneseno u admin panelu
--   'portal' = partner unio kroz svoj portal
-- Sekcije na /admin/ulaznice ("Ulaznice partnera" vs "Ručno dodane") dijele se po
-- ovoj koloni umjesto po sponsor_id — admin sada može ručno dodati ulaznicu
-- vezanu uz partnera, a da ona i dalje ostane u "Ručno dodane".
-- Pokrenuti u OBA projekta (2025 i 2026).

ALTER TABLE sponsor_contacts
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'admin'
  CHECK (source IN ('admin', 'portal'));

-- Backfill (najbolja procjena): postojeće ulaznice vezane uz sponzora smatramo
-- portalskim unosima. NAPOMENA: ovaj UPDATE pokrenuti samo JEDNOM — ponovno
-- pokretanje bi pregazilo ručne ispravke ispod.
UPDATE sponsor_contacts
SET source = 'portal'
WHERE type = 'ticket' AND sponsor_id IS NOT NULL;

-- Ako je neka od tih ulaznica zapravo bila ručno dodana u adminu (npr. test
-- unos), vrati je u ručne:
-- UPDATE sponsor_contacts SET source = 'admin' WHERE id = '<id>';
