-- Allow sponsor_benefits to exist without a sponsor (soft-remove from sponsor)
ALTER TABLE sponsor_benefits ALTER COLUMN sponsor_id DROP NOT NULL;
