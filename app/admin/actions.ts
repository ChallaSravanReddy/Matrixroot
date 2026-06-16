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
    if (activeTab === "branches") {
      const { data: depts, error: deptsErr } = await supabaseAdmin.from("departments").select("*").order("name", { ascending: true });
      if (deptsErr) console.error("Branches Fetch Error:", deptsErr);
      result.departments = depts || [];
      const { data: crs } = await supabaseAdmin.from("courses").select("id, title, dept_id");
      result.courses = crs || [];
    }

    if (activeTab === "courses" || activeTab === "internship_tasks") {
      const { data: depts, error: deptsErr } = await supabaseAdmin.from("departments").select("*");
      if (deptsErr) console.error("Depts Error:", deptsErr);
      result.departments = depts || [];
      
      const { data: crs, error: crsErr } = await supabaseAdmin.from("courses").select("*, departments(name)");
      if (crsErr) console.error("Courses Error:", crsErr);
      result.courses = crs || [];
      
      if (activeTab === "internship_tasks") {
        const { data: profiles } = await supabaseAdmin.from("profiles").select("id, full_name");
        const { data: weeklyUpdates, error: weeklyErr } = await supabaseAdmin
          .from("weekly_updates")
          .select("*")
          .order("created_at", { ascending: false });
        result.profiles = profiles || [];
        result.weeklyUpdates = weeklyUpdates || [];
      }
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

      // Fetch departments for base track initialization mapping
      const { data: depts, error: deptsErr } = await supabaseAdmin.from("departments").select("*");
      if (deptsErr) console.error("Depts Fetch Error:", deptsErr);
      result.departments = depts || [];
    }

    if (activeTab === "students") {
      const { data: stds, error: stdsErr } = await supabaseAdmin.from("profiles").select("*, departments(name)");
      if (stdsErr) console.error("Students Error:", stdsErr);
      result.students = stds || [];
    }

    if (activeTab === "enrollments") {
      const { data: enrolls, error: enrollsErr } = await supabaseAdmin
        .from("enrollments")
        .select("*")
        .order("enrolled_at", { ascending: false });
      if (enrollsErr) console.error("Enrollments Fetch Error:", enrollsErr);

      const { data: profiles } = await supabaseAdmin.from("profiles").select("id, full_name, phone");
      const { data: courses } = await supabaseAdmin.from("courses").select("id, title, price");
      
      let users: any[] = [];
      try {
        const { data, error: authErr } = await supabaseAdmin.auth.admin.listUsers();
        if (!authErr && data?.users) {
          users = data.users;
        }
      } catch (authEx) {
        console.error("Auth Users Fetch Error:", authEx);
      }

      const mappedEnrollments = (enrolls || []).map((e: any) => {
        const student = profiles?.find((p: any) => p.id === e.student_id);
        const course = courses?.find((c: any) => String(c.id) === String(e.course_id));
        const authUser = users?.find((u: any) => u.id === e.student_id);
        return {
          ...e,
          student_name: student?.full_name || "Unknown Scholar",
          student_phone: student?.phone || "No Phone",
          student_email: authUser?.email || "No Email",
          course_title: course?.title || "Unknown Track",
          course_price: course?.price || 500
        };
      });

      result.enrollments = mappedEnrollments;
    }

    if (activeTab === "grading" || activeTab === "certificates") {
      const { data: progressData, error: progErr } = await supabaseAdmin
        .from("user_progress")
        .select("*");
      if (progErr) console.error("Progress Data Error:", progErr);

      const { data: profiles } = await supabaseAdmin.from("profiles").select("id, full_name");
      const { data: lessons } = await supabaseAdmin.from("lessons").select("id, title, course_id");
      const { data: allCourses } = await supabaseAdmin.from("courses").select("id, title, weekly_tasks, timeline_weeks, project_tasks");
      const { data: enrolls } = await supabaseAdmin.from("enrollments").select("*");

      // Fetch weekly internship submissions
      const { data: weeklyUpdates, error: weeklyErr } = await supabaseAdmin
        .from("weekly_updates")
        .select("*")
        .order("created_at", { ascending: false });
      if (weeklyErr) console.error("Weekly Updates Error:", weeklyErr);

      result.progressData = progressData || [];
      result.profiles = profiles || [];
      result.lessons = lessons || [];
      result.allCourses = allCourses || [];
      result.enrolls = enrolls || [];
      result.weeklyUpdates = weeklyUpdates || [];
    }

    if (activeTab === "offline_certificates") {
      const { data: enrolls, error: enrollsErr } = await supabaseAdmin
        .from("enrollments")
        .select("*")
        .eq("is_certified", true)
        .eq("certification_status", "approved")
        .order("enrolled_at", { ascending: false });
      if (enrollsErr) console.error("Offline Certs Fetch Error:", enrollsErr);

      const { data: profiles } = await supabaseAdmin.from("profiles").select("id, full_name, phone");
      const { data: courses } = await supabaseAdmin.from("courses").select("*, departments(name)");
      
      let users: any[] = [];
      try {
        const { data } = await supabaseAdmin.auth.admin.listUsers();
        if (data?.users) users = data.users;
      } catch (authEx) {
        console.error("Auth Users Fetch Error:", authEx);
      }

      const mappedCerts = (enrolls || []).map((e: any) => {
        const student = profiles?.find((p: any) => p.id === e.student_id);
        const course = courses?.find((c: any) => String(c.id) === String(e.course_id));
        const authUser = users?.find((u: any) => u.id === e.student_id);
        return {
          ...e,
          student_name: student?.full_name || "Unknown Scholar",
          student_phone: student?.phone || "No Phone",
          student_email: authUser?.email || "No Email",
          course_title: course?.title || "Unknown Track",
          branch_name: course?.departments?.name || "Foundational"
        };
      });

      result.offlineCertificates = mappedCerts;
      
      const { data: depts } = await supabaseAdmin.from("departments").select("*").order("name", { ascending: true });
      result.courses = courses || [];
      result.departments = depts || [];
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

    // Auto-approve certificate logic is removed. Students must be manually approved 
    // from the certificates tab where strict checks are verified.
    return { success: true, certified: false };
  } catch (error: any) {
    console.error("Approval Action Error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateEnrollmentAction(enrollmentId: string, score: number, status: string) {
  try {
    if (status === "approved") {
      // 1. Fetch enrollment
      const { data: enrollment, error: enrollError } = await supabaseAdmin
        .from("enrollments")
        .select("*")
        .eq("id", enrollmentId)
        .single();
      
      if (enrollError || !enrollment) {
        return { success: false, error: "Enrollment not found." };
      }

      // 2. Fetch course
      const { data: course, error: courseError } = await supabaseAdmin
        .from("courses")
        .select("*")
        .eq("id", enrollment.course_id)
        .single();
      
      if (courseError || !course) {
        return { success: false, error: "Course not found." };
      }

      // 3. Fetch weekly updates
      const { data: weeklyUpdates, error: weeklyError } = await supabaseAdmin
        .from("weekly_updates")
        .select("week_number, status")
        .eq("student_id", enrollment.student_id)
        .eq("course_id", enrollment.course_id);

      if (weeklyError) {
        return { success: false, error: "Failed to fetch student weekly updates." };
      }

      // -- Check 2: Completed Internship Tasks
      const courseProjectTasks = course.project_tasks || [];
      const studentCompletedTasks = enrollment.completed_tasks || [];
      const hasCompletedInternship = courseProjectTasks.every((task: string) => 
        studentCompletedTasks.includes(task)
      );

      if (!hasCompletedInternship) {
        return { 
          success: false, 
          error: "Strict Approval Check Failed: Student must complete all internship project tasks." 
        };
      }

      // -- Check 3: Submitted & approved every week update
      const totalWeeks = course.timeline_weeks || 8;
      const approvedWeeklyUpdates = weeklyUpdates?.filter((wu: any) => wu.status === "approved") || [];
      
      const hasApprovedAllWeeklyUpdates = Array.from({ length: totalWeeks }, (_, i) => i + 1).every((weekNum) => 
        approvedWeeklyUpdates.some((wu: any) => wu.week_number === weekNum)
      );

      if (!hasApprovedAllWeeklyUpdates) {
        return { 
          success: false, 
          error: `Strict Approval Check Failed: Student must have approved weekly updates for all ${totalWeeks} weeks.` 
        };
      }
    }

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
  } catch (err: any) {
    console.error("Error in updateEnrollmentAction:", err);
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}

export async function createCourseAction(course: any) {
  const { error } = await supabaseAdmin.from("courses").insert([course]);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateCourseAction(courseId: string, payload: {
  title?: string;
  description?: string;
  video_url?: string;
  dept_id?: string;
  dept_ids?: string[];
  price?: number;
}) {
  const { error } = await supabaseAdmin
    .from("courses")
    .update(payload)
    .eq("id", courseId);
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

export async function updateCoursePriceAction(courseId: string, price: number) {
  const { error } = await supabaseAdmin
    .from("courses")
    .update({ price })
    .eq("id", courseId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateCourseWorkspaceAction(courseId: string, payload: {
  problem_statements?: string[];
  project_tasks?: string[];
  weekly_tasks?: string[];
  problem_statement_file_url?: string;
}) {
  const { error } = await supabaseAdmin
    .from("courses")
    .update(payload)
    .eq("id", courseId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function gradeWeeklyUpdateAction(updateId: string, status: "approved" | "rejected", feedback: string) {
  try {
    const { error } = await supabaseAdmin
      .from("weekly_updates")
      .update({ status, feedback })
      .eq("id", updateId);
      
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error grading weekly update:", error);
    return { success: false, error: error.message };
  }
}

export async function createBranchAction(branch: { name: string; slug: string; description?: string }) {
  const { error } = await supabaseAdmin.from("departments").insert([branch]);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateBranchAction(id: string, payload: { name?: string; slug?: string; description?: string }) {
  const { error } = await supabaseAdmin.from("departments").update(payload).eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteBranchAction(id: string) {
  await supabaseAdmin.from("courses").update({ dept_id: null }).eq("dept_id", id);
  const { error } = await supabaseAdmin.from("departments").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function approveManualPaymentAction(enrollmentId: string) {
  try {
    const { error } = await supabaseAdmin
      .from("enrollments")
      .update({
        payment_status: "completed",
        payment_id: "manual-approved-" + Date.now()
      })
      .eq("id", enrollmentId);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("Error in approveManualPaymentAction:", err);
    return { success: false, error: err.message };
  }
}

export async function rejectManualPaymentAction(enrollmentId: string) {
  try {
    const { error } = await supabaseAdmin
      .from("enrollments")
      .delete()
      .eq("id", enrollmentId);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("Error in rejectManualPaymentAction:", err);
    return { success: false, error: err.message };
  }
}

export async function issueOfflineCertificateAction(payload: {
  fullName: string;
  email: string;
  phone?: string;
  courseId?: string;
  customCourseTitle?: string;
  customBranchName?: string;
  score: number;
  enrolledAt: string;
}) {
  try {
    let userId: string;

    // 1. Check if user already exists
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;
    const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === payload.email.toLowerCase());

    if (existingUser) {
      userId = existingUser.id;
      const { error: profUpdateErr } = await supabaseAdmin
        .from("profiles")
        .update({
          full_name: payload.fullName,
          phone: payload.phone || null
        })
        .eq("id", userId);
      if (profUpdateErr) throw profUpdateErr;
    } else {
      const tempPassword = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: payload.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: payload.fullName }
      });

      if (createError) throw createError;
      userId = newUser.user.id;

      await new Promise(resolve => setTimeout(resolve, 500));

      const { error: profInsertErr } = await supabaseAdmin
        .from("profiles")
        .update({
          full_name: payload.fullName,
          phone: payload.phone || null,
          role: "student"
        })
        .eq("id", userId);
      if (profInsertErr) throw profInsertErr;
    }

    // 2. Resolve Course ID
    let courseId = payload.courseId;
    if (!courseId) {
      const title = payload.customCourseTitle || "Offline Internship";
      const { data: existingCourse } = await supabaseAdmin
        .from("courses")
        .select("id")
        .eq("title", title)
        .maybeSingle();

      if (existingCourse) {
        courseId = existingCourse.id;
      } else {
        let deptId = null;
        const branchName = payload.customBranchName || "General";
        const { data: existingDept } = await supabaseAdmin
          .from("departments")
          .select("id")
          .eq("name", branchName)
          .maybeSingle();

        if (existingDept) {
          deptId = existingDept.id;
        } else {
          const slug = branchName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
          const { data: newDept, error: newDeptErr } = await supabaseAdmin
            .from("departments")
            .insert([{ name: branchName, slug }])
            .select()
            .single();
          if (newDeptErr) throw newDeptErr;
          deptId = newDept.id;
        }

        const { data: newCourse, error: newCourseErr } = await supabaseAdmin
          .from("courses")
          .insert([{
            title,
            description: `Offline Internship track in ${title}`,
            dept_id: deptId,
            price: 0,
            timeline_weeks: 8
          }])
          .select()
          .single();

        if (newCourseErr) throw newCourseErr;
        courseId = newCourse.id;
      }
    }

    // 3. Create the enrollment
    const { data: newEnrollment, error: enrollError } = await supabaseAdmin
      .from("enrollments")
      .insert([
        {
          student_id: userId,
          course_id: courseId,
          payment_status: "completed",
          is_certified: true,
          certification_status: "approved",
          final_score: payload.score,
          enrolled_at: payload.enrolledAt
        }
      ])
      .select()
      .single();

    if (enrollError) throw enrollError;

    return { success: true, enrollmentId: newEnrollment.id };
  } catch (error: any) {
    console.error("issueOfflineCertificateAction error:", error);
    return { success: false, error: error.message || "Failed to generate certificate." };
  }
}

export async function revokeOfflineCertificateAction(enrollmentId: string) {
  try {
    const { data: enrollment, error: fetchErr } = await supabaseAdmin
      .from("enrollments")
      .select("student_id")
      .eq("id", enrollmentId)
      .single();
    
    if (fetchErr) throw fetchErr;

    const { error: deleteErr } = await supabaseAdmin
      .from("enrollments")
      .delete()
      .eq("id", enrollmentId);
      
    if (deleteErr) throw deleteErr;

    if (enrollment?.student_id) {
      const { data: otherEnrollments } = await supabaseAdmin
        .from("enrollments")
        .select("id")
        .eq("student_id", enrollment.student_id);

      if (!otherEnrollments || otherEnrollments.length === 0) {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(enrollment.student_id);
        if (userData?.user?.email?.startsWith("offline_")) {
          await supabaseAdmin.auth.admin.deleteUser(enrollment.student_id);
        }
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("revokeOfflineCertificateAction error:", error);
    return { success: false, error: error.message || "Failed to revoke certificate." };
  }
}

export async function updateLessonAction(lessonId: string, payload: {
  module_id?: string | null;
  title?: string;
  content_url?: string;
  notes?: string;
  is_preview?: boolean;
  has_assignment?: boolean;
  order_index?: number;
  start_seconds?: number;
}) {
  const { error } = await supabaseAdmin
    .from("lessons")
    .update(payload)
    .eq("id", lessonId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateModuleAction(moduleId: string, payload: {
  title?: string;
  description?: string;
  has_assessment?: boolean;
  order_index?: number;
}) {
  const { error } = await supabaseAdmin
    .from("course_modules")
    .update(payload)
    .eq("id", moduleId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
