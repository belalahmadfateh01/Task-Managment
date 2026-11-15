BEGIN;

ALTER TABLE employees
    ADD COLUMN IF NOT EXISTS address text;

COMMIT;
