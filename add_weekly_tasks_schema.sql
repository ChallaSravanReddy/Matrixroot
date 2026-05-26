-- Run this in your Supabase SQL Editor to add weekly_tasks column
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS weekly_tasks text[] DEFAULT '{}'::text[];

-- Reload PostgREST schema cache so the column is immediately visible
NOTIFY pgrst, 'reload schema';
