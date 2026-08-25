-- Add phone_verified and email_verified columns to auth_users
ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
