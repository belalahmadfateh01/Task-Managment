BEGIN;

-- Existing databases may have reports.file_name as varchar(50), which is too
-- short for real attachment names. Keep it aligned with the API limit.
ALTER TABLE reports
    ALTER COLUMN file_name TYPE varchar(512);

COMMIT;
