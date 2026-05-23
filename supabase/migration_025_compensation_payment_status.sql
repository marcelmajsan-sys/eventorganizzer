-- migration_025: Dodaj 'compensation' (Kompenzacija) kao novi payment_status na sponsors tablici

-- Ukloni stari CHECK constraint
ALTER TABLE sponsors DROP CONSTRAINT IF EXISTS sponsors_payment_status_check;

-- Dodaj novi CHECK constraint s 'compensation'
ALTER TABLE sponsors
  ADD CONSTRAINT sponsors_payment_status_check
  CHECK (payment_status IN ('paid', 'pending', 'overdue', 'partial', 'compensation'));
