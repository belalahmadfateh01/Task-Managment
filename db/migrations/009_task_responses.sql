BEGIN;

ALTER TABLE task_assignments
    ADD COLUMN IF NOT EXISTS response text,
    ADD COLUMN IF NOT EXISTS responded_at timestamptz;

COMMIT;
