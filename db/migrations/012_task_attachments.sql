BEGIN;

ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS file_path text,
    ADD COLUMN IF NOT EXISTS file_size bigint;

COMMIT;
