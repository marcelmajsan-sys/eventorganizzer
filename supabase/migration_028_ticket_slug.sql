-- Migration 028: Add slug column to sponsor_contacts for QR ticket URLs
ALTER TABLE sponsor_contacts ADD COLUMN IF NOT EXISTS slug TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_sponsor_contacts_slug ON sponsor_contacts(slug) WHERE slug IS NOT NULL;
