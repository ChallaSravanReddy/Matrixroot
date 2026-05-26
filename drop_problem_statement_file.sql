-- Migration: Remove problem_statement_file_url column from public.courses table
ALTER TABLE public.courses DROP COLUMN IF EXISTS problem_statement_file_url;
