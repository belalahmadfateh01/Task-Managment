BEGIN;

ALTER TABLE reports
    ADD COLUMN IF NOT EXISTS archived_at timestamptz;

CREATE INDEX IF NOT EXISTS reports_archive_date_idx
    ON reports (archived_at, report_date DESC);

CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    type varchar(40) NOT NULL,
    title varchar(200) NOT NULL,
    body text NOT NULL,
    href varchar(512),
    report_id uuid REFERENCES reports(id) ON DELETE SET NULL,
    task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at timestamptz
);

CREATE INDEX IF NOT EXISTS notifications_employee_date_idx
    ON notifications (employee_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_unread_idx
    ON notifications (employee_id, created_at DESC) WHERE read_at IS NULL;

COMMIT;
