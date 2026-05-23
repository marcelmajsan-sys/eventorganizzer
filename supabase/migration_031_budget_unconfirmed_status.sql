-- Migration 031: Add 'unconfirmed' to budget_items status CHECK constraint

ALTER TABLE budget_items DROP CONSTRAINT IF EXISTS budget_items_status_check;

ALTER TABLE budget_items
  ADD CONSTRAINT budget_items_status_check
  CHECK (status IN ('pending', 'paid', 'cancelled', 'unconfirmed'));
