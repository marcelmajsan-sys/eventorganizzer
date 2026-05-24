-- migration_035_contract_acceptance.sql
-- Dodaje praćenje digitalnog prihvaćanja ugovora na sponsor_users tablicu

ALTER TABLE sponsor_users
  ADD COLUMN IF NOT EXISTS contract_accepted_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS contract_accepted_by TEXT DEFAULT NULL;

COMMENT ON COLUMN sponsor_users.contract_accepted_at IS 'Kad je partner digitalno prihvatio ugovor o suradnji';
COMMENT ON COLUMN sponsor_users.contract_accepted_by IS 'Email adresa korisnika koji je prihvatio ugovor';
