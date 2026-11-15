BEGIN;

-- These fields were added to the baseline task schema after some databases
-- had already applied 001_initial_schema.sql. Keep existing installations in sync.
ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS file_name varchar(512);

ALTER TABLE task_assignments
    ADD COLUMN IF NOT EXISTS completed_at timestamptz;

COMMIT;
