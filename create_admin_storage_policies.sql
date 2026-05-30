-- SQL Migration: Add Admin RLS Policies for Supabase Storage
-- Run these statements in your Supabase SQL Editor to allow admin users to upload guidelines and documents.

-- 0. Ensure the 'weekly-screenshots' bucket exists in Supabase storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('weekly-screenshots', 'weekly-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- 1. Policy to allow admin accounts to upload (INSERT) files to any path in the 'weekly-screenshots' bucket
DROP POLICY IF EXISTS "Allow admin to upload all files" ON storage.objects;
CREATE POLICY "Allow admin to upload all files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'weekly-screenshots' AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 2. Policy to allow admin accounts to view (SELECT) all files in 'weekly-screenshots' bucket
DROP POLICY IF EXISTS "Allow admin to select all files" ON storage.objects;
CREATE POLICY "Allow admin to select all files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'weekly-screenshots' AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 3. Policy to allow admin accounts to update (UPDATE) all files in 'weekly-screenshots' bucket
DROP POLICY IF EXISTS "Allow admin to update all files" ON storage.objects;
CREATE POLICY "Allow admin to update all files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'weekly-screenshots' AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 4. Policy to allow admin accounts to delete (DELETE) all files in 'weekly-screenshots' bucket
DROP POLICY IF EXISTS "Allow admin to delete all files" ON storage.objects;
CREATE POLICY "Allow admin to delete all files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'weekly-screenshots' AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);
