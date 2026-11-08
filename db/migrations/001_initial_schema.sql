-- Baseline schema for a fresh database. Apply once with: npm run db:migrate
BEGIN;

CREATE TABLE IF NOT EXISTS employees (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    f_name varchar(255) NOT NULL,
    l_name varchar(255) NOT NULL,
    user_name varchar(255) NOT NULL UNIQUE,
    email varchar(254) NOT NULL UNIQUE,
    password text NOT NULL,
    role varchar(20) NOT NULL CHECK (role IN ('admin', 'teacher')),
    phone varchar(32),
    image text,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    status varchar(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accept', 'comment')),
    title varchar(200) NOT NULL,
    text text NOT NULL,
    file_name varchar(512),
    teacher_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    admin_id uuid REFERENCES employees(id) ON DELETE SET NULL,
    report_date timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    text text NOT NULL CHECK (length(trim(text)) BETWEEN 1 AND 10000),
    report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    admin_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title varchar(200) NOT NULL,
    description text,
    deadline timestamptz,
    created_by uuid REFERENCES employees(id) ON DELETE SET NULL,
    file_name varchar(512),
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS task_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    teacher_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    status varchar(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    completed_at timestamptz,
    UNIQUE (task_id, teacher_id)
);

CREATE INDEX IF NOT EXISTS reports_teacher_date_idx ON reports (teacher_id, report_date DESC);
CREATE INDEX IF NOT EXISTS reports_status_date_idx ON reports (status, report_date DESC);
CREATE INDEX IF NOT EXISTS comments_report_date_idx ON comments (report_id, created_at);
CREATE INDEX IF NOT EXISTS task_assignments_teacher_idx ON task_assignments (teacher_id, task_id);
CREATE INDEX IF NOT EXISTS tasks_created_at_idx ON tasks (created_at DESC);

COMMIT;
