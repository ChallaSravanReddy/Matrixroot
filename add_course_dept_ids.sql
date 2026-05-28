-- Migration: Add dept_ids array column for multi-branch course support
-- Run this in your Supabase SQL editor

ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS dept_ids uuid[] DEFAULT '{}';

-- Backfill: populate dept_ids from existing dept_id for all existing courses
UPDATE public.courses
SET dept_ids = ARRAY[dept_id]
WHERE dept_id IS NOT NULL AND (dept_ids IS NULL OR dept_ids = '{}');
