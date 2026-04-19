-- Dodavanje tipova paketa: Community i Medijski
ALTER TABLE sponsors DROP CONSTRAINT IF EXISTS sponsors_package_type_check;
ALTER TABLE sponsors ADD CONSTRAINT sponsors_package_type_check
  CHECK (package_type IN ('Glavni', 'Zlatni', 'Srebrni', 'Brončani', 'Medijski', 'Community'));
