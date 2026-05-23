-- Migration 027: Add ticket_type column to sponsor_contacts
-- Allows VIP / STANDARD ticket type for contacts of type 'ticket'

ALTER TABLE sponsor_contacts
  ADD COLUMN IF NOT EXISTS ticket_type TEXT
    CHECK (ticket_type IN ('vip', 'standard'))
    DEFAULT 'standard';
