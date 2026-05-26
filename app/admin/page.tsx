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
  gradeWeeklyUpdateAction
} from "./actions";

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
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/RichTextEditor";

export const dynamic = "force-dynamic";

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
  const [newLesson, setNewLesson] = useState({ course_id: "", module_id: "", title: "", content_url: "", notes: "", is_preview: false, has_assignment: false });
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

  useEffect(() => {
    checkAdmin();
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
          setSubmissions(joined);
          const readyForCert = enrolls.filter((e: any) => e.payment_status === 'completed' && !e.is_certified).map((e: any) => ({
            ...e, courses: allCourses.find((c: any) => String(c.id) === String(e.course_id)), profiles: profiles.find((p: any) => p.id === e.student_id)
          }));
          setCertRequests(readyForCert);
        }
        if (wu) setWeeklyUpdates(wu);
        if (profiles) setAllProfilesMeta(profiles);
        if (allCourses) setAllCoursesMeta(allCourses);
      }
    } catch (err) {
      console.error("Fetch Data Error:", err);
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
    const res = await createModuleAction(newModule);
    if (res.success) {
      alert("Module initialized successfully!");
      setNewModule({ course_id: "", title: "", description: "", has_assessment: false });
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

  if (loading) return <div className="min-h-screen bg-[#F9F5F0] flex items-center justify-center text-[#3D2B1F]"><Loader2 className="animate-spin text-[#8B4513]" /></div>;
  if (!isAdmin) return null;

  return (
    <div className="flex h-screen bg-[#F9F5F0] text-[#3D2B1F] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 hidden lg:flex flex-col border-r border-[#8B4513]/10 bg-white">
        <div className="p-6 flex items-center gap-3 border-b border-[#8B4513]/10">
          <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Logo" width={32} height={32} />
          <span className="font-medium text-lg text-[#3D2B1F]">Admin Console</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: "courses", label: "Program Tracks", icon: <BookOpen size={18} /> },
            { id: "lessons", label: "Curriculum Builder", icon: <PlusCircle size={18} /> },
            { id: "internship_tasks", label: "Internship Task List", icon: <Layers size={18} /> },
            { id: "students", label: "Scholar Directory", icon: <Users size={18} /> },
            { id: "grading", label: "Artifact Evaluation", icon: <FileCheck2 size={18} /> },
            { id: "certificates", label: "Issuance Approvals", icon: <Award size={18} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 min-h-[40px] rounded-[12px] text-xs font-medium transition-colors ${
                activeTab === tab.id ? "bg-[#8B4513]/5 text-[#8B4513] border border-[#8B4513]/10 font-semibold" : "text-[#3D2B1F]/70 hover:bg-[#8B4513]/5 hover:text-[#3D2B1F]"
              }`}
            >
              <span className="text-[#8B4513]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#8B4513]/10">
          <Button variant="outline" size="sm" className="w-full text-xs rounded-[12px] border-[#8B4513]/20 shadow-none" onClick={() => window.location.href='/dashboard'}>
            <ArrowLeft size={14} className="mr-2 text-[#8B4513]" /> Exit to Portal
          </Button>
        </div>
      </aside>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-[#3D2B1F]/40 backdrop-blur-sm" />
          <div 
            className="absolute top-0 left-0 bottom-0 w-72 bg-white flex flex-col border-r border-[#8B4513]/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex items-center justify-between border-b border-[#8B4513]/10">
              <div className="flex items-center gap-3">
                <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Logo" width={32} height={32} />
                <span className="font-medium text-lg text-[#3D2B1F]">Admin</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-[#3D2B1F]/40 hover:text-[#3D2B1F]">
                <X size={20} />
              </button>
            </div>
            
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {[
                { id: "courses", label: "Program Tracks", icon: <BookOpen size={18} /> },
                { id: "lessons", label: "Curriculum Builder", icon: <PlusCircle size={18} /> },
                { id: "internship_tasks", label: "Internship Task List", icon: <Layers size={18} /> },
                { id: "students", label: "Scholar Directory", icon: <Users size={18} /> },
                { id: "grading", label: "Artifact Evaluation", icon: <FileCheck2 size={18} /> },
                { id: "certificates", label: "Issuance Approvals", icon: <Award size={18} /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 min-h-[40px] rounded-[12px] text-xs font-medium transition-colors ${
                    activeTab === tab.id ? "bg-[#8B4513]/5 text-[#8B4513] border border-[#8B4513]/10 font-semibold" : "text-[#3D2B1F]/70 hover:bg-[#8B4513]/5 hover:text-[#3D2B1F]"
                  }`}
                >
                  <span className="text-[#8B4513]">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-[#8B4513]/10">
              <Button variant="outline" size="sm" className="w-full text-xs rounded-[12px] border-[#8B4513]/20 shadow-none" onClick={() => window.location.href='/dashboard'}>
                <ArrowLeft size={14} className="mr-2 text-[#8B4513]" /> Exit to Portal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 border-b border-[#8B4513]/10 bg-[#F9F5F0]/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-[#8B4513] hover:bg-[#8B4513]/5 rounded-[8px]"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#3D2B1F]">{activeTab} Supervision Node</h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-[#8B4513] bg-[#8B4513]/5 border border-[#8B4513]/10 px-2 py-0.5 rounded-[12px]">
               <ShieldCheck size={12} />
               Executive Clearances Active
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-[32px] md:p-[64px] space-y-[48px] pb-20">
          
          {activeTab === "courses" && (
            <div className="grid lg:grid-cols-[400px_1fr] gap-[32px]">
              <div className="space-y-[24px]">
                 <h3 className="text-xl font-medium tracking-[-0.02em] text-[#3D2B1F]">Add Internship / Course</h3>
                 <form onSubmit={handleCreateCourse} className="space-y-[16px] p-[24px] bg-white border border-[#8B4513]/20 rounded-[12px] shadow-none">
                    <input type="text" placeholder="Internship Name" className="w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 p-3 rounded-[12px] text-xs focus:outline-none focus:border-[#8B4513]" value={newCourse.title} onChange={(e) => setNewCourse({...newCourse, title: e.target.value})} required />
                    <textarea placeholder="Internship Description" className="w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 p-3 rounded-[12px] text-xs h-24 focus:outline-none focus:border-[#8B4513]" value={newCourse.description} onChange={(e) => setNewCourse({...newCourse, description: e.target.value})} required />
                    <select className="w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 p-3 rounded-[12px] text-xs focus:outline-none focus:border-[#8B4513]" value={newCourse.dept_id} onChange={(e) => setNewCourse({...newCourse, dept_id: e.target.value})} required>
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    
                    {/* Input to support visual Cover graphic Image URL */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-[#3D2B1F]/60 flex items-center gap-1">
                        <ImageIcon size={12} className="text-[#8B4513]" /> Cover Image URL
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. /img/cover.png or Unsplash URL" 
                        className="w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 p-3 rounded-[12px] text-xs focus:outline-none focus:border-[#8B4513]" 
                        value={newCourse.video_url} 
                        onChange={(e) => setNewCourse({...newCourse, video_url: e.target.value})} 
                      />
                    </div>

                    {/* Input to support Price */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-[#3D2B1F]/60 flex items-center gap-1">
                        Price (INR)
                      </label>
                      <input 
                        type="number" 
                        placeholder="e.g. 500" 
                        min="0"
                        className="w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 p-3 rounded-[12px] text-xs focus:outline-none focus:border-[#8B4513]" 
                        value={newCourse.price} 
                        onChange={(e) => setNewCourse({...newCourse, price: parseInt(e.target.value) || 0})} 
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full h-10 rounded-[12px] font-medium text-xs bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] shadow-none mt-2">Add Course</Button>
                 </form>
              </div>
              <div className="space-y-[24px]">
                 <h3 className="text-xl font-medium tracking-[-0.02em] text-[#3D2B1F]">Managed Allocations</h3>
                 <div className="grid sm:grid-cols-2 gap-[16px]">
                    {courses.map(c => (
                      <div key={c.id} className="p-[24px] bg-white border border-[#8B4513]/20 rounded-[12px] hover:border-[#8B4513]/40 transition-colors shadow-none flex flex-col justify-between">
                        <div>
                          {c.video_url && (
                            <div className="h-32 w-full rounded-[8px] overflow-hidden mb-[16px] border border-[#8B4513]/10 relative bg-[#F9F5F0]">
                              <img src={getYouTubeThumbnail(c.video_url)} alt={c.title} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex items-center justify-between mb-[8px]">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-medium text-[#8B4513] uppercase tracking-wider bg-[#8B4513]/5 border border-[#8B4513]/10 px-2 py-0.5 rounded-[12px]">
                                {c.departments?.name || "Foundational"}
                              </span>
                              <span className="text-[9px] font-bold text-gray-500 bg-gray-100 border border-gray-200/60 px-2 py-0.5 rounded-[12px]">
                                {c.timeline_weeks ?? 8} Weeks
                              </span>
                              {c.problem_statements && c.problem_statements.length > 0 && (
                                <span className="text-[9px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-[12px]">
                                  {c.problem_statements.length} Blueprints
                                </span>
                              )}
                            </div>
                            <button onClick={() => handleDeleteCourse(c.id)} className="text-[#8B4513] hover:bg-[#8B4513]/5 p-1 rounded-[6px] transition-colors" title="Purge Program">
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <h4 className="font-medium text-base tracking-[-0.02em] text-[#3D2B1F] mb-[8px]">{c.title}</h4>
                          <p className="text-xs text-[#3D2B1F]/80 line-clamp-2 leading-[1.6]">{c.description}</p>
                          
                          <div className="mt-4 pt-3 border-t border-[#8B4513]/10 flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-[#8B4513]">Price: {c.price ?? 500}</span>
                            <div className="flex items-center gap-1.5">
                              <input 
                                type="number"
                                className="w-16 bg-[#F9F5F0]/50 border border-[#8B4513]/20 px-2 py-0.5 rounded-[6px] text-[10px] focus:outline-none focus:border-[#8B4513] text-right font-semibold"
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
                              <span className="text-[9px] text-[#3D2B1F]/50 font-medium">INR</span>
                            </div>
                          </div>

                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingWorkspaceCourse({
                                id: c.id,
                                title: c.title,
                                problem_statements: c.problem_statements || [""]
                              })}
                              className="flex-1 py-1.5 text-center text-[10px] font-bold bg-[#8B4513]/5 text-[#8B4513] border border-[#8B4513]/15 rounded-[8px] hover:bg-[#8B4513]/10 transition-colors"
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
              <div className="bg-white border border-[#8B4513]/20 rounded-[14px] p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="shrink-0">
                  <span className="text-[10px] font-bold text-[#8B4513] uppercase tracking-widest block">Working Course</span>
                  <p className="text-xs text-[#3D2B1F]/50 mt-0.5">Select a course to manage its modules and lessons</p>
                </div>
                <select
                  className="flex-1 w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 p-3 rounded-[10px] text-sm font-semibold text-[#3D2B1F] focus:outline-none focus:border-[#8B4513]"
                  value={selectedCourseFilter}
                  onChange={(e) => handleSelectCourse(e.target.value)}
                >
                  <option value="">Select a course to get started</option>
                  {courses.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>

                <Button
                  onClick={() => setIsBaseTrackModalOpen(true)}
                  className="shrink-0 rounded-[10px] px-5 h-10 font-semibold bg-[#8B4513] text-white hover:bg-[#72360f] shadow-none text-xs"
                >
                  + New Course
                </Button>
              </div>

              {!selectedCourseFilter ? (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
                  <BookOpen size={40} className="text-[#8B4513]/20" />
                  <p className="text-sm font-semibold text-[#3D2B1F]/40">Select a course above to manage its curriculum</p>
                </div>
              ) : (
                <div className="space-y-8">

                  {/* Add Module + Add Lesson side by side */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="pb-2 border-b border-[#8B4513]/10">
                        <h3 className="text-sm font-bold text-[#3D2B1F]">1. Add Module</h3>
                        <p className="text-[10px] text-[#3D2B1F]/50 mt-0.5">Group lessons into a named chapter or phase</p>
                      </div>
                      <form onSubmit={handleCreateModule} className="space-y-3 bg-white border border-[#8B4513]/15 rounded-[12px] p-5">
                        <input
                          type="text"
                          placeholder="Module name (e.g. Phase 1: Fundamentals)"
                          className="w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 p-3 rounded-[10px] text-xs focus:outline-none focus:border-[#8B4513] text-[#3D2B1F] font-medium"
                          value={newModule.title}
                          onChange={(e) => setNewModule({...newModule, title: e.target.value})}
                          required
                        />
                        <textarea
                          placeholder="Module description (optional)"
                          className="w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 p-3 rounded-[10px] text-xs h-14 focus:outline-none focus:border-[#8B4513] text-[#3D2B1F] resize-none"
                          value={newModule.description}
                          onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                        />
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 rounded border-[#8B4513]/20" checked={newModule.has_assessment} onChange={(e) => setNewModule({...newModule, has_assessment: e.target.checked})} />
                          <span className="text-xs font-medium text-[#3D2B1F]">Requires assessment to unlock next module</span>
                        </label>
                        <Button type="submit" className="w-full h-9 rounded-[10px] font-semibold text-xs bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] shadow-none">
                          Add Module
                        </Button>
                      </form>
                    </div>

                    <div className="space-y-3">
                      <div className="pb-2 border-b border-[#8B4513]/10">
                        <h3 className="text-sm font-bold text-[#3D2B1F]">2. Add Lesson</h3>
                        <p className="text-[10px] text-[#3D2B1F]/50 mt-0.5">Add a video lesson inside a module</p>
                      </div>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        const res = await createLessonAction(newLesson);
                        if (res.success) {
                          setNewLesson({ ...newLesson, title: "", content_url: "", notes: "", has_assignment: false });
                          fetchData();
                        } else {
                          alert("Error: " + res.error);
                        }
                      }} className="space-y-3 bg-white border border-[#8B4513]/15 rounded-[12px] p-5">
                        <select
                          className="w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 p-3 rounded-[10px] text-xs focus:outline-none focus:border-[#8B4513] text-[#3D2B1F] font-medium"
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
                          className="w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 p-3 rounded-[10px] text-xs focus:outline-none focus:border-[#8B4513] text-[#3D2B1F] font-medium"
                          value={newLesson.title}
                          onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                          required
                        />
                        <input
                          type="text"
                          placeholder="Video URL (YouTube, MP4, etc.)"
                          className="w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 p-3 rounded-[10px] text-xs focus:outline-none focus:border-[#8B4513] text-[#3D2B1F] font-medium"
                          value={newLesson.content_url}
                          onChange={(e) => setNewLesson({...newLesson, content_url: e.target.value})}
                        />
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-[#8B4513] uppercase tracking-wider block">Lesson Notes / Study Material</label>
                          <RichTextEditor
                            value={newLesson.notes}
                            onChange={(val) => setNewLesson({...newLesson, notes: val})}
                            placeholder="Add lesson notes or study material..."
                          />
                        </div>
                        <div className="flex gap-5 pt-1">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-[#8B4513]/20" checked={newLesson.is_preview} onChange={(e) => setNewLesson({...newLesson, is_preview: e.target.checked})} />
                            <span className="text-xs font-medium text-[#3D2B1F]">Free preview</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-[#8B4513]/20" checked={newLesson.has_assignment} onChange={(e) => setNewLesson({...newLesson, has_assignment: e.target.checked})} />
                            <span className="text-xs font-medium text-[#3D2B1F]">Requires assignment</span>
                          </label>
                        </div>
                        <Button type="submit" className="w-full h-9 rounded-[10px] font-semibold text-xs bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] shadow-none">
                          Add Lesson
                        </Button>
                      </form>
                    </div>
                  </div>

                  {/* Full-width Curriculum Structure */}
                  <div className="space-y-4">
                    <div className="pb-2 border-b border-[#8B4513]/10 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-[#3D2B1F]">Curriculum Structure</h3>
                        <p className="text-[10px] text-[#3D2B1F]/50 mt-0.5">{courses.find(c => c.id === selectedCourseFilter)?.title}</p>
                      </div>
                      <span className="text-[10px] font-bold text-[#8B4513] bg-[#8B4513]/5 border border-[#8B4513]/15 px-3 py-1.5 rounded-[8px]">
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
                          <div className="text-center py-14 bg-white border border-dashed border-[#8B4513]/20 rounded-[12px] text-[#3D2B1F]/40 text-xs">
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
                              <div key={mod.id} className="bg-white border border-[#8B4513]/15 rounded-[12px] overflow-hidden shadow-sm flex flex-col">
                                <div className="flex items-center justify-between px-4 py-3 bg-[#F9F5F0]/60 border-b border-[#8B4513]/10">
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-[#3D2B1F] truncate">{mod.title}</div>
                                    {mod.has_assessment && (
                                      <span className="text-[9px] font-semibold text-[#8B4513]">Assessment Required</span>
                                    )}
                                  </div>
                                  <button onClick={() => handleDeleteModule(mod.id)} className="p-1 text-[#8B4513]/40 hover:text-red-600 hover:bg-red-50 rounded transition-all shrink-0 ml-2" title="Delete module">
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                                <div className="p-3 space-y-1 flex-1">
                                  {modLessons.length === 0 ? (
                                    <div className="text-[10px] text-[#3D2B1F]/30 italic py-3 text-center">No lessons yet</div>
                                  ) : modLessons.map((lsn, i) => (
                                    <div key={lsn.id} className="flex items-start justify-between p-2 rounded-[8px] hover:bg-[#F9F5F0]/70 group transition-colors">
                                      <div className="flex items-start gap-2 min-w-0">
                                        <span className="text-[9px] font-bold text-[#8B4513]/40 mt-0.5 shrink-0 w-4 text-center">{i + 1}</span>
                                        <div className="min-w-0">
                                          <div className="text-xs font-medium text-[#3D2B1F] truncate">{lsn.title}</div>
                                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                            {lsn.content_url && <span className="text-[9px] text-[#3D2B1F]/40">ðŸŽ¥ Video</span>}
                                            {lsn.notes && <span className="text-[9px] text-[#3D2B1F]/40">ðŸ“ Notes</span>}
                                            {lsn.is_preview && <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 rounded-[4px]">Preview</span>}
                                            {lsn.has_assignment && <span className="text-[9px] font-bold text-[#8B4513] bg-[#8B4513]/5 border border-[#8B4513]/15 px-1.5 rounded-[4px]">Assignment</span>}
                                          </div>
                                        </div>
                                      </div>
                                      <button onClick={() => handleDeleteLesson(lsn.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 rounded transition-all shrink-0">
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                          {unassigned.length > 0 && (
                            <div className="bg-white border border-dashed border-[#8B4513]/20 rounded-[12px] overflow-hidden">
                              <div className="px-4 py-3 border-b border-[#8B4513]/10">
                                <div className="text-xs font-bold text-[#3D2B1F]/50">Unassigned Lessons</div>
                              </div>
                              <div className="p-3 space-y-1">
                                {unassigned.map((lsn) => (
                                  <div key={lsn.id} className="flex items-center justify-between p-2 rounded-[8px] hover:bg-[#F9F5F0]/70 group transition-colors">
                                    <span className="text-xs text-[#3D2B1F]/70 truncate">{lsn.title}</span>
                                    <button onClick={() => handleDeleteLesson(lsn.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 rounded transition-all shrink-0">
                                      <Trash2 size={11} />
                                    </button>
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
                   <h3 className="text-xl font-medium tracking-[-0.02em] text-[#3D2B1F]">Authenticated Identities Directory</h3>
                   <div className="relative w-full md:w-96">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D2B1F]/40" size={14} />
                      <input type="text" placeholder="Filter parameters..." className="w-full bg-white border border-[#8B4513]/20 pl-9 pr-4 py-2 rounded-[12px] text-xs font-normal focus:border-[#8B4513] outline-none transition-all text-[#3D2B1F]" />
                   </div>
                </div>

                <div className="bg-white border border-[#8B4513]/20 rounded-[12px] overflow-hidden shadow-none">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="border-b border-[#8B4513]/10 bg-[#F9F5F0] text-[10px] font-medium uppercase tracking-wider text-[#3D2B1F]/60">
                            <th className="px-6 py-4">Identity String</th>
                            <th className="px-6 py-4">Domain Association</th>
                            <th className="px-6 py-4">Clearance Role</th>
                            <th className="px-6 py-4">Node Link Status</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-[#8B4513]/10">
                         {students.map(s => (
                           <tr key={s.id} className="hover:bg-[#F9F5F0]/50 transition-colors group">
                              <td className="px-6 py-3.5">
                                 <div className="font-medium text-xs text-[#3D2B1F]">{s.full_name || "Unverified Key"}</div>
                                 <div className="text-[10px] text-[#3D2B1F]/50">{s.id.substring(0,18)}...</div>
                              </td>
                              <td className="px-6 py-3.5 text-xs font-normal text-[#3D2B1F]">{s.department_slug?.toUpperCase() || "UNASSIGNED"}</td>
                              <td className="px-6 py-3.5">
                                 <span className={`px-2 py-0.5 rounded-[12px] text-[10px] font-medium uppercase tracking-wider border ${s.role === 'admin' ? 'bg-[#8B4513]/10 text-[#8B4513] border-[#8B4513]/20' : 'bg-[#F9F5F0] text-[#3D2B1F]/80 border-[#8B4513]/10'}`}>
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
                     <div className="py-[64px] text-center text-xs text-[#3D2B1F]/60 font-medium">Directory returns blank data array.</div>
                   )}
                </div>
             </div>
          )}

          {activeTab === "internship_tasks" && (
             <div className="space-y-[32px]">
                <div className="bg-white border border-[#8B4513]/20 rounded-[14px] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                   <div className="shrink-0">
                      <h3 className="text-sm font-bold text-[#8B4513] uppercase tracking-widest block">Working Course Workspace</h3>
                      <p className="text-xs text-[#3D2B1F]/50 mt-0.5 font-medium">Select a track to configure guidelines, blueprints, and weekly screenshot tasks.</p>
                   </div>
                   <select
                      className="flex-1 w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 p-3 rounded-[10px] text-sm font-semibold text-[#3D2B1F] focus:outline-none focus:border-[#8B4513]"
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
                         <div className="bg-white border border-[#8B4513]/20 rounded-[12px] p-6 space-y-4 shadow-none">
                            <h4 className="text-sm font-bold text-[#3D2B1F] border-b border-[#8B4513]/10 pb-2 uppercase tracking-wider flex items-center gap-2">
                               <FileText size={16} className="text-[#8B4513]" /> Guidelines Document
                            </h4>
                            <div className="space-y-3">
                               <div className="flex flex-col sm:flex-row gap-3">
                                  <label className="flex items-center justify-center border border-[#8B4513]/20 border-dashed hover:border-[#8B4513]/40 rounded-[8px] cursor-pointer bg-[#F9F5F0]/30 h-10 px-4 transition-all shrink-0">
                                     <span className="text-xs font-bold text-[#3D2B1F]/70">{uploadingDoc ? "Uploading..." : "Upload PDF/Doc"}</span>
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
                                     className="flex-1 bg-[#F9F5F0]/50 border border-[#8B4513]/20 px-3 py-2 rounded-[8px] text-xs focus:outline-none focus:border-[#8B4513] text-[#3D2B1F] font-medium"
                                     value={courseFileUrl}
                                     onChange={(e) => setCourseFileUrl(e.target.value)}
                                  />
                               </div>
                               {courseFileUrl && (
                                  <div className="flex items-center justify-between bg-[#F9F5F0]/30 border border-[#8B4513]/10 rounded-[8px] p-2.5">
                                     <a href={courseFileUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#8B4513] hover:underline truncate max-w-[280px]">
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
                         <div className="bg-white border border-[#8B4513]/20 rounded-[12px] p-6 space-y-4 shadow-none">
                            <div className="flex items-center justify-between border-b border-[#8B4513]/10 pb-2">
                               <h4 className="text-sm font-bold text-[#3D2B1F] uppercase tracking-wider flex items-center gap-2">
                                  <Sparkles size={16} className="text-[#8B4513]" /> Internship Blueprints
                               </h4>
                               <button 
                                  type="button"
                                  onClick={() => setCourseBlueprints([...courseBlueprints, ""])}
                                  className="px-2.5 py-0.5 text-[10px] font-bold bg-[#8B4513]/10 text-[#8B4513] border border-[#8B4513]/20 rounded-[6px] hover:bg-[#8B4513]/25 transition-all"
                               >
                                  + Add Blueprint
                               </button>
                            </div>

                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                               {courseBlueprints.map((blueprint, idx) => (
                                  <div key={idx} className="flex gap-2 items-start bg-[#F9F5F0]/30 p-3 rounded-[8px] border border-[#8B4513]/20">
                                     <textarea
                                        value={blueprint}
                                        onChange={(e) => {
                                           const updated = [...courseBlueprints];
                                           updated[idx] = e.target.value;
                                           setCourseBlueprints(updated);
                                        }}
                                        placeholder={`Blueprint Question / Statement ${idx + 1}...`}
                                        className="flex-1 bg-transparent border-0 text-xs text-[#3D2B1F] focus:outline-none resize-none min-h-[50px] placeholder-[#3D2B1F]/30 font-medium"
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
                         <div className="bg-white border border-[#8B4513]/20 rounded-[12px] p-6 space-y-4 shadow-none">
                            <div className="flex items-center justify-between border-b border-[#8B4513]/10 pb-2">
                               <h4 className="text-sm font-bold text-[#3D2B1F] uppercase tracking-wider flex items-center gap-2">
                                  <Layers size={16} className="text-[#8B4513]" /> Roadmap Project Tasks
                               </h4>
                               <button 
                                  type="button"
                                  onClick={() => setCourseMainTasks([...courseMainTasks, ""])}
                                  className="px-2.5 py-0.5 text-[10px] font-bold bg-[#8B4513]/10 text-[#8B4513] border border-[#8B4513]/20 rounded-[6px] hover:bg-[#8B4513]/25 transition-all"
                               >
                                  + Add Task
                               </button>
                            </div>

                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                               {courseMainTasks.map((task, idx) => (
                                  <div key={idx} className="flex gap-2 items-center bg-[#F9F5F0]/30 p-2.5 rounded-[8px] border border-[#8B4513]/20">
                                     <input
                                        type="text"
                                        value={task}
                                        onChange={(e) => {
                                           const updated = [...courseMainTasks];
                                           updated[idx] = e.target.value;
                                           setCourseMainTasks(updated);
                                        }}
                                        placeholder={`Task ${idx + 1} description...`}
                                        className="flex-1 bg-transparent border-0 text-xs text-[#3D2B1F] focus:outline-none placeholder-[#3D2B1F]/30 font-medium"
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
                      <div className="bg-white border border-[#8B4513]/20 rounded-[12px] p-6 space-y-4 shadow-none flex flex-col justify-between">
                         <div className="space-y-4">
                            <h4 className="text-sm font-bold text-[#3D2B1F] border-b border-[#8B4513]/10 pb-2 uppercase tracking-wider flex items-center gap-2">
                               <Calendar size={16} className="text-[#8B4513]" /> Weekly Screenshot Tasks
                            </h4>
                            <p className="text-[11px] text-[#3D2B1F]/60">Define the screenshot submission prompts for each week. Students will be required to submit a proof image matching these prompts.</p>

                            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                               {courseWeeklyTasks.map((wtask, idx) => (
                                  <div key={idx} className="space-y-1.5 p-3.5 bg-[#F9F5F0]/30 rounded-[10px] border border-[#8B4513]/15">
                                     <span className="text-[10px] font-bold text-[#8B4513] uppercase tracking-wider block">Week {idx + 1} Deliverable Prompt</span>
                                     <textarea
                                        value={wtask}
                                        onChange={(e) => {
                                           const updated = [...courseWeeklyTasks];
                                           updated[idx] = e.target.value;
                                           setCourseWeeklyTasks(updated);
                                        }}
                                        placeholder={`Provide description of screenshot required from students in week ${idx + 1}...`}
                                        className="w-full bg-white border border-[#8B4513]/20 rounded-[8px] p-2 text-xs focus:border-[#8B4513] outline-none min-h-[60px] text-[#3D2B1F] font-medium"
                                     />
                                  </div>
                               ))}
                            </div>
                         </div>

                         <div className="pt-4 border-t border-[#8B4513]/10 flex justify-end">
                            <Button 
                               type="submit" 
                               disabled={savingTasks}
                               className="rounded-[10px] bg-[#8B4513] hover:bg-[#72360f] text-white px-8 h-10 font-bold text-xs shadow-md transition-colors"
                            >
                               {savingTasks ? "Saving configuration..." : "Save Workspace Configuration"}
                            </Button>
                         </div>
                      </div>
                   </form>
                ) : (
                   <div className="text-center py-20 bg-white border border-[#8B4513]/15 rounded-[12px] text-[#3D2B1F]/50 text-xs font-semibold">
                      Please select an academic course track from the dropdown above to manage its workspace tasks.
                   </div>
                )}
             </div>
          )}

          {activeTab === "grading" && (
             <div className="space-y-[24px]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#8B4513]/10 pb-4">
                   <div>
                      <h3 className="text-xl font-medium tracking-[-0.02em] text-[#3D2B1F]">Artifact Verification Pipeline</h3>
                      <p className="text-xs text-[#3D2B1F]/60 mt-1 font-medium">Verify lesson assignments and weekly internship screenshots submitted by students.</p>
                   </div>
                   
                   {/* Sub-view selection buttons */}
                   <div className="flex bg-[#F9F5F0] border border-[#8B4513]/15 rounded-[12px] p-1 gap-1">
                      <button 
                         onClick={() => setGradingSubView("lessons")}
                         className={`px-4 py-2 rounded-[8px] text-xs font-semibold transition-all ${
                            gradingSubView === "lessons" 
                               ? "bg-white text-[#8B4513] shadow-sm" 
                               : "text-[#3D2B1F]/60 hover:text-[#3D2B1F]"
                         }`}
                      >
                         Lesson Assignments
                      </button>
                      <button 
                         onClick={() => setGradingSubView("weekly")}
                         className={`px-4 py-2 rounded-[8px] text-xs font-semibold transition-all ${
                            gradingSubView === "weekly" 
                               ? "bg-white text-[#8B4513] shadow-sm" 
                               : "text-[#3D2B1F]/60 hover:text-[#3D2B1F]"
                         }`}
                      >
                         Weekly Screenshots
                      </button>
                   </div>
                </div>

                {gradingSubView === "lessons" ? (
                   <div className="grid gap-[24px]">
                      {submissions.length === 0 ? (
                        <div className="py-[64px] text-center bg-white border border-[#8B4513]/10 rounded-[12px] text-xs text-[#3D2B1F]/60 font-medium">Pipeline node idle.</div>
                      ) : (
                        submissions.map(sub => (
                          <div key={sub.id} className="p-[32px] bg-white border border-[#8B4513]/20 rounded-[12px] flex flex-col md:flex-row gap-[24px] justify-between shadow-none">
                             <div className="flex-1 space-y-[16px]">
                                <div>
                                   <h4 className="text-base font-medium text-[#3D2B1F]">{sub.profiles?.full_name || "Scholar"}</h4>
                                   <p className="text-xs font-medium text-[#8B4513] uppercase tracking-wider mt-0.5">{sub.lessons?.courses?.title}</p>
                                   <p className="text-xs text-[#3D2B1F]/70 mt-1">Scope Unit: {sub.lessons?.title}</p>
                                </div>
                                <div className="p-2.5 bg-[#F9F5F0] rounded-[12px] flex items-center justify-between border border-[#8B4513]/10">
                                   <span className="text-xs font-normal truncate pr-4 text-[#3D2B1F]">{sub.assignment_url}</span>
                                   <a href={sub.assignment_url} target="_blank" className="shrink-0 text-[#8B4513] p-1 hover:bg-white rounded-[6px]"><ExternalLink size={14} /></a>
                                </div>
                             </div>
                             <div className="flex items-center gap-4 shrink-0">
                                {sub.status === 'approved' ? (
                                   <div className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-[12px] font-medium text-xs uppercase tracking-wider">Signed Off</div>
                                ) : (
                                   <Button size="sm" className="rounded-[12px] px-6 font-medium bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] shadow-none text-xs" onClick={() => handleApproveAssignment(sub.id, sub.enrollment?.id, sub.user_id, sub.lessons?.course_id)}>Affirm Signoff</Button>
                                )}
                             </div>
                          </div>
                        ))
                      )}
                   </div>
                ) : (
                   <div className="grid gap-[24px]">
                      {weeklyUpdates.length === 0 ? (
                         <div className="py-[64px] text-center bg-white border border-[#8B4513]/10 rounded-[12px] text-xs text-[#3D2B1F]/60 font-medium">No weekly screenshot submissions found.</div>
                      ) : (
                         weeklyUpdates.map((wu: any) => {
                            const student = allProfilesMeta.find((p: any) => p.id === wu.student_id);
                            const course = allCoursesMeta.find((c: any) => String(c.id) === String(wu.course_id));
                            const weekTask = course?.weekly_tasks?.[wu.week_number - 1] || "Submit weekly progress screenshot.";
                            
                            return (
                               <div key={wu.id} className="p-[32px] bg-white border border-[#8B4513]/20 rounded-[12px] flex flex-col lg:flex-row gap-[24px] shadow-none">
                                  {/* Left Panel: Text & Metadata */}
                                  <div className="flex-1 space-y-4">
                                     <div>
                                        <div className="flex items-center gap-2">
                                           <h4 className="text-base font-semibold text-[#3D2B1F]">{student?.full_name || "Scholar"}</h4>
                                           <span className="px-2 py-0.5 rounded-[12px] text-[10px] font-bold bg-[#8B4513]/10 text-[#8B4513] border border-[#8B4513]/25 uppercase tracking-wider">
                                              Week {wu.week_number}
                                           </span>
                                        </div>
                                        <p className="text-xs font-semibold text-[#8B4513] uppercase tracking-wider mt-1">{course?.title || "Program Track"}</p>
                                     </div>

                                     <div className="space-y-1.5 p-3 bg-[#F9F5F0]/50 rounded-[10px] border border-[#8B4513]/10">
                                        <span className="text-[10px] font-bold text-[#3D2B1F]/60 uppercase tracking-wider block">Assigned Task</span>
                                        <p className="text-xs text-[#3D2B1F]/80 font-medium leading-[1.5]">{weekTask}</p>
                                     </div>

                                     <div className="space-y-1.5 p-3 bg-[#F9F5F0]/50 rounded-[10px] border border-[#8B4513]/10">
                                        <span className="text-[10px] font-bold text-[#3D2B1F]/60 uppercase tracking-wider block">Student's Description / Notes</span>
                                        <p className="text-xs text-[#3D2B1F]/80 font-medium leading-[1.5] whitespace-pre-wrap">{wu.improvement_text || "No notes provided."}</p>
                                     </div>

                                     <div className="space-y-2 pt-2">
                                        <span className="text-[10px] font-bold text-[#3D2B1F]/60 uppercase tracking-wider block">mentor feedback</span>
                                        <textarea
                                           placeholder="Enter grading feedback or changes requested..."
                                           value={gradingFeedback[wu.id] || ""}
                                           onChange={(e) => setGradingFeedback(prev => ({ ...prev, [wu.id]: e.target.value }))}
                                           className="w-full bg-[#F9F5F0]/40 border border-[#8B4513]/25 rounded-[10px] p-2 text-xs focus:border-[#8B4513] outline-none min-h-[60px] text-[#3D2B1F]"
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
                                                 className="rounded-[10px] px-5 font-bold bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] shadow-none text-xs" 
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
                                     <span className="text-[10px] font-bold text-[#3D2B1F]/60 uppercase tracking-wider block">Submitted Screenshot</span>
                                     <div className="aspect-video lg:aspect-square w-full rounded-[10px] overflow-hidden border border-[#8B4513]/15 bg-[#F9F5F0] relative group">
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
                <h3 className="text-xl font-medium tracking-[-0.02em] text-[#3D2B1F]">Signature Allocation Approval Gate</h3>
                <div className="grid gap-[24px]">
                   {certRequests.map(req => (
                     <div key={req.id} className="p-[32px] bg-white border border-[#8B4513]/20 rounded-[12px] flex items-center justify-between shadow-none">
                        <div>
                           <h4 className="text-base font-medium text-[#3D2B1F]">{req.profiles?.full_name}</h4>
                           <p className="text-xs font-medium text-[#8B4513] mt-0.5">{req.courses?.title}</p>
                           <p className="text-[10px] text-[#3D2B1F]/50 uppercase tracking-wider font-medium mt-1">Authority ID: {req.id.substring(0,8)}</p>
                        </div>
                        <div className="flex gap-[8px]">
                           <Button size="sm" className="rounded-[12px] px-4 font-medium bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] shadow-none text-xs" onClick={() => handleGrade(req.id, "90", "approved")}>Approve Node</Button>
                           <Button variant="outline" size="sm" className="rounded-[12px] px-4 font-medium border-[#8B4513]/20 text-xs shadow-none" onClick={() => handleGrade(req.id, "0", "rejected")}>Purge Request</Button>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          )}
        </div>
      </main>

      {/* Base Track Modal Subsystem */}
      {isBaseTrackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
          <div 
            className="w-[90%] h-[85%] bg-white border border-[#8B4513]/20 rounded-[16px] shadow-2xl flex flex-col overflow-hidden text-[#3D2B1F] animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-[#8B4513]/15 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold tracking-tight text-[#3D2B1F] flex items-center gap-2">
                <Sparkles className="text-[#8B4513]" size={18} /> Add Internship Track
              </h3>
              <button 
                onClick={() => setIsBaseTrackModalOpen(false)}
                className="text-[#3D2B1F]/60 hover:text-[#3D2B1F] transition-colors p-1 hover:bg-[#8B4513]/5 rounded-[6px]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content (Two Column) */}
            <div className="flex-1 overflow-y-auto p-8 bg-[#F9F5F0]/20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                {/* Left Column (Core Meta) */}
                <div className="space-y-6 flex flex-col">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#8B4513] uppercase tracking-wider">Internship Name</label>
                    <input 
                      type="text" 
                      value={trackTitle}
                      onChange={(e) => setTrackTitle(e.target.value)}
                      placeholder="e.g., Full Stack Development" 
                      className="w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 rounded-[12px] p-3 text-sm focus:outline-none focus:border-[#8B4513] text-[#3D2B1F] font-medium placeholder-[#3D2B1F]/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#8B4513] uppercase tracking-wider">Department</label>
                    <select 
                      value={focusDomain}
                      onChange={(e) => setFocusDomain(e.target.value)}
                      className="w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 rounded-[12px] p-3 text-sm focus:outline-none focus:border-[#8B4513] text-[#3D2B1F] font-medium"
                    >
                      <option value="Software Engineering">Software Engineering</option>
                      <option value="AI & Automation">AI & Automation</option>
                      <option value="System Architecture">System Architecture</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#8B4513] uppercase tracking-wider block">Duration Scheme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {["30-Day Sprint", "60-Day Deep Dive", "90-Day Enterprise"].map((dur) => (
                        <label 
                          key={dur} 
                          className={`flex flex-col items-center justify-center p-4 rounded-[12px] border text-xs font-medium cursor-pointer transition-all ${
                            trackDuration === dur 
                              ? "border-[#8B4513] bg-[#8B4513]/5 text-[#8B4513]" 
                              : "border-[#8B4513]/20 bg-[#F9F5F0]/40 text-[#3D2B1F]/60 hover:border-[#8B4513]/40"
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
                    <label className="text-xs font-semibold text-[#8B4513] uppercase tracking-wider">Reference GitHub URL</label>
                    <input 
                      type="text" 
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="e.g., https://github.com/matrixroot/boilerplate" 
                      className="w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 rounded-[12px] p-3 text-sm focus:outline-none focus:border-[#8B4513] text-[#3D2B1F] font-medium placeholder-[#3D2B1F]/30"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[#8B4513] uppercase tracking-wider block">Duration (Weeks)</label>
                      <input 
                        type="number" 
                        value={timelineWeeks}
                        onChange={(e) => setTimelineWeeks(parseInt(e.target.value) || 0)}
                        placeholder="e.g., 8" 
                        min="1"
                        className="w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 rounded-[12px] p-3 text-sm focus:outline-none focus:border-[#8B4513] text-[#3D2B1F] font-medium placeholder-[#3D2B1F]/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[#8B4513] uppercase tracking-wider block">Price (INR)</label>
                      <input 
                        type="number" 
                        value={trackPrice}
                        onChange={(e) => setTrackPrice(parseInt(e.target.value) || 0)}
                        placeholder="e.g., 500" 
                        min="0"
                        className="w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 rounded-[12px] p-3 text-sm focus:outline-none focus:border-[#8B4513] text-[#3D2B1F] font-medium placeholder-[#3D2B1F]/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-[#8B4513]/10">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#8B4513] uppercase tracking-wider block">Internship Blueprints</label>
                      <button 
                        type="button"
                        onClick={() => setProblemStatements([...problemStatements, ""])}
                        className="px-2.5 py-0.5 text-[10px] font-bold bg-[#8B4513]/10 text-[#8B4513] border border-[#8B4513]/20 rounded-[6px] hover:bg-[#8B4513]/25 transition-all"
                      >
                        + Add Blueprint
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                      {problemStatements.map((statement, idx) => (
                        <div key={idx} className="flex gap-2 items-start bg-[#F9F5F0]/50 p-2.5 rounded-[8px] border border-[#8B4513]/20">
                          <textarea
                            value={statement}
                            onChange={(e) => {
                              const updated = [...problemStatements];
                              updated[idx] = e.target.value;
                              setProblemStatements(updated);
                            }}
                            placeholder={`Blueprint Statement ${idx + 1}...`}
                            className="flex-1 bg-transparent border-0 text-xs text-[#3D2B1F] focus:outline-none resize-none min-h-[36px] placeholder-[#3D2B1F]/30 font-medium"
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
                    <label className="text-xs font-semibold text-[#8B4513] uppercase tracking-wider">Onboarding Instructions</label>
                    <textarea 
                      value={welcomeInstructions}
                      onChange={(e) => setWelcomeInstructions(e.target.value)}
                      placeholder="Enter raw welcome instructions or onboarding markdown text here..." 
                      className="flex-1 min-h-[200px] w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 rounded-[12px] p-3 text-sm focus:outline-none focus:border-[#8B4513] text-[#3D2B1F] font-medium resize-none placeholder-[#3D2B1F]/30"
                    />
                  </div>

                  <div className="space-y-2 shrink-0">
                    <label className="text-xs font-semibold text-[#8B4513] uppercase tracking-wider block">Activation Status</label>
                    <div className="flex items-center justify-between bg-[#F9F5F0]/50 border border-[#8B4513]/20 rounded-[12px] p-3.5">
                      <span className="text-xs font-semibold text-[#3D2B1F]">
                        {activationStatus ? "Live - Accepting Token Access" : "Draft - Hidden from Portal"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActivationStatus(!activationStatus)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          activationStatus ? 'bg-[#8B4513]' : 'bg-[#8B4513]/20'
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
            <div className="p-6 border-t border-[#8B4513]/15 flex items-center justify-end gap-3 shrink-0 bg-[#F9F5F0]/30">
              <Button 
                variant="outline"
                onClick={() => setIsBaseTrackModalOpen(false)}
                className="rounded-[12px] border-[#8B4513]/20 hover:border-[#8B4513]/40 bg-transparent text-[#3D2B1F]/80 hover:text-[#3D2B1F] hover:bg-[#8B4513]/5 px-5 h-10 font-bold text-xs shadow-none transition-colors"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeployBaseTrack}
                className="rounded-[12px] bg-[#8B4513] hover:bg-[#72360f] text-white px-6 h-10 font-bold text-xs shadow-none border-none transition-colors"
              >
                Create Track
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Editing Workspace Course Modal */}
      {editingWorkspaceCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
          <div 
            className="w-[90%] max-w-[650px] max-h-[85%] bg-white border border-[#8B4513]/20 rounded-[16px] shadow-2xl flex flex-col overflow-hidden text-[#3D2B1F] animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-[#8B4513]/15 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold tracking-tight text-[#3D2B1F] flex items-center gap-2">
                <Sparkles className="text-[#8B4513]" size={18} /> Manage Workspace: {editingWorkspaceCourse.title}
              </h3>
              <button 
                onClick={() => setEditingWorkspaceCourse(null)}
                className="text-[#3D2B1F]/60 hover:text-[#3D2B1F] transition-colors p-1 hover:bg-[#8B4513]/5 rounded-[6px]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleUpdateCourseWorkspace} className="flex-1 overflow-y-auto p-6 bg-[#F9F5F0]/20 space-y-6">
              {/* Blueprints / Problem statements */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#8B4513] uppercase tracking-wider block">
                    Internship Blueprints
                  </label>
                  <button 
                    type="button"
                    onClick={() => setEditingWorkspaceCourse((prev: any) => ({
                      ...prev,
                      problem_statements: [...(prev.problem_statements || []), ""]
                    }))}
                    className="px-2.5 py-0.5 text-[10px] font-bold bg-[#8B4513]/10 text-[#8B4513] border border-[#8B4513]/20 rounded-[6px] hover:bg-[#8B4513]/25 transition-all"
                  >
                    + Add Blueprint
                  </button>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {(editingWorkspaceCourse.problem_statements || []).map((statement: string, idx: number) => (
                    <div key={idx} className="flex gap-2 items-start bg-[#F9F5F0]/50 p-2.5 rounded-[8px] border border-[#8B4513]/20">
                      <textarea
                        value={statement}
                        onChange={(e) => {
                          const updated = [...(editingWorkspaceCourse.problem_statements || [])];
                          updated[idx] = e.target.value;
                          setEditingWorkspaceCourse((prev: any) => ({ ...prev, problem_statements: updated }));
                        }}
                        placeholder={`Blueprint Statement ${idx + 1}...`}
                        className="flex-1 bg-transparent border-0 text-xs text-[#3D2B1F] focus:outline-none resize-none min-h-[36px] placeholder-[#3D2B1F]/30 font-medium"
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
              <div className="pt-4 border-t border-[#8B4513]/15 flex items-center justify-end gap-3 shrink-0">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setEditingWorkspaceCourse(null)}
                  className="rounded-[12px] border-[#8B4513]/20 hover:border-[#8B4513]/40 bg-transparent text-[#3D2B1F]/80 hover:text-[#3D2B1F] hover:bg-[#8B4513]/5 px-5 h-10 font-bold text-xs shadow-none transition-colors"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="rounded-[12px] bg-[#8B4513] hover:bg-[#72360f] text-white px-6 h-10 font-bold text-xs shadow-none border-none transition-colors"
                >
                  Save Blueprints
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
