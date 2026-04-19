-- Make deadline optional
ALTER TABLE sponsor_benefits ALTER COLUMN deadline DROP NOT NULL;

-- Add responsible person (email)
ALTER TABLE sponsor_benefits ADD COLUMN IF NOT EXISTS assigned_to TEXT;
