-- Run this in your Supabase SQL Editor to add the new columns to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS year_of_study text,
ADD COLUMN IF NOT EXISTS college_name text,
ADD COLUMN IF NOT EXISTS phone text;
