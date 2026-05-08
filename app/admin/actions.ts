"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

// Initialize the Supabase admin client to bypass RLS for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function fetchAdminData(activeTab: string) {
  const result: any = {};

  try {
    if (activeTab === "courses") {
      const { data: depts } = await supabaseAdmin.from("departments").select("*");
      result.departments = depts || [];
      const { data: crs } = await supabaseAdmin.from("courses").select("*, departments(name)");
      result.courses = crs || [];
    }

    if (activeTab === "lessons") {
      const { data: crs } = await supabaseAdmin.from("courses").select("*");
      result.courses = crs || [];
    }

    if (activeTab === "students") {
      const { data: stds } = await supabaseAdmin.from("profiles").select("*, departments(name)");
      result.students = stds || [];
    }

    if (activeTab === "grading" || activeTab === "certificates") {
      const { data: progressData } = await supabaseAdmin
        .from("user_progress")
        .select("*")
        .not("assignment_url", "is", null);

      const { data: profiles } = await supabaseAdmin.from("profiles").select("id, full_name");
      const { data: lessons } = await supabaseAdmin.from("lessons").select("id, title, course_id");
      const { data: allCourses } = await supabaseAdmin.from("courses").select("id, title");
      const { data: enrolls } = await supabaseAdmin.from("enrollments").select("*");

      result.progressData = progressData || [];
      result.profiles = profiles || [];
      result.lessons = lessons || [];
      result.allCourses = allCourses || [];
      result.enrolls = enrolls || [];
    }

    return result;
  } catch (error) {
    console.error("Error fetching admin data:", error);
    return result;
  }
}

export async function approveAssignmentAction(progressId: string, enrollmentId: string, userId: string, courseId: string) {
  try {
    // 1. Approve the individual assignment
    const { error: progressError } = await supabaseAdmin
      .from("user_progress")
      .update({ status: "approved" })
      .eq("id", progressId);

    if (progressError) throw progressError;

    // 2. Check if ALL lessons for this course are now approved for this user
    const { data: totalLessons } = await supabaseAdmin
      .from("lessons")
      .select("id")
      .eq("course_id", courseId);

    const { data: approvedProgress } = await supabaseAdmin
      .from("user_progress")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .eq("status", "approved");

    let certified = false;
    if (totalLessons && approvedProgress && approvedProgress.length >= totalLessons.length) {
      // 3. AUTO-APPROVE CERTIFICATE
      await supabaseAdmin
        .from("enrollments")
        .update({
          is_certified: true,
          certification_status: "approved",
          final_score: 100, // Default score for perfect completion
        })
        .eq("id", enrollmentId);
      
      certified = true;
    }

    return { success: true, certified };
  } catch (error: any) {
    console.error("Approval Action Error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateEnrollmentAction(enrollmentId: string, score: number, status: string) {
  const { error } = await supabaseAdmin
    .from("enrollments")
    .update({
      is_certified: status === "approved",
      certification_status: status,
      final_score: score,
    })
    .eq("id", enrollmentId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function createCourseAction(course: any) {
  const { error } = await supabaseAdmin.from("courses").insert([course]);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function createLessonAction(lesson: any) {
  const { error } = await supabaseAdmin.from("lessons").insert([lesson]);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
