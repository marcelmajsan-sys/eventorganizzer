-- Omogući notifikacije za zadatke (task_id) bez obaveznog sponsor_id.

-- 1. sponsor_id postaje nullable (zadaci ne moraju imati sponzora)
ALTER TABLE notifications ALTER COLUMN sponsor_id DROP NOT NULL;

-- 2. Dodaj task_id kolonu za linkovanje notifikacije na zadatak
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES tasks(id) ON DELETE CASCADE;
