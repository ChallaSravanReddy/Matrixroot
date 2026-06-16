-- Run this in your Supabase SQL Editor to add start_seconds column to the lessons table
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS start_seconds integer DEFAULT 0;
