-- Add project_id to program_sessions and budget_items
ALTER TABLE program_sessions ADD COLUMN IF NOT EXISTS project_id TEXT NOT NULL DEFAULT '2026';
ALTER TABLE budget_items     ADD COLUMN IF NOT EXISTS project_id TEXT NOT NULL DEFAULT '2026';

CREATE INDEX IF NOT EXISTS idx_program_sessions_project ON program_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_project     ON budget_items(project_id);
