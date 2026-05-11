CREATE TABLE IF NOT EXISTS exams (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title                TEXT NOT NULL,
    lecturer_id          UUID NOT NULL REFERENCES users(id),
    duration_seconds     INT CHECK (duration_seconds > 0) NOT NULL,
    start_window         TIMESTAMPTZ NOT NULL,
    end_window           TIMESTAMPTZ NOT NULL,
    violation_threshold  INT DEFAULT 2,
    grace_period_seconds INT DEFAULT 60,
    status               TEXT CHECK (status IN ('DRAFT', 'SCHEDULED', 'ONGOING', 'COMPLETED')) DEFAULT 'DRAFT',
    CONSTRAINT valid_window CHECK (start_window < end_window)
);
