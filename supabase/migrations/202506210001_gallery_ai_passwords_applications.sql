-- Migration: Add applications table, ai_password_hash column on auth_users, storage_path on gallery_images
-- Part of portal enhancements - admission applications, dual password, gallery storage

-- Applications table for online admission form submissions
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_name TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  parent_mobile TEXT NOT NULL,
  parent_email TEXT,
  standard_applying INT,
  documents JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for looking up applications by parent mobile
CREATE INDEX IF NOT EXISTS idx_applications_parent_mobile ON applications(parent_mobile);

-- Add ai_password_hash column to auth_users for dual-password system (AI PIN)
ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS ai_password_hash TEXT;

-- Add storage_path column to gallery_images for Supabase Storage integration
ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS storage_path TEXT;
