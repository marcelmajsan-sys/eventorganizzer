-- Migration 034: Add partial_amount column to sponsors
-- Stores the amount already paid for sponsors with payment_status = 'partial'

ALTER TABLE sponsors
ADD COLUMN IF NOT EXISTS partial_amount NUMERIC(10,2) DEFAULT NULL;
