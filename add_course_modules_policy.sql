-- SQL Migration: Add SELECT Policy for Course Modules
-- Paste and run this SQL script directly inside your Supabase dashboard SQL editor.

-- 1. Enable Row Level Security (RLS) on course_modules (if not already enabled)
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

-- 2. Drop the policy if it already exists to prevent duplicate name errors
DROP POLICY IF EXISTS "Allow public select on course_modules" ON public.course_modules;

-- 3. Create the SELECT policy to allow anyone to view course modules
CREATE POLICY "Allow public select on course_modules"
ON public.course_modules
FOR SELECT
TO public
USING (true);
