-- Migration script to create the business/project inquiry submissions table for Matrix Root
-- Paste and run this SQL script directly inside your Supabase dashboard SQL editor.

CREATE TABLE IF NOT EXISTS public.project_inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    company_name TEXT,
    project_type TEXT NOT NULL,
    budget_range TEXT NOT NULL,
    description TEXT NOT NULL,
    preferred_contact_time TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) to keep data safe
ALTER TABLE public.project_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated web client submissions to insert rows
CREATE POLICY "Allow public inserts into project_inquiries" 
ON public.project_inquiries 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Allow administrators/authenticated users to view submissions
CREATE POLICY "Allow authenticated reads on project_inquiries" 
ON public.project_inquiries 
FOR SELECT 
TO authenticated 
USING (true);
