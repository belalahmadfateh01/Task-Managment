BEGIN;

ALTER TABLE employees
    ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS employees_active_idx ON employees (is_active);

COMMIT;
