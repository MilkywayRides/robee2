-- File: setup_projects_and_storage.sql
-- Purpose: Set up the projects table, RLS policies, and storage bucket for the CreateProjectForm

-- Enable UUID extension (required for uuid_generate_v4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing projects table if it exists to start fresh (optional, comment out if you want to keep data)
DROP TABLE IF EXISTS projects;

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'private')),
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  price NUMERIC,
  created_by UUID NOT NULL,
  storage_path TEXT,
  files JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security on projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow authenticated project creation" ON projects;

-- Create RLS policy to allow authenticated users to insert projects
CREATE POLICY "Allow authenticated project creation" ON projects
FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

-- Create RLS policy to allow users to read their own projects
CREATE POLICY "Allow authenticated read own projects" ON projects
FOR SELECT TO authenticated
USING (created_by = auth.uid());

-- Create RLS policy to allow public to read public projects
CREATE POLICY "Allow public read public projects" ON projects
FOR SELECT TO public
USING (visibility = 'public');

-- Create storage bucket for project files (if not already created)
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', false)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security on storage.objects (should already be enabled, but ensuring)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;

-- Create storage policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'project-files');

-- Create storage policy to allow authenticated users to read files
CREATE POLICY "Allow authenticated reads" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'project-files');

-- Optional: Add index for better performance
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects (created_by);