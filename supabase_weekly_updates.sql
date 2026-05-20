-- Migration script to create the Student Weekly Updates system for Matrix Root
-- Paste and run this SQL script directly inside your Supabase dashboard SQL editor.

-- 1. Create the weekly_updates table
CREATE TABLE IF NOT EXISTS public.weekly_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    week_number INT NOT NULL CHECK (week_number >= 1 AND week_number <= 8),
    improvement_text TEXT NOT NULL,
    screenshot_url TEXT NOT NULL,
    status TEXT DEFAULT 'submitted' NOT NULL CHECK (status IN ('submitted', 'approved', 'rejected')),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure a student can only submit one update per course per week.
    -- This allows us to perform upserts (updates/corrections) cleanly.
    UNIQUE (student_id, course_id, week_number)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.weekly_updates ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies for weekly_updates

-- Allow students to view their own submissions
CREATE POLICY "Allow students to view their own updates" 
ON public.weekly_updates 
FOR SELECT 
TO authenticated 
USING (auth.uid() = student_id);

-- Allow students to insert their own submissions
CREATE POLICY "Allow students to insert their own updates" 
ON public.weekly_updates 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = student_id);

-- Allow students to update their own submissions (e.g. resubmitting/correcting)
CREATE POLICY "Allow students to update their own updates" 
ON public.weekly_updates 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = student_id);

-- Allow students to delete their own submissions
CREATE POLICY "Allow students to delete their own updates" 
ON public.weekly_updates 
FOR DELETE 
TO authenticated 
USING (auth.uid() = student_id);

-- Allow administrators to select, insert, update, or delete all records
CREATE POLICY "Allow administrators full control over weekly_updates" 
ON public.weekly_updates 
FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 4. Supabase Storage Configuration (Optional but recommended)
-- Note: You should create a public bucket named 'weekly-screenshots' inside the Supabase Storage dashboard.
-- Below are the RLS policies to secure the storage bucket.

-- Allow authenticated users to upload screenshots to their own folder
-- Path structure: weekly-screenshots/[user_id]/[course_id]/filename
CREATE POLICY "Allow students to upload screenshots"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'weekly-screenshots' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow students to view screenshots inside the bucket
CREATE POLICY "Allow students to view screenshots"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'weekly-screenshots');
