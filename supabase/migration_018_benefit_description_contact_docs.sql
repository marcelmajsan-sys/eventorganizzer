-- migration_018: benefit description, partner contact person, benefit-level file uploads

-- Add description field to sponsor_benefits (visible to partners on portal)
ALTER TABLE sponsor_benefits
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add contact_person_id: which sponsor contact is responsible for this benefit (partner-facing)
ALTER TABLE sponsor_benefits
ADD COLUMN IF NOT EXISTS contact_person_id UUID REFERENCES sponsor_contacts(id) ON DELETE SET NULL;

-- Add benefit_id to files so files can be linked to a specific benefit
ALTER TABLE files
ADD COLUMN IF NOT EXISTS benefit_id UUID REFERENCES sponsor_benefits(id) ON DELETE CASCADE;
