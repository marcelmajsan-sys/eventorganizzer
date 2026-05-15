-- Add 'partial' to payment_status CHECK constraint on sponsors table
ALTER TABLE sponsors
  DROP CONSTRAINT IF EXISTS sponsors_payment_status_check;

ALTER TABLE sponsors
  ADD CONSTRAINT sponsors_payment_status_check
  CHECK (payment_status IN ('paid', 'pending', 'partial', 'overdue'));
