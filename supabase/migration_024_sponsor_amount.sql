-- migration_024: iznos kolona na sponsors tablici
-- Iznos sponzorskog paketa za izračun naplaćenog/neplaćenog na dashboardu

ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS iznos NUMERIC(10,2) DEFAULT NULL;
