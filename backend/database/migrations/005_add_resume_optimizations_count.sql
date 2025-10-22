-- Migration: Add resume_optimizations_count to users table for rate limiting
-- Created: 2025-10-16

-- Add column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS resume_optimizations_count INTEGER DEFAULT 0;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_resume_optimizations_count 
ON users(resume_optimizations_count);

-- Add comment
COMMENT ON COLUMN users.resume_optimizations_count IS 'Track number of resume optimizations used this month for rate limiting';
