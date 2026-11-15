BEGIN;

ALTER TABLE task_assignments
    ADD COLUMN IF NOT EXISTS response text,
    ADD COLUMN IF NOT EXISTS responded_at timestamptz,
    ADD COLUMN IF NOT EXISTS response_report_id uuid REFERENCES reports(id) ON DELETE SET NULL;

COMMIT;
