-- Migration 023: Extend sponsor_contacts.type CHECK constraint
-- to include all contact types used in the UI.

ALTER TABLE sponsor_contacts
  DROP CONSTRAINT IF EXISTS sponsor_contacts_type_check;

ALTER TABLE sponsor_contacts
  ADD CONSTRAINT sponsor_contacts_type_check
  CHECK (type IN ('contact', 'ticket', 'partner', 'visitor', 'speaker', 'service_provider', 'brand_ambassador'));
