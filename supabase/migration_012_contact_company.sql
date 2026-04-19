ALTER TABLE sponsor_contacts ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE sponsor_contacts ALTER COLUMN sponsor_id DROP NOT NULL;
