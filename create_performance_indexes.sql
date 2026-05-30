-- Performance Optimization Indexes & RLS Policy Updates
-- Run this script inside your Supabase dashboard SQL Editor.

-- 1. Create B-Tree Indexes on foreign keys and frequently queried fields
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id_course_id ON public.user_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON public.user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON public.course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_weekly_updates_student_id_course_id ON public.weekly_updates(student_id, course_id);
CREATE INDEX IF NOT EXISTS idx_profiles_department_slug ON public.profiles(department_slug);

-- 2. Optimize RLS policies using a Security Definer function to bypass recursive checks
-- Create a cached Security Definer function to check if the current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Update weekly_updates admin policy to use the security definer function
DROP POLICY IF EXISTS "Allow administrators full control over weekly_updates" ON public.weekly_updates;
CREATE POLICY "Allow administrators full control over weekly_updates" 
ON public.weekly_updates 
FOR ALL 
TO authenticated 
USING (public.is_admin());

-- Reload schema cache to make changes immediately active
NOTIFY pgrst, 'reload schema';
