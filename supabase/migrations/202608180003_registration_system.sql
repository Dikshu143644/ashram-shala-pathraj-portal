-- Migration: Registration system columns for auth_users
-- Adds mobile_number, must_change_password, password_changed_at, parent_student_ids, created_by

ALTER TABLE auth_users
  ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(15),
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS parent_student_ids UUID[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS created_by UUID;

-- Index on mobile_number for fast lookup during registration uniqueness checks
CREATE INDEX IF NOT EXISTS idx_auth_users_mobile_number ON auth_users (mobile_number)
  WHERE mobile_number IS NOT NULL;

-- Force all existing users to change their plaintext passwords on next login
UPDATE auth_users SET must_change_password = TRUE WHERE must_change_password = FALSE;
