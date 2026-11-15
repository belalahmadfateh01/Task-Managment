BEGIN;

ALTER TABLE employees
    ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

COMMIT;
