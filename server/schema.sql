BEGIN;
CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(254) UNIQUE NOT NULL
);
CREATE TABLE IF NOT EXISTS courses (
  course_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_name VARCHAR(100) NOT NULL CHECK (length(trim(course_name)) > 0),
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  UNIQUE (user_id, course_name)
);
CREATE TABLE IF NOT EXISTS assignments (
  assignment_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title VARCHAR(150) NOT NULL CHECK (length(trim(title)) > 0),
  due_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Not Started'
    CHECK (status IN ('Not Started', 'In Progress', 'Completed')),
  course_id INTEGER NOT NULL REFERENCES courses(course_id),
  description VARCHAR(2000) NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS assignments_course_idx ON assignments(course_id);
CREATE INDEX IF NOT EXISTS assignments_due_idx ON assignments(due_date);
-- One shared demo user; authentication is intentionally outside this version.
INSERT INTO users (name, email) VALUES ('Demo Student', 'demo@student.example')
ON CONFLICT (email) DO NOTHING;
-- connect-pg-simple stores session JSON and a fixed expiration time here.
-- This additive migration preserves all existing users, courses, and assignments.
CREATE TABLE IF NOT EXISTS app_sessions (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS app_sessions_expire_idx ON app_sessions(expire);
COMMIT;
