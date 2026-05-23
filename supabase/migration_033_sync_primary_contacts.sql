-- Migration 033: Sync primary contacts from sponsors.contact_name into sponsor_contacts
-- Inserts a 'contact' type entry for any sponsor whose primary contact
-- does not yet exist in sponsor_contacts (matched case-insensitively by name + sponsor_id)

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT
  s.id,
  s.contact_name,
  s.contact_email,
  'contact'
FROM sponsors s
WHERE
  s.contact_name IS NOT NULL
  AND trim(s.contact_name) != ''
  AND NOT EXISTS (
    SELECT 1
    FROM sponsor_contacts sc
    WHERE sc.sponsor_id = s.id
      AND lower(trim(sc.name)) = lower(trim(s.contact_name))
      AND sc.type = 'contact'
  );
