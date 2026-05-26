-- Run this in your Supabase SQL Editor to add new configuration columns
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS price integer DEFAULT 500,
ADD COLUMN IF NOT EXISTS timeline_weeks integer DEFAULT 8,
ADD COLUMN IF NOT EXISTS problem_statements text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS problem_statement_file_url text;

ALTER TABLE public.enrollments
ADD COLUMN IF NOT EXISTS selected_problem_statement text;
