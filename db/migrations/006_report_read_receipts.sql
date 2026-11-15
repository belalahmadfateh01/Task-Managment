BEGIN;

CREATE TABLE IF NOT EXISTS report_reads (
    report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    read_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (report_id, employee_id)
);

CREATE INDEX IF NOT EXISTS report_reads_employee_idx ON report_reads (employee_id, read_at DESC);

COMMIT;
