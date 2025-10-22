-- Migration: Create Resume Booster tables
-- Created: 2025-10-16

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_file TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(50),
  parsed JSONB,
  optimized JSONB,
  ats_score INTEGER,
  ats_feedback JSONB,
  cover_letter TEXT,
  status VARCHAR(50) DEFAULT 'uploaded',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job_tracker table
CREATE TABLE IF NOT EXISTS job_tracker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_url TEXT,
  title TEXT NOT NULL,
  company TEXT,
  location TEXT,
  description TEXT,
  status VARCHAR(50) DEFAULT 'saved',
  applied_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_tracker_user_id ON job_tracker(user_id);
CREATE INDEX IF NOT EXISTS idx_job_tracker_status ON job_tracker(status);
CREATE INDEX IF NOT EXISTS idx_job_tracker_created_at ON job_tracker(created_at DESC);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_resumes_updated_at
    BEFORE UPDATE ON resumes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_tracker_updated_at
    BEFORE UPDATE ON job_tracker
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies (Row Level Security)
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_tracker ENABLE ROW LEVEL SECURITY;

-- Resumes policies
CREATE POLICY resumes_select_policy ON resumes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY resumes_insert_policy ON resumes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY resumes_update_policy ON resumes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY resumes_delete_policy ON resumes
    FOR DELETE USING (auth.uid() = user_id);

-- Job tracker policies
CREATE POLICY job_tracker_select_policy ON job_tracker
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY job_tracker_insert_policy ON job_tracker
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY job_tracker_update_policy ON job_tracker
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY job_tracker_delete_policy ON job_tracker
    FOR DELETE USING (auth.uid() = user_id);
