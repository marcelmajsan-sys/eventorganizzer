-- Dodaj lead_status kolonu na sponsors tablicu
ALTER TABLE sponsors
ADD COLUMN IF NOT EXISTS lead_status TEXT CHECK (lead_status IN ('cold_lead', 'hot_lead', 'confirmed_new', 'confirmed_returning'));
