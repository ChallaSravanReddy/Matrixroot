"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

// Initialize the Supabase admin client to bypass RLS for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function fetchAdminData(activeTab: string) {
  console.log("fetchAdminData called with tab:", activeTab);
  const result: any = {};

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Supabase environment variables are missing!");
    throw new Error("Supabase configuration error");
  }

  try {
    if (activeTab === "courses") {
      const { data: depts, error: deptsErr } = await supabaseAdmin.from("departments").select("*");
      if (deptsErr) console.error("Depts Error:", deptsErr);
      result.departments = depts || [];
      
      const { data: crs, error: crsErr } = await supabaseAdmin.from("courses").select("*, departments(name)");
      if (crsErr) console.error("Courses Error:", crsErr);
      result.courses = crs || [];
    }

    if (activeTab === "lessons") {
      const { data: crs, error: crsErr } = await supabaseAdmin.from("courses").select("*");
      if (crsErr) console.error("Lessons/Courses Error:", crsErr);
      result.courses = crs || [];

      // Gracefully fetch course_modules if the table exists
      const { data: mods, error: modsErr } = await supabaseAdmin.from("course_modules").select("*").order("order_index", { ascending: true });
      if (modsErr) console.error("Course Modules Fetch Error (Table might not be created yet):", modsErr);
      result.modules = mods || [];

      const { data: lsns, error: lsnsErr } = await supabaseAdmin.from("lessons").select("*").order("order_index", { ascending: true });
      if (lsnsErr) console.error("Lessons Fetch Error:", lsnsErr);
      result.lessons = lsns || [];
    }

    if (activeTab === "students") {
      const { data: stds, error: stdsErr } = await supabaseAdmin.from("profiles").select("*, departments(name)");
      if (stdsErr) console.error("Students Error:", stdsErr);
      result.students = stds || [];
    }

    if (activeTab === "grading" || activeTab === "certificates") {
      const { data: progressData, error: progErr } = await supabaseAdmin
        .from("user_progress")
        .select("*")
        .not("assignment_url", "is", null);
      if (progErr) console.error("Progress Data Error:", progErr);

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
    throw error; // Throw so we can see it in the logs or 500
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
  // If no order_index is provided, you might want to fetch max order_index or just let DB default it, 
  // but it's fine as we can reorder it later.
  const { error } = await supabaseAdmin.from("lessons").insert([lesson]);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteLessonAction(lessonId: string) {
  // Clear user_progress for this lesson first to prevent foreign key violations
  await supabaseAdmin.from("user_progress").delete().eq("lesson_id", lessonId);
  const { error } = await supabaseAdmin.from("lessons").delete().eq("id", lessonId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function reorderLessonsAction(updates: { id: string, order_index: number }[]) {
  try {
    for (const update of updates) {
      const { error } = await supabaseAdmin
        .from("lessons")
        .update({ order_index: update.order_index })
        .eq("id", update.id);
      if (error) throw error;
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteCourseAction(courseId: string) {
  try {
    // Manually cascade delete child foreign key records to avoid postgres constraint errors
    await supabaseAdmin.from("user_progress").delete().eq("course_id", courseId);
    await supabaseAdmin.from("enrollments").delete().eq("course_id", courseId);
    await supabaseAdmin.from("lessons").delete().eq("course_id", courseId);
    await supabaseAdmin.from("course_modules").delete().eq("course_id", courseId);

    const { error } = await supabaseAdmin.from("courses").delete().eq("id", courseId);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createModuleAction(moduleData: any) {
  const { error } = await supabaseAdmin.from("course_modules").insert([moduleData]);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteModuleAction(moduleId: string) {
  try {
    // First, clear out child lessons and their associated progress records
    const { data: modLessons } = await supabaseAdmin.from("lessons").select("id").eq("module_id", moduleId);
    if (modLessons && modLessons.length > 0) {
      const lessonIds = modLessons.map(l => l.id);
      await supabaseAdmin.from("user_progress").delete().in("lesson_id", lessonIds);
      await supabaseAdmin.from("lessons").delete().eq("module_id", moduleId);
    }

    const { error } = await supabaseAdmin.from("course_modules").delete().eq("id", moduleId);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
