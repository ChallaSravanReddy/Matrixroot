-- Run this in your Supabase SQL Editor to add the price column to the courses table
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS price integer DEFAULT 500;
