"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  fetchAdminData, 
  approveAssignmentAction, 
  updateEnrollmentAction, 
  createCourseAction, 
  createLessonAction,
  deleteLessonAction,
  reorderLessonsAction,
  deleteCourseAction,
  createModuleAction,
  deleteModuleAction,
  updateCoursePriceAction,
  updateCourseWorkspaceAction,
  gradeWeeklyUpdateAction,
  createBranchAction,
  updateBranchAction,
  deleteBranchAction,
  updateCourseAction,
  approveManualPaymentAction,
  rejectManualPaymentAction,
  issueOfflineCertificateAction,
  revokeOfflineCertificateAction,
  updateModuleAction,
  updateLessonAction
} from "./actions";

import CertificatePDF from "@/components/CertificatePDF";

import { getYouTubeThumbnail } from "@/lib/utils";
import Image from "next/image";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  FileCheck2, 
  Award, 
  PlusCircle, 
  Layers,
  ArrowLeft,
  ShieldCheck,
  Search,
  ExternalLink,
  Loader2,
  Trash2,
  Image as ImageIcon,
  Menu,
  X,
  Sparkles,
  FileText,
  Calendar,
  GitBranch,
  Pencil,
  Check,
  CheckCircle2,
  Circle,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/RichTextEditor";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("courses");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data States
  const [departments, setDepartments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [certRequests, setCertRequests] = useState<any[]>([]);
  const [certScores, setCertScores] = useState<Record<string, string>>({});
  const [allProgressRecords, setAllProgressRecords] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [enrollFilter, setEnrollFilter] = useState("");

  // Form States
  const [newCourse, setNewCourse] = useState({ 
    title: "", 
    description: "", 
    dept_id: "", 
    video_url: "", 
    price: 500, 
    timeline_weeks: 8, 
    problem_statements: [""] as string[]
  });
  const [selectedTaskCourse, setSelectedTaskCourse] = useState<string>("");
  const [newModule, setNewModule] = useState({ course_id: "", title: "", description: "", has_assessment: false });
  const [newLesson, setNewLesson] = useState({ course_id: "", module_id: "", title: "", content_url: "", notes: "", is_preview: false, has_assignment: false, start_seconds: 0 });
  const [uploadingFile, setUploadingFile] = useState(false);

  // Base Track Modal States
  const [isBaseTrackModalOpen, setIsBaseTrackModalOpen] = useState(false);
  const [trackTitle, setTrackTitle] = useState("");
  const [focusDomain, setFocusDomain] = useState("Software Engineering");
  const [trackDuration, setTrackDuration] = useState("60-Day Deep Dive");
  const [githubUrl, setGithubUrl] = useState("");
  const [welcomeInstructions, setWelcomeInstructions] = useState("");
  const [activationStatus, setActivationStatus] = useState(false); // false: Draft - Hidden, true: Live - Accepting Token
  const [trackPrice, setTrackPrice] = useState(500);
  const [timelineWeeks, setTimelineWeeks] = useState(8);
  const [problemStatements, setProblemStatements] = useState<string[]>([""]);

  // Curriculum Builder filter state
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("");
  const [editingWorkspaceCourse, setEditingWorkspaceCourse] = useState<any | null>(null);

  // Internship Tasks side panel state (populated when course is selected in Curriculum Builder)
  const [courseMainTasks, setCourseMainTasks] = useState<string[]>([""]);
  const [courseWeeklyTasks, setCourseWeeklyTasks] = useState<string[]>([]);
  const [courseFileUrl, setCourseFileUrl] = useState<string>("");
  const [courseBlueprints, setCourseBlueprints] = useState<string[]>([""]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [savingTasks, setSavingTasks] = useState(false);

  // Grading sub-view: "lessons" = lesson assignments, "weekly" = weekly screenshot proofs
  const [gradingSubView, setGradingSubView] = useState<"lessons" | "weekly">("weekly");
  const [weeklyUpdates, setWeeklyUpdates] = useState<any[]>([]);
  const [allCoursesMeta, setAllCoursesMeta] = useState<any[]>([]);
  const [allProfilesMeta, setAllProfilesMeta] = useState<any[]>([]);
  const [gradingFeedback, setGradingFeedback] = useState<Record<string, string>>({});

  // Branch management state
  const [newBranch, setNewBranch] = useState({ name: "", slug: "", description: "" });
  const [editingBranch, setEditingBranch] = useState<any | null>(null);
  const [branchSaving, setBranchSaving] = useState(false);

  // Course editing state
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [editCourseSaving, setEditCourseSaving] = useState(false);

  // Module & Lesson editing state
  const [editingModule, setEditingModule] = useState<any | null>(null);
  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [editModuleSaving, setEditModuleSaving] = useState(false);
  const [editLessonSaving, setEditLessonSaving] = useState(false);

  // Offline Certificates Generator states
  const [offlineCerts, setOfflineCerts] = useState<any[]>([]);
  const [offlineCertsFilter, setOfflineCertsFilter] = useState("");
  const [offlineForm, setOfflineForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    courseId: "", // Empty means Custom Course
    customCourseTitle: "",
    customBranchName: "",
    score: 90,
    enrolledAt: ""
  });
  const [offlineGenerating, setOfflineGenerating] = useState(false);
  const [offlineStatus, setOfflineStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    checkAdmin();
    setOfflineForm(prev => ({
      ...prev,
      enrolledAt: new Date().toISOString().split("T")[0]
    }));
  }, []);

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [activeTab, isAdmin]);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = "/login";
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();

    if (profile?.role !== "admin") {
      window.location.href = "/dashboard";
    } else {
      setIsAdmin(true);
    }
    setLoading(false);
  };

  const fetchData = async () => {
    try {
      const data = await fetchAdminData(activeTab);
      if (activeTab === "courses") {
        if (data.departments) setDepartments(data.departments);
        if (data.courses) setCourses(data.courses);
      }
      if (activeTab === "lessons") {
        if (data.courses) setCourses(data.courses);
        if (data.modules) setModules(data.modules);
        if (data.lessons) setLessons(data.lessons);
        if (data.departments) setDepartments(data.departments);
      }
      if (activeTab === "students" && data.students) setStudents(data.students);
      if (activeTab === "enrollments" && data.enrollments) setEnrollments(data.enrollments);
      if (activeTab === "internship_tasks") {
        if (data.courses) setCourses(data.courses);
        if (data.weeklyUpdates) setWeeklyUpdates(data.weeklyUpdates);
        if (data.profiles) setAllProfilesMeta(data.profiles);
      }
      if (activeTab === "grading" || activeTab === "certificates") {
        const { progressData, profiles, lessons, allCourses, enrolls, weeklyUpdates: wu } = data;
        if (progressData && profiles && lessons && allCourses && enrolls) {
          const joined = progressData.map((progress: any) => {
            const student = profiles.find((p: any) => p.id === progress.user_id);
            const lesson = lessons.find((l: any) => String(l.id) === String(progress.lesson_id));
            const course = allCourses.find((c: any) => String(c.id) === String(lesson?.course_id));
            const enrollment = enrolls.find((e: any) => e.student_id === progress.user_id && String(e.course_id) === String(lesson?.course_id));
            return { ...progress, profiles: student, lessons: { ...lesson, courses: course }, enrollment: enrollment };
          });
          setAllProgressRecords(joined);
          setSubmissions(joined.filter((s: any) => s.assignment_url !== null && s.assignment_url !== undefined));
          if (lessons) setLessons(lessons);
          const readyForCert = enrolls.filter((e: any) => e.payment_status === 'completed' && !e.is_certified).map((e: any) => ({
            ...e, courses: allCourses.find((c: any) => String(c.id) === String(e.course_id)), profiles: profiles.find((p: any) => p.id === e.student_id)
          }));
          setCertRequests(readyForCert);
        }
        if (wu) setWeeklyUpdates(wu);
        if (profiles) setAllProfilesMeta(profiles);
        if (allCourses) setAllCoursesMeta(allCourses);
      }
      if (activeTab === "branches" && data.departments) {
        setDepartments(data.departments);
        if (data.courses) setCourses(data.courses);
      }
      if (activeTab === "offline_certificates") {
        if (data.offlineCertificates) setOfflineCerts(data.offlineCertificates);
        if (data.courses) setCourses(data.courses);
        if (data.departments) setDepartments(data.departments);
      }
    } catch (err) {
      console.error("Fetch Data Error:", err);
    }
  };

  const handleApprovePayment = async (enrollmentId: string) => {
    if (!confirm("Are you sure you want to approve this enrollment payment request?")) return;
    const res = await approveManualPaymentAction(enrollmentId);
    if (res.success) {
      alert("Enrollment payment approved successfully! Access unlocked.");
      fetchData();
    } else {
      alert("Error approving payment: " + res.error);
    }
  };

  const handleRejectPayment = async (enrollmentId: string) => {
    if (!confirm("Are you sure you want to reject and delete this enrollment request? This student will need to request enrollment again.")) return;
    const res = await rejectManualPaymentAction(enrollmentId);
    if (res.success) {
      alert("Enrollment request rejected and deleted.");
      fetchData();
    } else {
      alert("Error rejecting request: " + res.error);
    }
  };

  const handleApproveAssignment = async (progressId: string, enrollmentId: string, userId: string, courseId: string) => {
    const res = await approveAssignmentAction(progressId, enrollmentId, userId, courseId);
    if (res.success) {
      alert(res.certified ? "Assignment approved & Certificate issued!" : "Assignment approved!");
      fetchData();
    }
  };

  const handleGrade = async (enrollmentId: string, score: string, status: 'approved' | 'rejected') => {
    const res = await updateEnrollmentAction(enrollmentId, parseInt(score) || 0, status);
    if (res.success) {
      alert(`Certificate ${status}!`);
      fetchData();
    }
  };

  const handleGenerateOfflineCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    setOfflineGenerating(true);
    setOfflineStatus(null);

    if (!offlineForm.fullName || !offlineForm.email) {
      setOfflineStatus({ type: "error", message: "Full Name and Email are required." });
      setOfflineGenerating(false);
      return;
    }

    if (!offlineForm.courseId && !offlineForm.customCourseTitle) {
      setOfflineStatus({ type: "error", message: "Please specify a Course Track or Custom Course Title." });
      setOfflineGenerating(false);
      return;
    }

    const payload = {
      fullName: offlineForm.fullName,
      email: offlineForm.email,
      phone: offlineForm.phone || undefined,
      courseId: offlineForm.courseId || undefined,
      customCourseTitle: offlineForm.courseId ? undefined : offlineForm.customCourseTitle,
      customBranchName: offlineForm.courseId ? undefined : offlineForm.customBranchName,
      score: Number(offlineForm.score),
      enrolledAt: new Date(offlineForm.enrolledAt).toISOString()
    };

    const res = await issueOfflineCertificateAction(payload);
    setOfflineGenerating(false);

    if (res.success) {
      setOfflineStatus({ type: "success", message: "Certificate generated successfully and registered!" });
      setOfflineForm({
        fullName: "",
        email: "",
        phone: "",
        courseId: "",
        customCourseTitle: "",
        customBranchName: "",
        score: 90,
        enrolledAt: new Date().toISOString().split("T")[0]
      });
      fetchData();
    } else {
      setOfflineStatus({ type: "error", message: res.error || "Failed to generate certificate." });
    }
  };

  const handleRevokeOfflineCertificate = async (enrollmentId: string) => {
    if (!confirm("Are you sure you want to revoke and delete this certificate? This action cannot be undone and will delete the associated enrollment record.")) return;
    
    const res = await revokeOfflineCertificateAction(enrollmentId);
    if (res.success) {
      alert("Certificate revoked and deleted successfully.");
      fetchData();
    } else {
      alert("Error revoking certificate: " + res.error);
    }
  };

  const handleSelectCourse = (cId: string) => {
    setSelectedCourseFilter(cId);
    setNewModule({ ...newModule, course_id: cId });
    setNewLesson({ ...newLesson, course_id: cId, module_id: "" });
    const co = courses.find((c: any) => String(c.id) === String(cId));
    if (co) {
      setCourseMainTasks(co.project_tasks?.length ? co.project_tasks : [""]);
      const weeks = co.timeline_weeks || 8;
      const existing = co.weekly_tasks || [];
      setCourseWeeklyTasks(Array.from({ length: weeks }, (_: any, i: number) => existing[i] || ""));
      setCourseFileUrl(co.problem_statement_file_url || "");
      setCourseBlueprints(co.problem_statements?.length ? co.problem_statements : [""]);
    } else {
      setCourseMainTasks([""]);
      setCourseWeeklyTasks([]);
      setCourseFileUrl("");
      setCourseBlueprints([""]);
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCourseFilter) return;
    setUploadingDoc(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `documents/${selectedCourseFilter}_doc_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("weekly-screenshots")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("weekly-screenshots")
        .getPublicUrl(filePath);

      setCourseFileUrl(publicUrl);
      alert("Guidelines document uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploadingDoc(false);
    }
  };

  // Save main tasks + weekly tasks for the selected course in Curriculum Builder
  const handleSaveCourseTasks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseFilter) return;
    setSavingTasks(true);
    try {
      const cleanMain = courseMainTasks.filter(t => t.trim() !== "");
      const cleanBlueprints = courseBlueprints.filter(t => t.trim() !== "");
      const res = await updateCourseWorkspaceAction(selectedCourseFilter, {
        project_tasks: cleanMain,
        weekly_tasks: courseWeeklyTasks,
        problem_statements: cleanBlueprints,
        problem_statement_file_url: courseFileUrl
      });
      if (res.success) {
        alert("Internship configurations saved successfully!");
        fetchData();
      } else {
        alert("Failed to save configuration: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSavingTasks(false);
    }
  };

  // Approve or reject a student's weekly screenshot submission
  const handleGradeWeekly = async (updateId: string, status: "approved" | "rejected") => {
    const fb = gradingFeedback[updateId] || "";
    const res = await gradeWeeklyUpdateAction(updateId, status, fb);
    if (res.success) {
      alert(`Weekly submission ${status}!`);
      setGradingFeedback(prev => { const n = {...prev}; delete n[updateId]; return n; });
      fetchData();
    } else {
      alert("Error: " + res.error);
    }
  };



  const handleUpdateCourseWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkspaceCourse) return;
    const res = await updateCourseWorkspaceAction(editingWorkspaceCourse.id, {
      problem_statements: (editingWorkspaceCourse.problem_statements || []).filter((s: string) => s.trim() !== "")
    });
    if (res.success) {
      alert("Workspace updated successfully!");
      setEditingWorkspaceCourse(null);
      fetchData();
    } else {
      alert("Update error: " + res.error);
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.name.trim() || !newBranch.slug.trim()) return;
    setBranchSaving(true);
    const res = await createBranchAction({
      name: newBranch.name.trim(),
      slug: newBranch.slug.trim().toLowerCase().replace(/\s+/g, "-"),
      description: newBranch.description.trim() || undefined
    });
    setBranchSaving(false);
    if (res.success) {
      setNewBranch({ name: "", slug: "", description: "" });
      fetchData();
    } else {
      alert("Error creating branch: " + res.error);
    }
  };

  const handleUpdateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch) return;
    setBranchSaving(true);
    const res = await updateBranchAction(editingBranch.id, {
      name: editingBranch.name,
      slug: editingBranch.slug.toLowerCase().replace(/\s+/g, "-"),
      description: editingBranch.description || ""
    });
    setBranchSaving(false);
    if (res.success) {
      setEditingBranch(null);
      fetchData();
    } else {
      alert("Error updating branch: " + res.error);
    }
  };

  const handleDeleteBranch = async (id: string, name: string) => {
    if (!confirm(`Delete branch "${name}"? All courses assigned to it will become unassigned.`)) return;
    const res = await deleteBranchAction(id);
    if (res.success) {
      fetchData();
    } else {
      alert("Error deleting branch: " + res.error);
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    setEditCourseSaving(true);
    // Primary dept_id is first selected branch (or empty)
    const primaryDeptId = editingCourse.dept_ids?.[0] || editingCourse.dept_id || null;
    const res = await updateCourseAction(editingCourse.id, {
      title: editingCourse.title,
      description: editingCourse.description,
      video_url: editingCourse.video_url,
      dept_id: primaryDeptId,
      dept_ids: editingCourse.dept_ids || [],
      price: editingCourse.price,
    });
    setEditCourseSaving(false);
    if (res.success) {
      setEditingCourse(null);
      fetchData();
    } else {
      alert("Error saving course: " + res.error);
    }
  };

  const handleUpdateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule) return;
    setEditModuleSaving(true);
    const res = await updateModuleAction(editingModule.id, {
      title: editingModule.title,
      description: editingModule.description,
      has_assessment: editingModule.has_assessment,
      order_index: editingModule.order_index,
    });
    setEditModuleSaving(false);
    if (res.success) {
      alert("Module updated successfully!");
      setEditingModule(null);
      fetchData();
    } else {
      alert("Error saving module: " + res.error);
    }
  };

  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;
    setEditLessonSaving(true);
    const res = await updateLessonAction(editingLesson.id, {
      module_id: editingLesson.module_id || null,
      title: editingLesson.title,
      content_url: editingLesson.content_url || "",
      notes: editingLesson.notes || "",
      is_preview: editingLesson.is_preview,
      has_assignment: editingLesson.has_assignment,
      order_index: editingLesson.order_index,
      start_seconds: editingLesson.start_seconds || 0,
    });
    setEditLessonSaving(false);
    if (res.success) {
      alert("Lesson updated successfully!");
      setEditingLesson(null);
      fetchData();
    } else {
      alert("Error saving lesson: " + res.error);
    }
  };

  const toggleEditCourseBranch = (deptId: string) => {
    if (!editingCourse) return;
    const current: string[] = editingCourse.dept_ids || [];
    const updated = current.includes(deptId)
      ? current.filter((id: string) => id !== deptId)
      : [...current, deptId];
    setEditingCourse({ ...editingCourse, dept_ids: updated });
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createCourseAction({
      ...newCourse,
      problem_statements: newCourse.problem_statements.filter(s => s.trim() !== "")
    });
    if (res.success) {
      alert("Course created successfully!");
      setNewCourse({ 
        title: "", 
        description: "", 
        dept_id: "", 
        video_url: "", 
        price: 500, 
        timeline_weeks: 8, 
        problem_statements: [""]
      });
      fetchData();
    } else {
      alert("Creation execution error: " + res.error);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson? This cannot be undone.")) return;
    const res = await deleteLessonAction(lessonId);
    if (res.success) {
      fetchData();
    } else {
      alert("Error deleting lesson: " + res.error);
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseFilter) {
      alert("Please select a course first.");
      return;
    }
    const res = await createModuleAction({
      ...newModule,
      course_id: selectedCourseFilter
    });
    if (res.success) {
      alert("Module initialized successfully!");
      setNewModule({ course_id: selectedCourseFilter, title: "", description: "", has_assessment: false });
      fetchData();
    } else {
      alert("Error creating module: " + res.error);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module? All associated lessons will be removed.")) return;
    const res = await deleteModuleAction(moduleId);
    if (res.success) {
      fetchData();
    } else {
      alert("Error deleting module: " + res.error);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course track? All associated records will be removed.")) return;
    const res = await deleteCourseAction(courseId);
    if (res.success) {
      fetchData();
    } else {
      alert("Error deleting course: " + res.error);
    }
  };

  const handleDeployBaseTrack = async () => {
    if (!trackTitle.trim()) {
      alert("Please enter a track title.");
      return;
    }

    const getDeptIdFromDomain = (domain: string) => {
      let matched = departments.find(d => d.slug === "it" || d.slug === "information-technology" || d.name.toLowerCase().includes("information"));
      if (domain === "AI & Automation") {
        matched = departments.find(d => d.slug === "eee" || d.slug === "electrical-electronics" || d.name.toLowerCase().includes("electrical"));
      }
      return matched?.id || departments[0]?.id || "";
    };

    const targetDeptId = getDeptIdFromDomain(focusDomain);
    const targetDeptName = departments.find(d => d.id === targetDeptId)?.name || focusDomain;

    const coursePayload = {
      title: trackTitle,
      description: welcomeInstructions || "Syllabus for " + trackTitle,
      dept_id: targetDeptId,
      video_url: githubUrl || null,
      price: trackPrice,
      timeline_weeks: timelineWeeks,
      problem_statements: problemStatements.filter(s => s.trim() !== ""),
    };

    const tempId = "temp-" + Date.now();
    const optimisticCourse = {
      id: tempId,
      ...coursePayload,
      departments: {
        name: targetDeptName
      }
    };

    setCourses(prev => [...prev, optimisticCourse]);
    setIsBaseTrackModalOpen(false);

    try {
      const res = await createCourseAction(coursePayload);
      if (!res.success) {
        throw new Error(res.error);
      }
      const updatedData = await fetchAdminData(activeTab);
      if (updatedData.courses) {
        setCourses(updatedData.courses);
      }
      // Reset form states on success
      setTrackTitle("");
      setGithubUrl("");
      setWelcomeInstructions("");
      setTrackPrice(500);
      setTimelineWeeks(8);
      setProblemStatements([""]);
    } catch (err: any) {
      alert("Error deploying track: " + err.message);
      setCourses(prev => prev.filter(c => c.id !== tempId));
    }
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center text-black"><Loader2 className="animate-spin text-[#8B5A2B]" /></div>;
  if (!isAdmin) return null;

  return (
    <div className="flex h-screen bg-white text-black overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 hidden lg:flex flex-col border-r border-black/10 bg-white">
        <div className="p-6 flex items-center gap-3 border-b border-black/10">
          <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Logo" width={32} height={32} />
          <span className="font-medium text-lg text-black">Admin Console</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: "courses", label: "Program Tracks", icon: <BookOpen size={18} /> },
            { id: "lessons", label: "Curriculum Builder", icon: <PlusCircle size={18} /> },
            { id: "internship_tasks", label: "Internship Task List", icon: <Layers size={18} /> },
            { id: "students", label: "Scholar Directory", icon: <Users size={18} /> },
            { id: "enrollments", label: "Enrollment Approvals", icon: <CreditCard size={18} /> },
            { id: "grading", label: "Artifact Evaluation", icon: <FileCheck2 size={18} /> },
            { id: "certificates", label: "Issuance Approvals", icon: <Award size={18} /> },
            { id: "offline_certificates", label: "Certificate Generator", icon: <ShieldCheck size={18} /> },
            { id: "branches", label: "Branches", icon: <GitBranch size={18} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 min-h-[40px] rounded-[12px] text-xs font-medium transition-colors ${
                activeTab === tab.id ? "bg-black/5 text-[#8B5A2B] border border-black/10 font-semibold" : "text-black/70 hover:bg-black/5 hover:text-black"
              }`}
            >
              <span className="text-[#8B5A2B]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-black/10">
          <Button variant="outline" size="sm" className="w-full text-xs rounded-[12px] border-black/20 shadow-none" onClick={() => window.location.href='/dashboard'}>
            <ArrowLeft size={14} className="mr-2 text-[#8B5A2B]" /> Exit to Portal
          </Button>
        </div>
      </aside>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div 
            className="absolute top-0 left-0 bottom-0 w-72 bg-white flex flex-col border-r border-black/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex items-center justify-between border-b border-black/10">
              <div className="flex items-center gap-3">
                <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Logo" width={32} height={32} />
                <span className="font-medium text-lg text-black">Admin</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-black/40 hover:text-black">
                <X size={20} />
              </button>
            </div>
            
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {[
                { id: "courses", label: "Program Tracks", icon: <BookOpen size={18} /> },
                { id: "lessons", label: "Curriculum Builder", icon: <PlusCircle size={18} /> },
                { id: "internship_tasks", label: "Internship Task List", icon: <Layers size={18} /> },
                { id: "students", label: "Scholar Directory", icon: <Users size={18} /> },
                { id: "enrollments", label: "Enrollment Approvals", icon: <CreditCard size={18} /> },
                { id: "grading", label: "Artifact Evaluation", icon: <FileCheck2 size={18} /> },
                { id: "certificates", label: "Issuance Approvals", icon: <Award size={18} /> },
                { id: "offline_certificates", label: "Certificate Generator", icon: <ShieldCheck size={18} /> },
                { id: "branches", label: "Branches", icon: <GitBranch size={18} /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 min-h-[40px] rounded-[12px] text-xs font-medium transition-colors ${
                    activeTab === tab.id ? "bg-black/5 text-[#8B5A2B] border border-black/10 font-semibold" : "text-black/70 hover:bg-black/5 hover:text-black"
                  }`}
                >
                  <span className="text-[#8B5A2B]">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-black/10">
              <Button variant="outline" size="sm" className="w-full text-xs rounded-[12px] border-black/20 shadow-none" onClick={() => window.location.href='/dashboard'}>
                <ArrowLeft size={14} className="mr-2 text-[#8B5A2B]" /> Exit to Portal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 border-b border-black/10 bg-neutral-50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-[#8B5A2B] hover:bg-black/5 rounded-[8px]"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-black">{activeTab} Supervision Node</h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-[#8B5A2B] bg-black/5 border border-black/10 px-2 py-0.5 rounded-[12px]">
               <ShieldCheck size={12} />
               Executive Clearances Active
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-[32px] md:p-[64px] space-y-[48px] pb-20">
          
          {activeTab === "courses" && (
            <div className="grid lg:grid-cols-[400px_1fr] gap-[32px]">
              <div className="space-y-[24px]">
                 <h3 className="text-xl font-medium tracking-[-0.02em] text-black">Add Internship / Course</h3>
                 <form onSubmit={handleCreateCourse} className="space-y-[16px] p-[24px] bg-white border border-black/20 rounded-[12px] shadow-none">
                    <input type="text" placeholder="Internship Name" className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[12px] text-xs focus:outline-none focus:border-black" value={newCourse.title} onChange={(e) => setNewCourse({...newCourse, title: e.target.value})} required />
                    <textarea placeholder="Internship Description" className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[12px] text-xs h-24 focus:outline-none focus:border-black" value={newCourse.description} onChange={(e) => setNewCourse({...newCourse, description: e.target.value})} required />
                    <select className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[12px] text-xs focus:outline-none focus:border-black" value={newCourse.dept_id} onChange={(e) => setNewCourse({...newCourse, dept_id: e.target.value})} required>
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    
                    {/* Input to support visual Cover graphic Image URL */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-black/60 flex items-center gap-1">
                        <ImageIcon size={12} className="text-[#8B5A2B]" /> Cover Image URL
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. /img/cover.png or Unsplash URL" 
                        className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[12px] text-xs focus:outline-none focus:border-black" 
                        value={newCourse.video_url} 
                        onChange={(e) => setNewCourse({...newCourse, video_url: e.target.value})} 
                      />
                    </div>

                    {/* Input to support Price */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-black/60 flex items-center gap-1">
                        Price (INR)
                      </label>
                      <input 
                        type="number" 
                        placeholder="e.g. 500" 
                        min="0"
                        className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[12px] text-xs focus:outline-none focus:border-black" 
                        value={newCourse.price} 
                        onChange={(e) => setNewCourse({...newCourse, price: parseInt(e.target.value) || 0})} 
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full h-10 rounded-[12px] font-medium text-xs bg-black text-white hover:bg-neutral-900 shadow-none mt-2">Add Course</Button>
                 </form>
              </div>
              <div className="space-y-[24px]">
                 <h3 className="text-xl font-medium tracking-[-0.02em] text-black">Managed Allocations</h3>
                 <div className="grid sm:grid-cols-2 gap-[16px]">
                    {courses.map(c => (
                      <div key={c.id} className="p-[24px] bg-white border border-black/20 rounded-[12px] hover:border-black/40 transition-colors shadow-none flex flex-col justify-between">
                        <div>
                          {c.video_url && (
                            <div className="h-32 w-full rounded-[8px] overflow-hidden mb-[16px] border border-black/10 relative bg-white">
                              <img
                                src={getYouTubeThumbnail(c.video_url)}
                                alt={c.title}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            </div>
                          )}
                          <div className="flex items-center justify-between mb-[8px]">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Show all branches if dept_ids exists, else fallback to single dept */}
                              {c.dept_ids && c.dept_ids.length > 0 ? (
                                c.dept_ids.slice(0, 2).map((did: string) => {
                                  const dpt = departments.find((d: any) => String(d.id) === String(did));
                                  return dpt ? (
                                    <span key={did} className="text-[10px] font-medium text-[#8B5A2B] uppercase tracking-wider bg-black/5 border border-black/10 px-2 py-0.5 rounded-[12px]">
                                      {dpt.name}
                                    </span>
                                  ) : null;
                                })
                              ) : (
                                <span className="text-[10px] font-medium text-[#8B5A2B] uppercase tracking-wider bg-black/5 border border-black/10 px-2 py-0.5 rounded-[12px]">
                                  {c.departments?.name || "Foundational"}
                                </span>
                              )}
                              {c.dept_ids && c.dept_ids.length > 2 && (
                                <span className="text-[9px] font-bold text-[#8B5A2B]/60 bg-black/5 border border-black/10 px-2 py-0.5 rounded-[12px]">
                                  +{c.dept_ids.length - 2} more
                                </span>
                              )}
                              <span className="text-[9px] font-bold text-gray-500 bg-gray-100 border border-gray-200/60 px-2 py-0.5 rounded-[12px]">
                                {c.timeline_weeks ?? 8} Weeks
                              </span>
                              {c.problem_statements && c.problem_statements.length > 0 && (
                                <span className="text-[9px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-[12px]">
                                  {c.problem_statements.length} Blueprints
                                </span>
                              )}
                            </div>
                            <button onClick={() => handleDeleteCourse(c.id)} className="text-[#8B5A2B] hover:bg-black/5 p-1 rounded-[6px] transition-colors" title="Purge Program">
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <h4 className="font-medium text-base tracking-[-0.02em] text-black mb-[8px]">{c.title}</h4>
                          <p className="text-xs text-black/80 line-clamp-2 leading-[1.6]">{c.description}</p>
                          
                          <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-[#8B5A2B]">Price: {c.price ?? 500}</span>
                            <div className="flex items-center gap-1.5">
                              <input 
                                type="number"
                                className="w-16 bg-neutral-50 border border-black/20 px-2 py-0.5 rounded-[6px] text-[10px] focus:outline-none focus:border-black text-right font-semibold"
                                defaultValue={c.price ?? 500}
                                onBlur={async (e) => {
                                  const newPrice = parseInt(e.target.value);
                                  if (isNaN(newPrice) || newPrice < 0) return;
                                  if (newPrice === (c.price ?? 500)) return;
                                  const res = await updateCoursePriceAction(c.id, newPrice);
                                  if (res.success) {
                                    fetchData();
                                  } else {
                                    alert("Error updating price: " + res.error);
                                  }
                                }}
                                onKeyDown={async (e) => {
                                  if (e.key === 'Enter') {
                                    const target = e.target as HTMLInputElement;
                                    target.blur();
                                  }
                                }}
                              />
                              <span className="text-[9px] text-black/50 font-medium">INR</span>
                            </div>
                          </div>

                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingCourse({
                                id: c.id,
                                title: c.title,
                                description: c.description || "",
                                video_url: c.video_url || "",
                                dept_id: c.dept_id || "",
                                dept_ids: c.dept_ids?.length ? c.dept_ids : (c.dept_id ? [c.dept_id] : []),
                                price: c.price ?? 500,
                              })}
                              className="flex-1 py-1.5 text-center text-[10px] font-bold bg-black/5 text-[#8B5A2B] border border-black/15 rounded-[8px] hover:bg-black/10 transition-colors flex items-center justify-center gap-1"
                            >
                              <Pencil size={11} /> Edit Course
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingWorkspaceCourse({
                                id: c.id,
                                title: c.title,
                                problem_statements: c.problem_statements || [""]
                              })}
                              className="flex-1 py-1.5 text-center text-[10px] font-bold bg-black/5 text-[#8B5A2B] border border-black/15 rounded-[8px] hover:bg-black/10 transition-colors"
                            >
                              Manage Blueprints
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {activeTab === "lessons" && (
            <div className="space-y-8">

              {/* Top: Course Selector */}
              <div className="bg-white border border-black/20 rounded-[14px] p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="shrink-0">
                  <span className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-widest block">Working Course</span>
                  <p className="text-xs text-black/50 mt-0.5">Select a course to manage its modules and lessons</p>
                </div>
                <select
                  className="flex-1 w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-sm font-semibold text-black focus:outline-none focus:border-black"
                  value={selectedCourseFilter}
                  onChange={(e) => handleSelectCourse(e.target.value)}
                >
                  <option value="">Select a course to get started</option>
                  {courses.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>

                <Button
                  onClick={() => setIsBaseTrackModalOpen(true)}
                  className="shrink-0 rounded-[10px] px-5 h-10 font-semibold bg-black text-white hover:bg-neutral-900 shadow-none text-xs"
                >
                  + New Course
                </Button>
              </div>

              {!selectedCourseFilter ? (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
                  <BookOpen size={40} className="text-[#8B5A2B]/20" />
                  <p className="text-sm font-semibold text-black/40">Select a course above to manage its curriculum</p>
                </div>
              ) : (
                <div className="space-y-8">

                  {/* Add Module + Add Lesson side by side */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="pb-2 border-b border-black/10">
                        <h3 className="text-sm font-bold text-black">1. Add Module</h3>
                        <p className="text-[10px] text-black/50 mt-0.5">Group lessons into a named chapter or phase</p>
                      </div>
                      <form onSubmit={handleCreateModule} className="space-y-3 bg-white border border-black/15 rounded-[12px] p-5">
                        <input
                          type="text"
                          placeholder="Module name (e.g. Phase 1: Fundamentals)"
                          className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-xs focus:outline-none focus:border-black text-black font-medium"
                          value={newModule.title}
                          onChange={(e) => setNewModule({...newModule, title: e.target.value})}
                          required
                        />
                        <textarea
                          placeholder="Module description (optional)"
                          className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-xs h-14 focus:outline-none focus:border-black text-black resize-none"
                          value={newModule.description}
                          onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                        />
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 rounded border-black/20" checked={newModule.has_assessment} onChange={(e) => setNewModule({...newModule, has_assessment: e.target.checked})} />
                          <span className="text-xs font-medium text-black">Requires assessment to unlock next module</span>
                        </label>
                        <Button type="submit" className="w-full h-9 rounded-[10px] font-semibold text-xs bg-black text-white hover:bg-neutral-900 shadow-none">
                          Add Module
                        </Button>
                      </form>
                    </div>

                    <div className="space-y-3">
                      <div className="pb-2 border-b border-black/10">
                        <h3 className="text-sm font-bold text-black">2. Add Lesson</h3>
                        <p className="text-[10px] text-black/50 mt-0.5">Add a video lesson inside a module</p>
                      </div>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!selectedCourseFilter) {
                          alert("Please select a course first.");
                          return;
                        }
                        const res = await createLessonAction({
                          ...newLesson,
                          course_id: selectedCourseFilter
                        });
                        if (res.success) {
                          setNewLesson({ ...newLesson, title: "", content_url: "", notes: "", has_assignment: false, start_seconds: 0 });
                          fetchData();
                        } else {
                          alert("Error: " + res.error);
                        }
                      }} className="space-y-3 bg-white border border-black/15 rounded-[12px] p-5">
                        <select
                          className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-xs focus:outline-none focus:border-black text-black font-medium"
                          value={newLesson.module_id}
                          onChange={(e) => setNewLesson({...newLesson, module_id: e.target.value})}
                          required
                        >
                          <option value="">Select module</option>
                          {modules.filter(m => String(m.course_id) === String(selectedCourseFilter)).map(m => (
                            <option key={m.id} value={m.id}>{m.title}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Lesson title"
                          className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-xs focus:outline-none focus:border-black text-black font-medium"
                          value={newLesson.title}
                          onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                          required
                        />
                        <input
                          type="text"
                          placeholder="Video URL (YouTube, MP4, etc.)"
                          className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-xs focus:outline-none focus:border-black text-black font-medium"
                          value={newLesson.content_url}
                          onChange={(e) => setNewLesson({...newLesson, content_url: e.target.value})}
                        />
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-[#8B5A2B] uppercase tracking-wider block">Lock Start Time (seconds)</label>
                          <input
                            type="number"
                            min={0}
                            placeholder="e.g. 15 (students can't seek before this second)"
                            className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-xs focus:outline-none focus:border-black text-black font-medium"
                            value={newLesson.start_seconds || 0}
                            onChange={(e) => setNewLesson({...newLesson, start_seconds: parseInt(e.target.value) || 0})}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-[#8B5A2B] uppercase tracking-wider block">Lesson Notes / Study Material</label>
                          <RichTextEditor
                            value={newLesson.notes}
                            onChange={(val) => setNewLesson({...newLesson, notes: val})}
                            placeholder="Add lesson notes or study material..."
                          />
                        </div>
                        <div className="flex gap-5 pt-1">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-black/20" checked={newLesson.is_preview} onChange={(e) => setNewLesson({...newLesson, is_preview: e.target.checked})} />
                            <span className="text-xs font-medium text-black">Free preview</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-black/20" checked={newLesson.has_assignment} onChange={(e) => setNewLesson({...newLesson, has_assignment: e.target.checked})} />
                            <span className="text-xs font-medium text-black">Requires assignment</span>
                          </label>
                        </div>
                        <Button type="submit" className="w-full h-9 rounded-[10px] font-semibold text-xs bg-black text-white hover:bg-neutral-900 shadow-none">
                          Add Lesson
                        </Button>
                      </form>
                    </div>
                  </div>

                  {/* Full-width Curriculum Structure */}
                  <div className="space-y-4">
                    <div className="pb-2 border-b border-black/10 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-black">Curriculum Structure</h3>
                        <p className="text-[10px] text-black/50 mt-0.5">{courses.find(c => c.id === selectedCourseFilter)?.title}</p>
                      </div>
                      <span className="text-[10px] font-bold text-[#8B5A2B] bg-black/5 border border-black/15 px-3 py-1.5 rounded-[8px]">
                        {modules.filter(m => String(m.course_id) === String(selectedCourseFilter)).length} Modules &middot; {lessons.filter(l => String(l.course_id) === String(selectedCourseFilter)).length} Lessons
                      </span>
                    </div>

                    {(() => {
                      const courseModules = modules
                        .filter(m => String(m.course_id) === String(selectedCourseFilter))
                        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
                      const unassigned = lessons
                        .filter(l => String(l.course_id) === String(selectedCourseFilter) && !l.module_id)
                        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
                      if (courseModules.length === 0 && unassigned.length === 0) {
                        return (
                          <div className="text-center py-14 bg-white border border-dashed border-black/20 rounded-[12px] text-black/40 text-xs">
                            No modules yet. Add your first module above.
                          </div>
                        );
                      }
                      return (
                        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                          {courseModules.map((mod) => {
                            const modLessons = lessons
                              .filter(l => String(l.module_id) === String(mod.id))
                              .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
                            return (
                              <div key={mod.id} className="bg-white border border-black/15 rounded-[12px] overflow-hidden shadow-sm flex flex-col">
                                <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 border-b border-black/10">
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-bold text-black truncate">{mod.title}</div>
                                    {mod.has_assessment && (
                                      <span className="text-[9px] font-semibold text-[#8B5A2B]">Assessment Required</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                    <button 
                                      onClick={() => setEditingModule({
                                        id: mod.id,
                                        title: mod.title,
                                        description: mod.description || "",
                                        has_assessment: !!mod.has_assessment,
                                        order_index: mod.order_index ?? 0
                                      })} 
                                      className="p-1 text-black/40 hover:text-black hover:bg-black/5 rounded transition-all" 
                                      title="Edit module"
                                    >
                                      <Pencil size={12} />
                                    </button>
                                    <button onClick={() => handleDeleteModule(mod.id)} className="p-1 text-[#8B5A2B]/40 hover:text-red-600 hover:bg-red-50 rounded transition-all" title="Delete module">
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                                <div className="p-3 space-y-1 flex-1">
                                  {modLessons.length === 0 ? (
                                    <div className="text-[10px] text-black/30 italic py-3 text-center">No lessons yet</div>
                                  ) : modLessons.map((lsn, i) => (
                                    <div key={lsn.id} className="flex items-start justify-between p-2 rounded-[8px] hover:bg-neutral-100 group transition-colors">
                                      <div className="flex items-start gap-2 min-w-0 flex-1">
                                        <span className="text-[9px] font-bold text-[#8B5A2B]/40 mt-0.5 shrink-0 w-4 text-center">{i + 1}</span>
                                        <div className="min-w-0 flex-1">
                                          <div className="text-xs font-medium text-black truncate">{lsn.title}</div>
                                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                            {lsn.content_url && <span className="text-[9px] text-black/40">Video</span>}
                                            {lsn.notes && <span className="text-[9px] text-black/40">Notes</span>}
                                            {lsn.is_preview && <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 rounded-[4px]">Preview</span>}
                                            {lsn.has_assignment && <span className="text-[9px] font-bold text-[#8B5A2B] bg-black/5 border border-black/15 px-1.5 rounded-[4px]">Assignment</span>}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0 ml-2">
                                        <button 
                                          onClick={() => setEditingLesson({
                                            id: lsn.id,
                                            course_id: lsn.course_id,
                                            module_id: lsn.module_id || "",
                                            title: lsn.title,
                                            content_url: lsn.content_url || "",
                                            notes: lsn.notes || "",
                                            is_preview: !!lsn.is_preview,
                                            has_assignment: !!lsn.has_assignment,
                                            order_index: lsn.order_index ?? 0,
                                            start_seconds: lsn.start_seconds ?? 0
                                          })} 
                                          className="opacity-0 group-hover:opacity-100 p-1 text-black/40 hover:text-black hover:bg-black/5 rounded transition-all"
                                          title="Edit lesson"
                                        >
                                          <Pencil size={11} />
                                        </button>
                                        <button onClick={() => handleDeleteLesson(lsn.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 rounded transition-all">
                                          <Trash2 size={11} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                          {unassigned.length > 0 && (
                            <div className="bg-white border border-dashed border-black/20 rounded-[12px] overflow-hidden">
                              <div className="px-4 py-3 border-b border-black/10">
                                <div className="text-xs font-bold text-black/50">Unassigned Lessons</div>
                              </div>
                              <div className="p-3 space-y-1">
                                {unassigned.map((lsn) => (
                                  <div key={lsn.id} className="flex items-center justify-between p-2 rounded-[8px] hover:bg-neutral-100 group transition-colors">
                                    <span className="text-xs text-black/70 truncate flex-1 min-w-0">{lsn.title}</span>
                                    <div className="flex items-center gap-1 shrink-0 ml-2">
                                      <button 
                                        onClick={() => setEditingLesson({
                                          id: lsn.id,
                                          course_id: lsn.course_id,
                                          module_id: lsn.module_id || "",
                                          title: lsn.title,
                                          content_url: lsn.content_url || "",
                                          notes: lsn.notes || "",
                                          is_preview: !!lsn.is_preview,
                                          has_assignment: !!lsn.has_assignment,
                                          order_index: lsn.order_index ?? 0,
                                          start_seconds: lsn.start_seconds ?? 0
                                        })} 
                                        className="opacity-0 group-hover:opacity-100 p-1 text-black/40 hover:text-black hover:bg-black/5 rounded transition-all"
                                        title="Edit lesson"
                                      >
                                        <Pencil size={11} />
                                      </button>
                                      <button onClick={() => handleDeleteLesson(lsn.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 rounded transition-all">
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>



                </div>
              )}
            </div>
          )}

          {activeTab === "students" && (
             <div className="space-y-[32px]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-[16px]">
                   <h3 className="text-xl font-medium tracking-[-0.02em] text-black">Authenticated Identities Directory</h3>
                   <div className="relative w-full md:w-96">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={14} />
                      <input type="text" placeholder="Filter parameters..." className="w-full bg-white border border-black/20 pl-9 pr-4 py-2 rounded-[12px] text-xs font-normal focus:border-black outline-none transition-all text-black" />
                   </div>
                </div>

                <div className="bg-white border border-black/20 rounded-[12px] overflow-hidden shadow-none">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="border-b border-black/10 bg-white text-[10px] font-medium uppercase tracking-wider text-black/60">
                            <th className="px-6 py-4">Identity String</th>
                            <th className="px-6 py-4">Domain Association</th>
                            <th className="px-6 py-4">Clearance Role</th>
                            <th className="px-6 py-4">Node Link Status</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-[#8B5A2B]/10">
                         {students.map(s => (
                           <tr key={s.id} className="hover:bg-neutral-50 transition-colors group">
                              <td className="px-6 py-3.5">
                                 <div className="font-medium text-xs text-black">{s.full_name || "Unverified Key"}</div>
                                 <div className="text-[10px] text-black/50">{s.id.substring(0,18)}...</div>
                              </td>
                              <td className="px-6 py-3.5 text-xs font-normal text-black">{s.department_slug?.toUpperCase() || "UNASSIGNED"}</td>
                              <td className="px-6 py-3.5">
                                 <span className={`px-2 py-0.5 rounded-[12px] text-[10px] font-medium uppercase tracking-wider border ${s.role === 'admin' ? 'bg-black/10 text-[#8B5A2B] border-black/20' : 'bg-white text-black/80 border-black/10'}`}>
                                    {s.role || "student"}
                                 </span>
                              </td>
                              <td className="px-6 py-3.5">
                                 <div className="flex items-center gap-1.5 text-emerald-800 font-medium text-xs">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                    Synchronized
                                 </div>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                   {students.length === 0 && (
                     <div className="py-[64px] text-center text-xs text-black/60 font-medium">Directory returns blank data array.</div>
                   )}
                </div>
             </div>
          )}

          {activeTab === "internship_tasks" && (
             <div className="space-y-[32px]">
                <div className="bg-white border border-black/20 rounded-[14px] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                   <div className="shrink-0">
                      <h3 className="text-sm font-bold text-[#8B5A2B] uppercase tracking-widest block">Working Course Workspace</h3>
                      <p className="text-xs text-black/50 mt-0.5 font-medium">Select a track to configure guidelines, blueprints, and weekly screenshot tasks.</p>
                   </div>
                   <select
                      className="flex-1 w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-sm font-semibold text-black focus:outline-none focus:border-black"
                      value={selectedCourseFilter}
                      onChange={(e) => handleSelectCourse(e.target.value)}
                   >
                      <option value="">Select a course to get started</option>
                      {courses.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
                   </select>
                </div>

                {selectedCourseFilter ? (
                   <form onSubmit={handleSaveCourseTasks} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left Column: Guidelines & Blueprints */}
                      <div className="space-y-6">
                         {/* Guidelines Document Card */}
                         <div className="bg-white border border-black/20 rounded-[12px] p-6 space-y-4 shadow-none">
                            <h4 className="text-sm font-bold text-black border-b border-black/10 pb-2 uppercase tracking-wider flex items-center gap-2">
                               <FileText size={16} className="text-[#8B5A2B]" /> Guidelines Document
                            </h4>
                            <div className="space-y-3">
                               <div className="flex flex-col sm:flex-row gap-3">
                                  <label className="flex items-center justify-center border border-black/20 border-dashed hover:border-black/40 rounded-[8px] cursor-pointer bg-white h-10 px-4 transition-all shrink-0">
                                     <span className="text-xs font-bold text-black/70">{uploadingDoc ? "Uploading..." : "Upload PDF/Doc"}</span>
                                     <input 
                                        type="file" 
                                        accept=".pdf,.doc,.docx" 
                                        onChange={handleDocUpload} 
                                        disabled={uploadingDoc}
                                        className="hidden" 
                                     />
                                  </label>
                                  <input 
                                     type="text" 
                                     placeholder="Direct guidelines URL..." 
                                     className="flex-1 bg-neutral-50 border border-black/20 px-3 py-2 rounded-[8px] text-xs focus:outline-none focus:border-black text-black font-medium"
                                     value={courseFileUrl}
                                     onChange={(e) => setCourseFileUrl(e.target.value)}
                                  />
                               </div>
                               {courseFileUrl && (
                                  <div className="flex items-center justify-between bg-white border border-black/10 rounded-[8px] p-2.5">
                                     <a href={courseFileUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#8B5A2B] hover:underline truncate max-w-[280px]">
                                        View guidelines document
                                     </a>
                                     <button type="button" onClick={() => setCourseFileUrl("")} className="text-red-500 hover:text-red-700 p-1">
                                        <Trash2 size={14} />
                                     </button>
                                  </div>
                                )}
                            </div>
                         </div>

                         {/* Blueprints / Problem statements */}
                         <div className="bg-white border border-black/20 rounded-[12px] p-6 space-y-4 shadow-none">
                            <div className="flex items-center justify-between border-b border-black/10 pb-2">
                               <h4 className="text-sm font-bold text-black uppercase tracking-wider flex items-center gap-2">
                                  <Sparkles size={16} className="text-[#8B5A2B]" /> Internship Blueprints
                               </h4>
                               <button 
                                  type="button"
                                  onClick={() => setCourseBlueprints([...courseBlueprints, ""])}
                                  className="px-2.5 py-0.5 text-[10px] font-bold bg-black/10 text-[#8B5A2B] border border-black/20 rounded-[6px] hover:bg-black/25 transition-all"
                               >
                                  + Add Blueprint
                               </button>
                            </div>

                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                               {courseBlueprints.map((blueprint, idx) => (
                                  <div key={idx} className="flex gap-2 items-start bg-white p-3 rounded-[8px] border border-black/20">
                                     <textarea
                                        value={blueprint}
                                        onChange={(e) => {
                                           const updated = [...courseBlueprints];
                                           updated[idx] = e.target.value;
                                           setCourseBlueprints(updated);
                                        }}
                                        placeholder={`Blueprint Question / Statement ${idx + 1}...`}
                                        className="flex-1 bg-transparent border-0 text-xs text-black focus:outline-none resize-none min-h-[50px] placeholder-black/30 font-medium"
                                     />
                                     {courseBlueprints.length > 1 && (
                                        <button
                                           type="button"
                                           onClick={() => setCourseBlueprints(courseBlueprints.filter((_, i) => i !== idx))}
                                           className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-500/10 transition-all self-center"
                                        >
                                           <Trash2 size={14} />
                                        </button>
                                     )}
                                  </div>
                               ))}
                            </div>
                         </div>

                         {/* General Roadmap Tasks Checklist */}
                         <div className="bg-white border border-black/20 rounded-[12px] p-6 space-y-4 shadow-none">
                            <div className="flex items-center justify-between border-b border-black/10 pb-2">
                               <h4 className="text-sm font-bold text-black uppercase tracking-wider flex items-center gap-2">
                                  <Layers size={16} className="text-[#8B5A2B]" /> Roadmap Project Tasks
                               </h4>
                               <button 
                                  type="button"
                                  onClick={() => setCourseMainTasks([...courseMainTasks, ""])}
                                  className="px-2.5 py-0.5 text-[10px] font-bold bg-black/10 text-[#8B5A2B] border border-black/20 rounded-[6px] hover:bg-black/25 transition-all"
                               >
                                  + Add Task
                               </button>
                            </div>

                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                               {courseMainTasks.map((task, idx) => (
                                  <div key={idx} className="flex gap-2 items-center bg-white p-2.5 rounded-[8px] border border-black/20">
                                     <input
                                        type="text"
                                        value={task}
                                        onChange={(e) => {
                                           const updated = [...courseMainTasks];
                                           updated[idx] = e.target.value;
                                           setCourseMainTasks(updated);
                                        }}
                                        placeholder={`Task ${idx + 1} description...`}
                                        className="flex-1 bg-transparent border-0 text-xs text-black focus:outline-none placeholder-black/30 font-medium"
                                     />
                                     {courseMainTasks.length > 1 && (
                                        <button
                                           type="button"
                                           onClick={() => setCourseMainTasks(courseMainTasks.filter((_, i) => i !== idx))}
                                           className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-500/10 transition-all self-center"
                                        >
                                           <Trash2 size={14} />
                                        </button>
                                     )}
                                  </div>
                               ))}
                            </div>
                         </div>
                      </div>

                      {/* Right Column: Weekly Screenshot Tasks */}
                      <div className="bg-white border border-black/20 rounded-[12px] p-6 space-y-4 shadow-none flex flex-col justify-between">
                         <div className="space-y-4">
                            <h4 className="text-sm font-bold text-black border-b border-black/10 pb-2 uppercase tracking-wider flex items-center gap-2">
                               <Calendar size={16} className="text-[#8B5A2B]" /> Weekly Screenshot Tasks
                            </h4>
                            <p className="text-[11px] text-black/60">Define the screenshot submission prompts for each week. Students will be required to submit a proof image matching these prompts.</p>

                            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                               {courseWeeklyTasks.map((wtask, idx) => (
                                  <div key={idx} className="space-y-1.5 p-3.5 bg-white rounded-[10px] border border-black/15">
                                     <span className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-wider block">Week {idx + 1} Deliverable Prompt</span>
                                     <textarea
                                        value={wtask}
                                        onChange={(e) => {
                                           const updated = [...courseWeeklyTasks];
                                           updated[idx] = e.target.value;
                                           setCourseWeeklyTasks(updated);
                                        }}
                                        placeholder={`Provide description of screenshot required from students in week ${idx + 1}...`}
                                        className="w-full bg-white border border-black/20 rounded-[8px] p-2 text-xs focus:border-black outline-none min-h-[60px] text-black font-medium"
                                     />
                                  </div>
                               ))}
                            </div>
                         </div>

                         <div className="pt-4 border-t border-black/10 flex justify-end">
                            <Button 
                               type="submit" 
                               disabled={savingTasks}
                               className="rounded-[10px] bg-black hover:bg-neutral-900 text-white px-8 h-10 font-bold text-xs shadow-md transition-colors"
                            >
                               {savingTasks ? "Saving and Publishing..." : "Save and Publish"}
                            </Button>
                         </div>
                      </div>
                   </form>
                ) : (
                   <div className="text-center py-20 bg-white border border-black/15 rounded-[12px] text-black/50 text-xs font-semibold">
                      Please select an academic course track from the dropdown above to manage its workspace tasks.
                   </div>
                )}
             </div>
          )}

          {activeTab === "grading" && (
             <div className="space-y-[24px]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-black/10 pb-4">
                   <div>
                      <h3 className="text-xl font-medium tracking-[-0.02em] text-black">Artifact Verification Pipeline</h3>
                      <p className="text-xs text-black/60 mt-1 font-medium">Verify lesson assignments and weekly internship screenshots submitted by students.</p>
                   </div>
                   
                   {/* Sub-view selection buttons */}
                   <div className="flex bg-white border border-black/15 rounded-[12px] p-1 gap-1">
                      <button 
                         onClick={() => setGradingSubView("lessons")}
                         className={`px-4 py-2 rounded-[8px] text-xs font-semibold transition-all ${
                            gradingSubView === "lessons" 
                               ? "bg-white text-[#8B5A2B] shadow-sm" 
                               : "text-black/60 hover:text-black"
                         }`}
                      >
                         Lesson Assignments
                      </button>
                      <button 
                         onClick={() => setGradingSubView("weekly")}
                         className={`px-4 py-2 rounded-[8px] text-xs font-semibold transition-all ${
                            gradingSubView === "weekly" 
                               ? "bg-white text-[#8B5A2B] shadow-sm" 
                               : "text-black/60 hover:text-black"
                         }`}
                      >
                         Weekly Screenshots
                      </button>
                   </div>
                </div>

                {gradingSubView === "lessons" ? (
                   <div className="grid gap-[24px]">
                      {submissions.length === 0 ? (
                        <div className="py-[64px] text-center bg-white border border-black/10 rounded-[12px] text-xs text-black/60 font-medium">Pipeline node idle.</div>
                      ) : (
                        submissions.map(sub => (
                          <div key={sub.id} className="p-[32px] bg-white border border-black/20 rounded-[12px] flex flex-col md:flex-row gap-[24px] justify-between shadow-none">
                             <div className="flex-1 space-y-[16px]">
                                <div>
                                   <h4 className="text-base font-medium text-black">{sub.profiles?.full_name || "Scholar"}</h4>
                                   <p className="text-xs font-medium text-[#8B5A2B] uppercase tracking-wider mt-0.5">{sub.lessons?.courses?.title}</p>
                                   <p className="text-xs text-black/70 mt-1">Scope Unit: {sub.lessons?.title}</p>
                                </div>
                                <div className="p-2.5 bg-white rounded-[12px] flex items-center justify-between border border-black/10">
                                   <span className="text-xs font-normal truncate pr-4 text-black">{sub.assignment_url}</span>
                                   <a href={sub.assignment_url} target="_blank" className="shrink-0 text-[#8B5A2B] p-1 hover:bg-white rounded-[6px]"><ExternalLink size={14} /></a>
                                </div>
                             </div>
                             <div className="flex items-center gap-4 shrink-0">
                                {sub.status === 'approved' ? (
                                   <div className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-[12px] font-medium text-xs uppercase tracking-wider">Signed Off</div>
                                ) : (
                                   <Button size="sm" className="rounded-[12px] px-6 font-medium bg-black text-white hover:bg-neutral-900 shadow-none text-xs" onClick={() => handleApproveAssignment(sub.id, sub.enrollment?.id, sub.user_id, sub.lessons?.course_id)}>Affirm Signoff</Button>
                                )}
                             </div>
                          </div>
                        ))
                      )}
                   </div>
                ) : (
                   <div className="grid gap-[24px]">
                      {weeklyUpdates.length === 0 ? (
                         <div className="py-[64px] text-center bg-white border border-black/10 rounded-[12px] text-xs text-black/60 font-medium">No weekly screenshot submissions found.</div>
                      ) : (
                         weeklyUpdates.map((wu: any) => {
                            const student = allProfilesMeta.find((p: any) => p.id === wu.student_id);
                            const course = allCoursesMeta.find((c: any) => String(c.id) === String(wu.course_id));
                            const weekTask = course?.weekly_tasks?.[wu.week_number - 1] || "Submit weekly progress screenshot.";
                            
                            return (
                               <div key={wu.id} className="p-[32px] bg-white border border-black/20 rounded-[12px] flex flex-col lg:flex-row gap-[24px] shadow-none">
                                  {/* Left Panel: Text & Metadata */}
                                  <div className="flex-1 space-y-4">
                                     <div>
                                        <div className="flex items-center gap-2">
                                           <h4 className="text-base font-semibold text-black">{student?.full_name || "Scholar"}</h4>
                                           <span className="px-2 py-0.5 rounded-[12px] text-[10px] font-bold bg-black/10 text-[#8B5A2B] border border-black/25 uppercase tracking-wider">
                                              Week {wu.week_number}
                                           </span>
                                        </div>
                                        <p className="text-xs font-semibold text-[#8B5A2B] uppercase tracking-wider mt-1">{course?.title || "Program Track"}</p>
                                     </div>

                                     <div className="space-y-1.5 p-3 bg-neutral-50 rounded-[10px] border border-black/10">
                                        <span className="text-[10px] font-bold text-black/60 uppercase tracking-wider block">Assigned Task</span>
                                        <p className="text-xs text-black/80 font-medium leading-[1.5]">{weekTask}</p>
                                     </div>

                                     <div className="space-y-1.5 p-3 bg-neutral-50 rounded-[10px] border border-black/10">
                                        <span className="text-[10px] font-bold text-black/60 uppercase tracking-wider block">Student's Description / Notes</span>
                                        <p className="text-xs text-black/80 font-medium leading-[1.5] whitespace-pre-wrap">{wu.improvement_text || "No notes provided."}</p>
                                     </div>

                                     <div className="space-y-2 pt-2">
                                        <span className="text-[10px] font-bold text-black/60 uppercase tracking-wider block">mentor feedback</span>
                                        <textarea
                                           placeholder="Enter grading feedback or changes requested..."
                                           value={gradingFeedback[wu.id] || ""}
                                           onChange={(e) => setGradingFeedback(prev => ({ ...prev, [wu.id]: e.target.value }))}
                                           className="w-full bg-white border border-black/25 rounded-[10px] p-2 text-xs focus:border-black outline-none min-h-[60px] text-black"
                                        />
                                     </div>

                                     <div className="flex gap-[8px] pt-1">
                                        {wu.status === "approved" ? (
                                           <span className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-[10px] font-bold text-xs uppercase tracking-wider text-center flex-1">
                                              Approved
                                           </span>
                                        ) : wu.status === "rejected" ? (
                                           <div className="flex gap-2 flex-1">
                                              <span className="px-4 py-2 bg-rose-50 text-rose-800 border border-rose-200 rounded-[10px] font-bold text-xs uppercase tracking-wider text-center flex-1">
                                                 Changes Requested
                                              </span>
                                              <Button 
                                                 size="sm" 
                                                 className="rounded-[10px] px-5 font-bold bg-black text-white hover:bg-neutral-900 shadow-none text-xs" 
                                                 onClick={() => handleGradeWeekly(wu.id, "approved")}
                                              >
                                                 Approve Anyway
                                              </Button>
                                           </div>
                                        ) : (
                                           <div className="flex gap-2 flex-1">
                                              <Button 
                                                 size="sm" 
                                                 className="rounded-[10px] px-5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-none text-xs flex-1" 
                                                 onClick={() => handleGradeWeekly(wu.id, "approved")}
                                              >
                                                 Approve Proof
                                              </Button>
                                              <Button 
                                                 variant="outline" 
                                                 size="sm" 
                                                 className="rounded-[10px] px-5 font-bold border-rose-200 text-rose-600 hover:bg-rose-50 shadow-none text-xs flex-1" 
                                                 onClick={() => handleGradeWeekly(wu.id, "rejected")}
                                              >
                                                 Request Changes
                                              </Button>
                                           </div>
                                        )}
                                     </div>
                                  </div>

                                  {/* Right Panel: Screenshot Preview */}
                                  <div className="w-full lg:w-[320px] shrink-0 space-y-2">
                                     <span className="text-[10px] font-bold text-black/60 uppercase tracking-wider block">Submitted Screenshot</span>
                                     <div className="aspect-video lg:aspect-square w-full rounded-[10px] overflow-hidden border border-black/15 bg-white relative group">
                                        <img 
                                           src={wu.screenshot_url} 
                                           alt="Weekly Progress Screenshot" 
                                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                        />
                                        <a 
                                           href={wu.screenshot_url} 
                                           target="_blank" 
                                           rel="noopener noreferrer"
                                           className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity"
                                        >
                                           View Full Resolution
                                        </a>
                                     </div>
                                  </div>
                               </div>
                            );
                         })
                      )}
                   </div>
                )}
             </div>
          )}

          {activeTab === "certificates" && (
             <div className="space-y-[24px]">
                <div className="flex justify-between items-center border-b border-black/10 pb-4">
                   <div>
                      <h3 className="text-xl font-semibold tracking-tight text-black">Signature Allocation Approval Gate</h3>
                      <p className="text-xs text-black/60 mt-1">Review student eligibility requirements and issue credentials.</p>
                   </div>
                   <span className="text-xs font-bold text-[#8B5A2B] bg-black/5 border border-black/15 px-3.5 py-1.5 rounded-[8px]">
                      {certRequests.length} pending request{certRequests.length !== 1 ? "s" : ""}
                   </span>
                </div>

                <div className="grid gap-[24px]">
                   {certRequests.length === 0 ? (
                      <div className="py-[80px] text-center bg-white border border-black/10 rounded-[16px] text-xs text-black/50 font-medium">
                         No pending certificate requests at this time.
                      </div>
                   ) : (
                      certRequests.map(req => {
                         // Compute student eligibility parameters

                         // Internship tasks check
                         const courseProjectTasks = req.courses?.project_tasks || [];
                         const completedTasks = req.completed_tasks || [];
                         const completedTasksCount = courseProjectTasks.filter((t: string) => completedTasks.includes(t)).length;
                         const totalTasks = courseProjectTasks.length;
                         const isInternshipTasksCompleted = totalTasks === 0 || completedTasksCount >= totalTasks;

                         // Weekly updates check
                         const courseWeeklyUpdates = weeklyUpdates.filter((wu: any) => 
                           String(wu.student_id) === String(req.student_id) && 
                           String(wu.course_id) === String(req.course_id)
                         );
                         
                         const totalWeeks = req.courses?.timeline_weeks || 8;
                         const submittedUpdates = Array.from({ length: totalWeeks }, (_, idx) => {
                           const weekNum = idx + 1;
                           const update = courseWeeklyUpdates.find((wu: any) => wu.week_number === weekNum);
                           return {
                             weekNumber: weekNum,
                             status: update?.status || "none", // "submitted", "approved", "rejected", "none"
                           };
                         });

                         const approvedWeeksCount = submittedUpdates.filter(w => w.status === "approved").length;
                         const isWeeklyUpdatesCompleted = approvedWeeksCount >= totalWeeks;

                         const isEligible = isInternshipTasksCompleted && isWeeklyUpdatesCompleted;

                         return (
                            <div key={req.id} className="p-[28px] bg-white border border-black/15 rounded-[16px] flex flex-col xl:flex-row xl:items-center justify-between gap-6 shadow-sm hover:border-black/30 transition-all">
                               {/* Student & Course Details */}
                               <div className="space-y-3 xl:max-w-[280px] w-full">
                                  <div>
                                     <span className="text-[9px] font-bold text-[#8B5A2B] bg-black/5 border border-black/15 px-2.5 py-1 rounded-[6px] uppercase tracking-wider">
                                        Credential Gate
                                     </span>
                                     <h4 className="text-base font-bold text-black mt-2 truncate">{req.profiles?.full_name}</h4>
                                     <p className="text-xs font-medium text-[#8B5A2B] mt-0.5 line-clamp-1">{req.courses?.title}</p>
                                     <p className="text-[9px] text-black/40 font-mono mt-1">Enrollment ID: {req.id}</p>
                                  </div>

                                  {/* Eligibility Badge */}
                                  <div>
                                     {isEligible ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[20px] text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                                           <CheckCircle2 size={12} className="text-emerald-600" /> Eligible for Issuance
                                        </span>
                                     ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[20px] text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                                           <Loader2 size={12} className="text-amber-600 animate-spin" /> Verification Pending
                                        </span>
                                     )}
                                  </div>
                               </div>

                               {/* Verification Checklist */}
                               <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 border-y xl:border-y-0 xl:border-x border-black/10 py-4 xl:py-0 xl:px-6">

                                  {/* Internship Checklist Gate */}
                                  <div className="space-y-1.5">
                                     <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-black/60 text-[10px] uppercase tracking-wider">Internship Checklist</span>
                                        <span className={`font-bold ${isInternshipTasksCompleted ? "text-emerald-700" : "text-amber-700"}`}>
                                           {completedTasksCount} / {totalTasks}
                                        </span>
                                     </div>
                                     <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
                                        <div 
                                           className={`h-full rounded-full transition-all duration-300 ${isInternshipTasksCompleted ? "bg-emerald-600" : "bg-amber-500"}`}
                                           style={{ width: `${totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 100}%` }}
                                        />
                                     </div>
                                     <div className="text-[10px] text-black/50 flex items-center gap-1">
                                        {isInternshipTasksCompleted ? (
                                           <><CheckCircle2 size={10} className="text-emerald-600" /> All project tasks completed</>
                                        ) : (
                                           <><Circle size={10} className="text-amber-500" /> Complete all project tasks</>
                                        )}
                                     </div>
                                  </div>

                                  {/* Weekly Progress Logs Gate */}
                                  <div className="space-y-1.5">
                                     <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-black/60 text-[10px] uppercase tracking-wider">Weekly Updates</span>
                                        <span className={`font-bold ${isWeeklyUpdatesCompleted ? "text-emerald-700" : "text-amber-700"}`}>
                                           {approvedWeeksCount} / {totalWeeks} Approved
                                        </span>
                                     </div>
                                     <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
                                        <div 
                                           className={`h-full rounded-full transition-all duration-300 ${isWeeklyUpdatesCompleted ? "bg-emerald-600" : "bg-amber-500"}`}
                                           style={{ width: `${totalWeeks > 0 ? (approvedWeeksCount / totalWeeks) * 100 : 0}%` }}
                                        />
                                     </div>
                                     {/* Simple dots showing weeks submission status */}
                                     <div className="flex gap-1 items-center flex-wrap pt-0.5">
                                        {submittedUpdates.map((w, idx) => (
                                           <span 
                                              key={idx} 
                                              className={`w-4 h-4 rounded-full border text-[8px] flex items-center justify-center font-bold font-mono transition-all ${
                                                 w.status === "approved" 
                                                    ? "bg-emerald-500 border-emerald-600 text-white" 
                                                    : w.status === "submitted" 
                                                    ? "bg-amber-400 border-amber-500 text-amber-950 animate-pulse" 
                                                    : w.status === "rejected" 
                                                    ? "bg-rose-500 border-rose-600 text-white" 
                                                    : "bg-gray-100 border-gray-200 text-gray-400"
                                              }`}
                                              title={`Week ${w.weekNumber}: ${w.status}`}
                                           >
                                              {w.weekNumber}
                                           </span>
                                        ))}
                                     </div>
                                  </div>
                               </div>

                               {/* Action Drawer */}
                               <div className="flex xl:flex-col gap-2 shrink-0 xl:min-w-[140px]">
                                  <div className="flex flex-col gap-1 mb-1">
                                     <label className="text-[9px] font-bold text-[#8B5A2B] uppercase tracking-wider block">Set Score (%)</label>
                                     <input 
                                        type="number"
                                        min="0"
                                        max="100"
                                        placeholder="90"
                                        value={certScores[req.id] !== undefined ? certScores[req.id] : "90"}
                                        onChange={(e) => setCertScores({ ...certScores, [req.id]: e.target.value })}
                                        className="w-full bg-neutral-50 border border-black/20 px-3 py-1.5 rounded-[8px] text-xs font-semibold text-black focus:outline-none focus:border-black"
                                     />
                                  </div>
                                  <Button 
                                     size="sm" 
                                     className={`rounded-[10px] px-5 py-2.5 font-bold shadow-sm text-xs flex-1 transition-all ${
                                        isEligible 
                                           ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                                           : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed hover:bg-gray-100"
                                     }`} 
                                     disabled={!isEligible}
                                     onClick={() => handleGrade(req.id, certScores[req.id] || "90", "approved")}
                                  >
                                     Approve Node
                                  </Button>
                                  <Button 
                                     variant="outline" 
                                     size="sm" 
                                     className="rounded-[10px] px-5 py-2.5 font-bold border-rose-200 text-rose-600 hover:bg-rose-50 shadow-none text-xs flex-1" 
                                     onClick={() => handleGrade(req.id, "0", "rejected")}
                                  >
                                     Purge Request
                                  </Button>
                               </div>
                            </div>
                         );
                      })
                   )}
                 </div>
              </div>
           )}

          {activeTab === "enrollments" && (
             <div className="space-y-[32px]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-[16px]">
                   <h3 className="text-xl font-medium tracking-[-0.02em] text-black">Manual Enrollment Approvals</h3>
                   <div className="relative w-full md:w-96">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={14} />
                      <input 
                        type="text" 
                        placeholder="Search student or course..." 
                        className="w-full bg-white border border-black/20 pl-9 pr-4 py-2 rounded-[12px] text-xs font-normal focus:border-black outline-none transition-all text-black" 
                        value={enrollFilter}
                        onChange={(e) => setEnrollFilter(e.target.value)}
                      />
                   </div>
                </div>

                <div className="bg-white border border-black/20 rounded-[12px] overflow-hidden shadow-none">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="border-b border-black/10 bg-white text-[10px] font-medium uppercase tracking-wider text-black/60">
                            <th className="px-6 py-4">Student</th>
                            <th className="px-6 py-4">Course Track</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Enrolled At</th>
                            <th className="px-6 py-4">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-[#8B5A2B]/10">
                         {enrollments
                           .filter(e => {
                             if (!enrollFilter) return true;
                             const query = enrollFilter.toLowerCase();
                             return (
                               (e.student_name || "").toLowerCase().includes(query) ||
                               (e.student_email || "").toLowerCase().includes(query) ||
                               (e.student_phone || "").toLowerCase().includes(query) ||
                               (e.course_title || "").toLowerCase().includes(query)
                             );
                           })
                           .map(e => (
                            <tr key={e.id} className="hover:bg-neutral-50 transition-colors group">
                               <td className="px-6 py-3.5">
                                  <div className="font-medium text-xs text-black">{e.student_name}</div>
                                  <div className="text-[10px] text-black/50">{e.student_email} &middot; {e.student_phone}</div>
                               </td>
                               <td className="px-6 py-3.5 text-xs font-normal text-black">{e.course_title}</td>
                               <td className="px-6 py-3.5 text-xs font-semibold text-[#8B5A2B]">₹{e.course_price}</td>
                               <td className="px-6 py-3.5">
                                  <span className={`px-2 py-0.5 rounded-[12px] text-[10px] font-medium uppercase tracking-wider border ${
                                    e.payment_status === 'completed' || e.payment_status === 'success'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                      : 'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}>
                                     {e.payment_status}
                                  </span>
                               </td>
                               <td className="px-6 py-3.5 text-xs text-black/60">
                                 {e.enrolled_at ? new Date(e.enrolled_at).toLocaleDateString() : 'N/A'}
                               </td>
                               <td className="px-6 py-3.5">
                                  {e.payment_status !== 'completed' && e.payment_status !== 'success' ? (
                                    <div className="flex gap-2">
                                       <button 
                                         onClick={() => handleApprovePayment(e.id)} 
                                         className="px-2.5 py-1 text-[10px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-[6px] transition-colors"
                                       >
                                         Approve
                                       </button>
                                       <button 
                                         onClick={() => handleRejectPayment(e.id)} 
                                         className="px-2.5 py-1 text-[10px] font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-[6px] transition-colors"
                                       >
                                         Reject
                                       </button>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-emerald-600 font-medium">Access Granted</span>
                                  )}
                               </td>
                            </tr>
                          ))}
                      </tbody>
                   </table>
                   {enrollments.length === 0 && (
                     <div className="py-[64px] text-center text-xs text-black/60 font-medium">No enrollment records found.</div>
                   )}
                </div>
             </div>
          )}

          {activeTab === "branches" && (
            <div className="grid lg:grid-cols-[380px_1fr] gap-[32px]">
              
              {/* Left: Add / Edit Branch Form */}
              <div className="space-y-[24px]">
                <div>
                  <h3 className="text-xl font-medium tracking-[-0.02em] text-black">
                    {editingBranch ? "Edit Branch" : "Add New Branch"}
                  </h3>
                  <p className="text-xs text-black/50 mt-1">
                    Branches are department categories that courses are assigned to.
                  </p>
                </div>

                <form
                  onSubmit={editingBranch ? handleUpdateBranch : handleCreateBranch}
                  className="space-y-[14px] p-[24px] bg-white border border-black/20 rounded-[16px] shadow-none"
                >
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-widest block">Branch Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Computer Science"
                      required
                      className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-sm focus:outline-none focus:border-black text-black font-medium"
                      value={editingBranch ? editingBranch.name : newBranch.name}
                      onChange={(e) => editingBranch
                        ? setEditingBranch({ ...editingBranch, name: e.target.value })
                        : setNewBranch({ ...newBranch, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-widest block">Slug (URL Key)</label>
                    <input
                      type="text"
                      placeholder="e.g. computer-science"
                      required
                      className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-sm focus:outline-none focus:border-black text-black font-mono"
                      value={editingBranch ? editingBranch.slug : newBranch.slug}
                      onChange={(e) => editingBranch
                        ? setEditingBranch({ ...editingBranch, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })
                        : setNewBranch({ ...newBranch, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })
                      }
                    />
                    <p className="text-[9px] text-black/40 font-medium">Auto-generated from name. Only lowercase letters, numbers, hyphens.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-widest block">Description <span className="text-black/40 normal-case font-normal">(optional)</span></label>
                    <textarea
                      placeholder="Brief description of this branch..."
                      rows={3}
                      className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-sm focus:outline-none focus:border-black text-black font-medium resize-none"
                      value={editingBranch ? editingBranch.description || "" : newBranch.description}
                      onChange={(e) => editingBranch
                        ? setEditingBranch({ ...editingBranch, description: e.target.value })
                        : setNewBranch({ ...newBranch, description: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    {editingBranch && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingBranch(null)}
                        className="flex-1 h-10 rounded-[10px] text-xs font-bold border-black/20 text-black/70 hover:text-black shadow-none"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={branchSaving}
                      className="flex-1 h-10 rounded-[10px] font-bold text-xs bg-black text-white hover:bg-neutral-900 shadow-none"
                    >
                      {branchSaving ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : editingBranch ? (
                        <><Check size={14} className="mr-1.5" /> Save Changes</>
                      ) : (
                        <><GitBranch size={14} className="mr-1.5" /> Add Branch</>
                      )}
                    </Button>
                  </div>
                </form>

                {/* Stats summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-black/15 rounded-[12px] p-4 text-center">
                    <p className="text-2xl font-bold text-[#8B5A2B]">{departments.length}</p>
                    <p className="text-[10px] font-bold text-black/50 uppercase tracking-wider mt-0.5">Total Branches</p>
                  </div>
                  <div className="bg-white border border-black/15 rounded-[12px] p-4 text-center">
                    <p className="text-2xl font-bold text-[#8B5A2B]">{courses.length}</p>
                    <p className="text-[10px] font-bold text-black/50 uppercase tracking-wider mt-0.5">Total Courses</p>
                  </div>
                </div>
              </div>

              {/* Right: Branches List */}
              <div className="space-y-[20px]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-medium tracking-[-0.02em] text-black">All Branches</h3>
                  <span className="text-[10px] font-bold text-[#8B5A2B] bg-black/5 border border-black/10 px-3 py-1 rounded-[8px]">
                    {departments.length} branch{departments.length !== 1 ? "es" : ""}
                  </span>
                </div>

                {departments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 bg-white border border-dashed border-black/20 rounded-[16px] text-center space-y-3">
                    <GitBranch size={40} className="text-[#8B5A2B]/20" />
                    <p className="text-sm font-semibold text-black/40">No branches yet</p>
                    <p className="text-xs text-black/30">Add your first branch using the form on the left.</p>
                  </div>
                ) : (
                  <div className="space-y-[12px]">
                    {departments.map((dept) => {
                      const branchCourses = courses.filter((c: any) => String(c.dept_id) === String(dept.id));
                      const isEditing = editingBranch?.id === dept.id;
                      return (
                        <div
                          key={dept.id}
                          className={`bg-white border rounded-[14px] p-5 transition-all shadow-none ${isEditing ? "border-black/50 ring-2 ring-[#8B5A2B]/10" : "border-black/15 hover:border-black/30"}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="p-1.5 bg-black/8 rounded-[8px] text-[#8B5A2B]">
                                  <GitBranch size={14} />
                                </div>
                                <h4 className="text-sm font-bold text-black truncate">{dept.name}</h4>
                                <span className="text-[9px] font-bold text-[#8B5A2B] bg-black/8 border border-black/15 px-2 py-0.5 rounded-[6px] font-mono tracking-wide shrink-0">
                                  /{dept.slug}
                                </span>
                              </div>

                              {dept.description && (
                                <p className="text-xs text-black/60 leading-relaxed font-medium line-clamp-2">{dept.description}</p>
                              )}

                              <div className="flex items-center gap-3 pt-1">
                                <span className="text-[10px] font-bold text-black/50 flex items-center gap-1">
                                  <BookOpen size={10} />
                                  {branchCourses.length} course{branchCourses.length !== 1 ? "s" : ""}
                                </span>
                                {branchCourses.length > 0 && (
                                  <div className="flex gap-1 flex-wrap">
                                    {branchCourses.slice(0, 3).map((c: any) => (
                                      <span key={c.id} className="text-[9px] bg-white border border-black/10 text-black/60 px-2 py-0.5 rounded-[4px] truncate max-w-[120px]">
                                        {c.title}
                                      </span>
                                    ))}
                                    {branchCourses.length > 3 && (
                                      <span className="text-[9px] text-black/40 font-bold">+{branchCourses.length - 3} more</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => setEditingBranch({ id: dept.id, name: dept.name, slug: dept.slug, description: dept.description || "" })}
                                className="p-2 text-black/40 hover:text-[#8B5A2B] hover:bg-black/5 rounded-[8px] transition-all"
                                title="Edit branch"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteBranch(dept.id, dept.name)}
                                className="p-2 text-black/40 hover:text-red-600 hover:bg-red-50 rounded-[8px] transition-all"
                                title="Delete branch"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "offline_certificates" && (
            <div className="grid lg:grid-cols-[400px_1fr] gap-[32px] animate-in fade-in duration-300">
              
              {/* Left Column: Issuance Form */}
              <div className="space-y-[24px]">
                <div>
                  <h3 className="text-xl font-medium tracking-[-0.02em] text-black">Issue Offline Certificate</h3>
                  <p className="text-xs text-black/50 mt-1">
                    Directly register and generate verifiable credentials for offline internship students.
                  </p>
                </div>

                <form
                  onSubmit={handleGenerateOfflineCertificate}
                  className="space-y-[16px] p-[24px] bg-white border border-black/20 rounded-[16px] shadow-none"
                >
                  {offlineStatus && (
                    <div className={`p-3.5 rounded-[10px] text-xs font-semibold border ${
                      offlineStatus.type === "success" 
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                        : "bg-rose-50 text-rose-800 border-rose-200"
                    }`}>
                      {offlineStatus.message}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-widest block">Recipient Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sravan Reddy"
                      required
                      className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-sm focus:outline-none focus:border-black text-black font-medium"
                      value={offlineForm.fullName}
                      onChange={(e) => setOfflineForm({ ...offlineForm, fullName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-widest block">Recipient Email</label>
                    <input
                      type="email"
                      placeholder="e.g. sravan@gmail.com"
                      required
                      className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-sm focus:outline-none focus:border-black text-black font-medium"
                      value={offlineForm.email}
                      onChange={(e) => setOfflineForm({ ...offlineForm, email: e.target.value })}
                    />
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          const randomId = Math.random().toString(36).substring(2, 8);
                          setOfflineForm({ ...offlineForm, email: `offline_${randomId}@matrixroot.com` });
                        }}
                        className="text-[9px] text-[#8B5A2B] hover:underline font-bold"
                      >
                        Generate offline email
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-widest block">Phone Number <span className="text-black/40 normal-case font-normal">(optional)</span></label>
                    <input
                      type="text"
                      placeholder="e.g. +91 9876543210"
                      className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-sm focus:outline-none focus:border-black text-black font-medium"
                      value={offlineForm.phone}
                      onChange={(e) => setOfflineForm({ ...offlineForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-widest block">Course / Program Track</label>
                    <select
                      className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-sm focus:outline-none focus:border-black text-black font-medium"
                      value={offlineForm.courseId}
                      onChange={(e) => setOfflineForm({ ...offlineForm, courseId: e.target.value })}
                    >
                      <option value="">-- Use Custom Course Track --</option>
                      {courses.filter(c => !String(c.id).startsWith("temp-")).map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Custom Course Form Fields */}
                  {!offlineForm.courseId && (
                    <div className="space-y-[12px] p-3.5 bg-neutral-50 border border-black/10 rounded-[12px] animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-[#8B5A2B] uppercase tracking-wider block">Custom Course Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Advanced Embedded Systems"
                          required={!offlineForm.courseId}
                          className="w-full bg-white border border-black/20 p-2.5 rounded-[8px] text-xs focus:outline-none focus:border-black text-black font-medium"
                          value={offlineForm.customCourseTitle}
                          onChange={(e) => setOfflineForm({ ...offlineForm, customCourseTitle: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-[#8B5A2B] uppercase tracking-wider block">Custom Branch (Specialization)</label>
                        <input
                          type="text"
                          placeholder="e.g. Electronics Engineering"
                          required={!offlineForm.courseId}
                          className="w-full bg-white border border-black/20 p-2.5 rounded-[8px] text-xs focus:outline-none focus:border-black text-black font-medium"
                          value={offlineForm.customBranchName}
                          onChange={(e) => setOfflineForm({ ...offlineForm, customBranchName: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-widest block font-sans">Final Score (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required
                        className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-sm focus:outline-none focus:border-black text-black font-medium"
                        value={offlineForm.score}
                        onChange={(e) => setOfflineForm({ ...offlineForm, score: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-widest block">Issue Date</label>
                      <input
                        type="date"
                        required
                        className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-sm focus:outline-none focus:border-black text-black font-medium"
                        value={offlineForm.enrolledAt}
                        onChange={(e) => setOfflineForm({ ...offlineForm, enrolledAt: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={offlineGenerating}
                    className="w-full h-11 rounded-[12px] font-bold text-xs bg-black text-white hover:bg-neutral-900 shadow-none mt-2"
                  >
                    {offlineGenerating ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>Register & Generate Certificate</>
                    )}
                  </Button>
                </form>
              </div>

              {/* Right Column: Issued Registry */}
              <div className="space-y-[20px]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-[16px]">
                  <div>
                    <h3 className="text-xl font-medium tracking-[-0.02em] text-black">Verifiable Registry</h3>
                    <p className="text-xs text-black/50 mt-0.5">
                      {offlineCerts.length} active certificates registered.
                    </p>
                  </div>
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search recipient or course..." 
                      className="w-full bg-white border border-black/20 pl-9 pr-4 py-2 rounded-[12px] text-xs font-normal focus:border-black outline-none transition-all text-black" 
                      value={offlineCertsFilter}
                      onChange={(e) => setOfflineCertsFilter(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-white border border-black/20 rounded-[12px] overflow-hidden shadow-none">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-black/10 bg-white text-[10px] font-medium uppercase tracking-wider text-black/60">
                        <th className="px-6 py-4">Recipient</th>
                        <th className="px-6 py-4">Specialization</th>
                        <th className="px-6 py-4 text-center">Score</th>
                        <th className="px-6 py-4">Issue Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#8B5A2B]/10">
                      {offlineCerts
                        .filter(c => {
                          if (!offlineCertsFilter) return true;
                          const q = offlineCertsFilter.toLowerCase();
                          return (
                            (c.student_name || "").toLowerCase().includes(q) ||
                            (c.student_email || "").toLowerCase().includes(q) ||
                            (c.course_title || "").toLowerCase().includes(q) ||
                            (c.id || "").toLowerCase().includes(q)
                          );
                        })
                        .map(cert => (
                          <tr key={cert.id} className="hover:bg-neutral-50 transition-colors group">
                            <td className="px-6 py-3.5">
                              <div className="font-medium text-xs text-black">{cert.student_name}</div>
                              <div className="text-[10px] text-black/50 font-mono truncate max-w-[180px]" title={cert.student_email}>
                                {cert.student_email}
                              </div>
                            </td>
                            <td className="px-6 py-3.5">
                              <div className="text-xs text-black font-medium">{cert.course_title}</div>
                              <div className="text-[9px] text-[#8B5A2B] font-bold uppercase tracking-wider">{cert.branch_name}</div>
                            </td>
                            <td className="px-6 py-3.5 text-center text-xs font-bold text-black">{cert.final_score}%</td>
                            <td className="px-6 py-3.5 text-xs text-black/60 font-medium">
                              {cert.enrolled_at ? new Date(cert.enrolled_at).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                              }) : "N/A"}
                            </td>
                            <td className="px-6 py-3.5">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Download Trigger PDF */}
                                <CertificatePDF
                                  studentName={cert.student_name}
                                  courseName={cert.course_title}
                                  branch={cert.branch_name}
                                  score={cert.final_score}
                                  certId={cert.id}
                                  trigger={
                                    <button
                                      className="p-2 text-black/40 hover:text-black hover:bg-black/5 rounded-[8px] transition-all flex items-center justify-center"
                                      title="Download Certificate PDF"
                                    >
                                      <FileText size={14} />
                                    </button>
                                  }
                                />
                                <a
                                  href={`/verify/${cert.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-black/40 hover:text-[#8B5A2B] hover:bg-black/5 rounded-[8px] transition-all flex items-center justify-center"
                                  title="Open Public Verification Page"
                                >
                                  <ExternalLink size={14} />
                                </a>
                                <button
                                  onClick={() => handleRevokeOfflineCertificate(cert.id)}
                                  className="p-2 text-black/40 hover:text-red-600 hover:bg-red-50 rounded-[8px] transition-all flex items-center justify-center"
                                  title="Revoke Certificate"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {offlineCerts.length === 0 && (
                    <div className="py-[64px] text-center text-xs text-black/60 font-medium">No certificates issued yet. Fill the form on the left to get started.</div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* Base Track Modal Subsystem */}
      {isBaseTrackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
          <div 
            className="w-[90%] h-[85%] bg-white border border-black/20 rounded-[16px] shadow-2xl flex flex-col overflow-hidden text-black animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-black/15 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold tracking-tight text-black flex items-center gap-2">
                <Sparkles className="text-[#8B5A2B]" size={18} /> Create New Course
              </h3>
              <button 
                onClick={() => setIsBaseTrackModalOpen(false)}
                className="text-black/60 hover:text-black transition-colors p-1 hover:bg-black/5 rounded-[6px]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content (Two Column) */}
            <div className="flex-1 overflow-y-auto p-8 bg-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                {/* Left Column (Core Meta) */}
                <div className="space-y-6 flex flex-col">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#8B5A2B] uppercase tracking-wider">Internship Name</label>
                    <input 
                      type="text" 
                      value={trackTitle}
                      onChange={(e) => setTrackTitle(e.target.value)}
                      placeholder="e.g., Full Stack Development" 
                      className="w-full bg-neutral-50 border border-black/20 rounded-[12px] p-3 text-sm focus:outline-none focus:border-black text-black font-medium placeholder-black/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#8B5A2B] uppercase tracking-wider">Department</label>
                    <select 
                      value={focusDomain}
                      onChange={(e) => setFocusDomain(e.target.value)}
                      className="w-full bg-neutral-50 border border-black/20 rounded-[12px] p-3 text-sm focus:outline-none focus:border-black text-black font-medium"
                    >
                      <option value="Software Engineering">Software Engineering</option>
                      <option value="AI & Automation">AI & Automation</option>
                      <option value="System Architecture">System Architecture</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#8B5A2B] uppercase tracking-wider block">Duration Scheme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {["30-Day Sprint", "60-Day Deep Dive", "90-Day Enterprise"].map((dur) => (
                        <label 
                          key={dur} 
                          className={`flex flex-col items-center justify-center p-4 rounded-[12px] border text-xs font-medium cursor-pointer transition-all ${
                            trackDuration === dur 
                              ? "border-black bg-black/5 text-[#8B5A2B]" 
                              : "border-black/20 bg-white text-black/60 hover:border-black/40"
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="duration" 
                            value={dur}
                            checked={trackDuration === dur}
                            onChange={() => setTrackDuration(dur)}
                            className="sr-only" 
                          />
                          <span>{dur}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#8B5A2B] uppercase tracking-wider">Reference GitHub URL</label>
                    <input 
                      type="text" 
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="e.g., https://github.com/matrixroot/boilerplate" 
                      className="w-full bg-neutral-50 border border-black/20 rounded-[12px] p-3 text-sm focus:outline-none focus:border-black text-black font-medium placeholder-black/30"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[#8B5A2B] uppercase tracking-wider block">Duration (Weeks)</label>
                      <input 
                        type="number" 
                        value={timelineWeeks}
                        onChange={(e) => setTimelineWeeks(parseInt(e.target.value) || 0)}
                        placeholder="e.g., 8" 
                        min="1"
                        className="w-full bg-neutral-50 border border-black/20 rounded-[12px] p-3 text-sm focus:outline-none focus:border-black text-black font-medium placeholder-black/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[#8B5A2B] uppercase tracking-wider block">Price (INR)</label>
                      <input 
                        type="number" 
                        value={trackPrice}
                        onChange={(e) => setTrackPrice(parseInt(e.target.value) || 0)}
                        placeholder="e.g., 500" 
                        min="0"
                        className="w-full bg-neutral-50 border border-black/20 rounded-[12px] p-3 text-sm focus:outline-none focus:border-black text-black font-medium placeholder-black/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-black/10">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#8B5A2B] uppercase tracking-wider block">Internship Blueprints</label>
                      <button 
                        type="button"
                        onClick={() => setProblemStatements([...problemStatements, ""])}
                        className="px-2.5 py-0.5 text-[10px] font-bold bg-black/10 text-[#8B5A2B] border border-black/20 rounded-[6px] hover:bg-black/25 transition-all"
                      >
                        + Add Blueprint
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                      {problemStatements.map((statement, idx) => (
                        <div key={idx} className="flex gap-2 items-start bg-neutral-50 p-2.5 rounded-[8px] border border-black/20">
                          <textarea
                            value={statement}
                            onChange={(e) => {
                              const updated = [...problemStatements];
                              updated[idx] = e.target.value;
                              setProblemStatements(updated);
                            }}
                            placeholder={`Blueprint Statement ${idx + 1}...`}
                            className="flex-1 bg-transparent border-0 text-xs text-black focus:outline-none resize-none min-h-[36px] placeholder-black/30 font-medium"
                          />
                          {problemStatements.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setProblemStatements(problemStatements.filter((_, i) => i !== idx))}
                              className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-500/10 transition-all self-center"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>


                </div>

                {/* Right Column (Operational Assets) */}
                <div className="space-y-6 flex flex-col h-full">
                  <div className="flex-1 flex flex-col space-y-2">
                    <label className="text-xs font-semibold text-[#8B5A2B] uppercase tracking-wider">Onboarding Instructions</label>
                    <textarea 
                      value={welcomeInstructions}
                      onChange={(e) => setWelcomeInstructions(e.target.value)}
                      placeholder="Enter raw welcome instructions or onboarding markdown text here..." 
                      className="flex-1 min-h-[200px] w-full bg-neutral-50 border border-black/20 rounded-[12px] p-3 text-sm focus:outline-none focus:border-black text-black font-medium resize-none placeholder-black/30"
                    />
                  </div>

                  <div className="space-y-2 shrink-0">
                    <label className="text-xs font-semibold text-[#8B5A2B] uppercase tracking-wider block">Activation Status</label>
                    <div className="flex items-center justify-between bg-neutral-50 border border-black/20 rounded-[12px] p-3.5">
                      <span className="text-xs font-semibold text-black">
                        {activationStatus ? "Live - Accepting Token Access" : "Draft - Hidden from Portal"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActivationStatus(!activationStatus)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          activationStatus ? 'bg-black' : 'bg-black/20'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            activationStatus ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer / Actions */}
            <div className="p-6 border-t border-black/15 flex items-center justify-end gap-3 shrink-0 bg-white">
              <Button 
                variant="outline"
                onClick={() => setIsBaseTrackModalOpen(false)}
                className="rounded-[12px] border-black/20 hover:border-black/40 bg-transparent text-black/80 hover:text-black hover:bg-black/5 px-5 h-10 font-bold text-xs shadow-none transition-colors"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeployBaseTrack}
                className="rounded-[12px] bg-black hover:bg-neutral-900 text-white px-6 h-10 font-bold text-xs shadow-none border-none transition-colors"
              >
                Create New Course
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Editing Workspace Course Modal */}
      {editingWorkspaceCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
          <div 
            className="w-[90%] max-w-[650px] max-h-[85%] bg-white border border-black/20 rounded-[16px] shadow-2xl flex flex-col overflow-hidden text-black animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-black/15 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold tracking-tight text-black flex items-center gap-2">
                <Sparkles className="text-[#8B5A2B]" size={18} /> Manage Workspace: {editingWorkspaceCourse.title}
              </h3>
              <button 
                onClick={() => setEditingWorkspaceCourse(null)}
                className="text-black/60 hover:text-black transition-colors p-1 hover:bg-black/5 rounded-[6px]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleUpdateCourseWorkspace} className="flex-1 overflow-y-auto p-6 bg-white space-y-6">
              {/* Blueprints / Problem statements */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#8B5A2B] uppercase tracking-wider block">
                    Internship Blueprints
                  </label>
                  <button 
                    type="button"
                    onClick={() => setEditingWorkspaceCourse((prev: any) => ({
                      ...prev,
                      problem_statements: [...(prev.problem_statements || []), ""]
                    }))}
                    className="px-2.5 py-0.5 text-[10px] font-bold bg-black/10 text-[#8B5A2B] border border-black/20 rounded-[6px] hover:bg-black/25 transition-all"
                  >
                    + Add Blueprint
                  </button>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {(editingWorkspaceCourse.problem_statements || []).map((statement: string, idx: number) => (
                    <div key={idx} className="flex gap-2 items-start bg-neutral-50 p-2.5 rounded-[8px] border border-black/20">
                      <textarea
                        value={statement}
                        onChange={(e) => {
                          const updated = [...(editingWorkspaceCourse.problem_statements || [])];
                          updated[idx] = e.target.value;
                          setEditingWorkspaceCourse((prev: any) => ({ ...prev, problem_statements: updated }));
                        }}
                        placeholder={`Blueprint Statement ${idx + 1}...`}
                        className="flex-1 bg-transparent border-0 text-xs text-black focus:outline-none resize-none min-h-[36px] placeholder-black/30 font-medium"
                      />
                      {(editingWorkspaceCourse.problem_statements || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => setEditingWorkspaceCourse((prev: any) => ({
                            ...prev,
                            problem_statements: prev.problem_statements.filter((_: any, i: number) => i !== idx)
                          }))}
                          className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-500/10 transition-all self-center"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-black/15 flex items-center justify-end gap-3 shrink-0">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setEditingWorkspaceCourse(null)}
                  className="rounded-[12px] border-black/20 hover:border-black/40 bg-transparent text-black/80 hover:text-black hover:bg-black/5 px-5 h-10 font-bold text-xs shadow-none transition-colors"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="rounded-[12px] bg-black hover:bg-neutral-900 text-white px-6 h-10 font-bold text-xs shadow-none border-none transition-colors"
                >
                  Save Blueprints
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Module Modal ── */}
      {editingModule && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setEditingModule(null); }}
        >
          <div
            className="w-full max-w-lg bg-white border border-black/20 rounded-[20px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black/8 rounded-[10px]">
                  <Pencil size={16} className="text-[#8B5A2B]" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-[#8B5A2B] uppercase tracking-widest block">Edit Module</span>
                  <h3 className="text-sm font-bold text-black line-clamp-1">{editingModule.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setEditingModule(null)}
                className="p-1.5 text-black/40 hover:text-black hover:bg-black/5 rounded-[8px] transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleUpdateModule} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-widest block">Module Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phase 1: Basics"
                  className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-sm font-medium text-black focus:outline-none focus:border-black transition-colors"
                  value={editingModule.title}
                  onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-widest block">Description (optional)</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of the module..."
                  className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-sm font-medium text-black focus:outline-none focus:border-black resize-none transition-colors"
                  value={editingModule.description}
                  onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                />
              </div>

              {/* Order Index */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-widest block">Order Index (sorting)</label>
                <input
                  type="number"
                  required
                  className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-sm font-medium text-black focus:outline-none focus:border-black transition-colors"
                  value={editingModule.order_index}
                  onChange={(e) => setEditingModule({ ...editingModule, order_index: parseInt(e.target.value) || 0 })}
                />
              </div>

              {/* Has Assessment Checkbox */}
              <label className="flex items-center gap-3 p-3 bg-neutral-50 border border-black/10 rounded-[10px] cursor-pointer transition-all hover:bg-neutral-100">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-black/20 text-black focus:ring-0"
                  checked={editingModule.has_assessment}
                  onChange={(e) => setEditingModule({ ...editingModule, has_assessment: e.target.checked })}
                />
                <span className="text-xs font-semibold text-black">Requires assessment to unlock next module</span>
              </label>

              {/* Footer */}
              <div className="flex gap-2 pt-2 border-t border-black/10 sticky bottom-0 bg-white pb-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingModule(null)}
                  className="flex-1 h-10 rounded-[10px] text-xs font-bold border-black/20 shadow-none text-black/70"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editModuleSaving}
                  className="flex-1 h-10 rounded-[10px] text-xs font-bold bg-black text-white hover:bg-neutral-900 shadow-none"
                >
                  {editModuleSaving ? <Loader2 size={14} className="animate-spin" /> : <><Check size={13} className="mr-1.5" /> Save Changes</>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Lesson Modal ── */}
      {editingLesson && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setEditingLesson(null); }}
        >
          <div
            className="w-full max-w-lg bg-white border border-black/20 rounded-[20px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black/8 rounded-[10px]">
                  <Pencil size={16} className="text-[#8B5A2B]" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-[#8B5A2B] uppercase tracking-widest block">Edit Lesson</span>
                  <h3 className="text-sm font-bold text-black line-clamp-1">{editingLesson.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setEditingLesson(null)}
                className="p-1.5 text-black/40 hover:text-black hover:bg-black/5 rounded-[8px] transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleUpdateLesson} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              
              {/* Module selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-widest block">Module</label>
                <select
                  className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-sm font-medium text-black focus:outline-none focus:border-black transition-colors"
                  value={editingLesson.module_id || ""}
                  onChange={(e) => setEditingLesson({ ...editingLesson, module_id: e.target.value || null })}
                >
                  <option value="">Unassigned / General</option>
                  {modules.filter(m => String(m.course_id) === String(editingLesson.course_id)).map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-widest block">Lesson Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Introduction to APIs"
                  className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-sm font-medium text-black focus:outline-none focus:border-black transition-colors"
                  value={editingLesson.title}
                  onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                />
              </div>

              {/* Video URL */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-widest block">Video URL</label>
                <input
                  type="text"
                  placeholder="e.g. YouTube URL or video MP4 link"
                  className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-sm font-medium text-black focus:outline-none focus:border-black transition-colors"
                  value={editingLesson.content_url}
                  onChange={(e) => setEditingLesson({ ...editingLesson, content_url: e.target.value })}
                />
              </div>

              {/* Locked Start Time (seconds) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-widest block">Lock Start Time (seconds)</label>
                <input
                  type="number"
                  min={0}
                  className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-sm font-medium text-black focus:outline-none focus:border-black transition-colors"
                  value={editingLesson.start_seconds || 0}
                  onChange={(e) => setEditingLesson({ ...editingLesson, start_seconds: parseInt(e.target.value) || 0 })}
                />
              </div>

              {/* Order Index */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-widest block">Order Index (sorting)</label>
                <input
                  type="number"
                  required
                  className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-sm font-medium text-black focus:outline-none focus:border-black transition-colors"
                  value={editingLesson.order_index}
                  onChange={(e) => setEditingLesson({ ...editingLesson, order_index: parseInt(e.target.value) || 0 })}
                />
              </div>

              {/* Notes (Rich text editor) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-widest block">Lesson Notes / Study Material</label>
                <RichTextEditor
                  value={editingLesson.notes}
                  onChange={(val) => setEditingLesson({ ...editingLesson, notes: val })}
                  placeholder="Add lesson notes or study material..."
                />
              </div>

              {/* Checkboxes */}
              <div className="flex gap-5 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-black/20 text-black focus:ring-0" 
                    checked={editingLesson.is_preview} 
                    onChange={(e) => setEditingLesson({ ...editingLesson, is_preview: e.target.checked })} 
                  />
                  <span className="text-xs font-semibold text-black">Free preview</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-black/20 text-black focus:ring-0" 
                    checked={editingLesson.has_assignment} 
                    onChange={(e) => setEditingLesson({ ...editingLesson, has_assignment: e.target.checked })} 
                  />
                  <span className="text-xs font-semibold text-black">Requires assignment</span>
                </label>
              </div>

              {/* Footer */}
              <div className="flex gap-2 pt-2 border-t border-black/10 sticky bottom-0 bg-white pb-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingLesson(null)}
                  className="flex-1 h-10 rounded-[10px] text-xs font-bold border-black/20 shadow-none text-black/70"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editLessonSaving}
                  className="flex-1 h-10 rounded-[10px] text-xs font-bold bg-black text-white hover:bg-neutral-900 shadow-none"
                >
                  {editLessonSaving ? <Loader2 size={14} className="animate-spin" /> : <><Check size={13} className="mr-1.5" /> Save Changes</>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Course Modal ── */}
      {editingCourse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setEditingCourse(null); }}
        >
          <div
            className="w-full max-w-lg bg-white border border-black/20 rounded-[20px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black/8 rounded-[10px]">
                  <Pencil size={16} className="text-[#8B5A2B]" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-[#8B5A2B] uppercase tracking-widest block">Edit Internship</span>
                  <h3 className="text-sm font-bold text-black line-clamp-1">{editingCourse.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setEditingCourse(null)}
                className="p-1.5 text-black/40 hover:text-black hover:bg-black/5 rounded-[8px] transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Body */}
            <form onSubmit={handleUpdateCourse} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-widest block">Internship / Course Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full Stack Web Development"
                  className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-sm font-medium text-black focus:outline-none focus:border-black transition-colors"
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-widest block">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of the internship..."
                  className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-sm font-medium text-black focus:outline-none focus:border-black resize-none transition-colors"
                  value={editingCourse.description}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                />
              </div>

              {/* Cover Image URL */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-widest block flex items-center gap-1.5">
                  <ImageIcon size={11} /> Cover Image URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. /img/cover.png or https://images.unsplash.com/..."
                  className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-sm font-medium text-black focus:outline-none focus:border-black transition-colors"
                  value={editingCourse.video_url}
                  onChange={(e) => setEditingCourse({ ...editingCourse, video_url: e.target.value })}
                />
                {editingCourse.video_url && (
                  <div className="h-24 rounded-[8px] overflow-hidden border border-black/15 mt-2">
                    <img
                      src={getYouTubeThumbnail(editingCourse.video_url)}
                      alt="preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-widest block">Price (INR)</label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="e.g. 500"
                  className="w-full bg-neutral-50 border border-black/20 p-3 rounded-[10px] text-sm font-medium text-black focus:outline-none focus:border-black transition-colors"
                  value={editingCourse.price}
                  onChange={(e) => setEditingCourse({ ...editingCourse, price: parseInt(e.target.value) || 0 })}
                />
              </div>

              {/* Multi-Branch Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-widest block">
                  Branches <span className="text-black/40 normal-case font-normal">(select all that apply)</span>
                </label>
                {departments.length === 0 ? (
                  <p className="text-xs text-black/40 italic">No branches available. Add branches first.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {departments.map((dept) => {
                      const isSelected = (editingCourse.dept_ids || []).includes(dept.id);
                      return (
                        <label
                          key={dept.id}
                          className={`flex items-center gap-3 p-3 rounded-[10px] border cursor-pointer transition-all group ${
                            isSelected
                              ? "bg-black/5 border-black/30 text-[#8B5A2B]"
                              : "bg-white border-black/10 hover:border-black/25 text-black/70"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-all ${
                            isSelected ? "bg-black border-black" : "border-black/30 group-hover:border-black/60"
                          }`}>
                            {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
                          </div>
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={isSelected}
                            onChange={() => toggleEditCourseBranch(dept.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold block">{dept.name}</span>
                            <span className="text-[9px] font-mono text-black/40">/{dept.slug}</span>
                          </div>
                          {isSelected && (
                            <span className="text-[8px] font-bold text-[#8B5A2B] bg-black/10 px-2 py-0.5 rounded-full shrink-0">Selected</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}
                {(editingCourse.dept_ids || []).length === 0 && (
                  <p className="text-[9px] text-amber-600 font-medium flex items-center gap-1">
                    ⚠️ No branch selected. The course will appear under all or no filter.
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-2 pt-2 border-t border-black/10 sticky bottom-0 bg-white pb-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingCourse(null)}
                  className="flex-1 h-10 rounded-[10px] text-xs font-bold border-black/20 shadow-none text-black/70"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editCourseSaving}
                  className="flex-1 h-10 rounded-[10px] text-xs font-bold bg-black text-white hover:bg-neutral-900 shadow-none"
                >
                  {editCourseSaving ? <Loader2 size={14} className="animate-spin" /> : <><Check size={13} className="mr-1.5" /> Save Changes</>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
