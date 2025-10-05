-- Add support for anonymous file uploads
-- This migration adds columns to track anonymous uploads and their expiry

-- Add is_anonymous column to files table
ALTER TABLE files 
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;

-- Add expires_at column for anonymous file expiry
ALTER TABLE files 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster cleanup queries
CREATE INDEX IF NOT EXISTS idx_files_anonymous_expiry 
ON files(is_anonymous, expires_at) 
WHERE is_anonymous = TRUE;

-- Allow null user_id for anonymous uploads
ALTER TABLE files 
ALTER COLUMN user_id DROP NOT NULL;

-- Add comment
COMMENT ON COLUMN files.is_anonymous IS 'Flag to indicate if file was uploaded anonymously';
COMMENT ON COLUMN files.expires_at IS 'Expiry timestamp for anonymous files (24 hours from upload)';
