BEGIN;

ALTER TABLE reports
    ADD COLUMN IF NOT EXISTS file_path text,
    ADD COLUMN IF NOT EXISTS file_size bigint;

COMMIT;
