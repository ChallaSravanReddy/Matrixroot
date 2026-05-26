-- Run this in your Supabase SQL Editor to add project tasks columns
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS project_tasks text[] DEFAULT '{}'::text[];

ALTER TABLE public.enrollments
ADD COLUMN IF NOT EXISTS completed_tasks text[] DEFAULT '{}'::text[];
