-- Migration 029: Dozvoli anonimni (javni) SELECT na ticket kontaktima
-- Potrebno za javne stranice ulaznica (/miki-maus-cc2026)
CREATE POLICY IF NOT EXISTS "tickets_public_read" ON sponsor_contacts
FOR SELECT TO anon
USING (type = 'ticket');
