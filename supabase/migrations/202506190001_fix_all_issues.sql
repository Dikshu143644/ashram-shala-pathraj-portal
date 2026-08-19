-- Migration: Add gallery_images, ai_passwords tables and ensure mobile_number exists
-- Part of portal fixes v2

-- Gallery images table for school photo gallery (admin upload only)
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  caption TEXT,
  uploaded_by UUID REFERENCES auth_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI-specific passwords for chatbot access
CREATE TABLE IF NOT EXISTS ai_passwords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth_users(id) UNIQUE,
  ai_password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure mobile_number column exists on auth_users
ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(15);

-- Index for gallery ordering
CREATE INDEX IF NOT EXISTS idx_gallery_images_created_at ON gallery_images (created_at DESC);

-- Index for ai_passwords lookup
CREATE INDEX IF NOT EXISTS idx_ai_passwords_user_id ON ai_passwords (user_id);
