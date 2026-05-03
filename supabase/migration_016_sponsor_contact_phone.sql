-- Add contact_phone column to sponsors table
ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS contact_phone TEXT;
