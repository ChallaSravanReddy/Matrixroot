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
  deleteModuleAction
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
  ArrowLeft,
  ShieldCheck,
  Search,
  ExternalLink,
  Loader2,
  Trash2,
  Image as ImageIcon,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [newCourse, setNewCourse] = useState({ title: "", description: "", dept_id: "", video_url: "" });
  const [newModule, setNewModule] = useState({ course_id: "", title: "", description: "", has_assessment: false });
  const [newLesson, setNewLesson] = useState({ course_id: "", module_id: "", title: "", content_url: "", notes: "", is_preview: false, has_assignment: false });

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
      }
      if (activeTab === "students" && data.students) setStudents(data.students);
      if (activeTab === "grading" || activeTab === "certificates") {
        const { progressData, profiles, lessons, allCourses, enrolls } = data;
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

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createCourseAction(newCourse);
    if (res.success) {
      alert("Course created successfully with visual cover graphic!");
      setNewCourse({ title: "", description: "", dept_id: "", video_url: "" });
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
                 <h3 className="text-xl font-medium tracking-[-0.02em] text-[#3D2B1F]">Instantiate Program</h3>
                 <form onSubmit={handleCreateCourse} className="space-y-[16px] p-[24px] bg-white border border-[#8B4513]/20 rounded-[12px] shadow-none">
                    <input type="text" placeholder="Track Official Designation" className="w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 p-3 rounded-[12px] text-xs focus:outline-none focus:border-[#8B4513]" value={newCourse.title} onChange={(e) => setNewCourse({...newCourse, title: e.target.value})} required />
                    <textarea placeholder="Program Syllabus Summary" className="w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 p-3 rounded-[12px] text-xs h-24 focus:outline-none focus:border-[#8B4513]" value={newCourse.description} onChange={(e) => setNewCourse({...newCourse, description: e.target.value})} required />
                    <select className="w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 p-3 rounded-[12px] text-xs focus:outline-none focus:border-[#8B4513]" value={newCourse.dept_id} onChange={(e) => setNewCourse({...newCourse, dept_id: e.target.value})} required>
                      <option value="">Assign Target Discipline</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    
                    {/* Input to support visual Cover graphic Image URL */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-[#3D2B1F]/60 flex items-center gap-1">
                        <ImageIcon size={12} className="text-[#8B4513]" /> Cover Image/Asset URL (Visual card cover)
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. https://images.unsplash.com/... or /img/..." 
                        className="w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 p-3 rounded-[12px] text-xs focus:outline-none focus:border-[#8B4513]" 
                        value={newCourse.video_url} 
                        onChange={(e) => setNewCourse({...newCourse, video_url: e.target.value})} 
                      />
                    </div>

                    <Button type="submit" className="w-full h-10 rounded-[12px] font-medium text-xs bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] shadow-none mt-2">Commit Record</Button>
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
                            <div className="text-[10px] font-medium text-[#8B4513] uppercase tracking-wider bg-[#8B4513]/5 border border-[#8B4513]/10 px-2 py-0.5 rounded-[12px]">
                              {c.departments?.name || "Foundational"}
                            </div>
                            <button onClick={() => handleDeleteCourse(c.id)} className="text-[#8B4513] hover:bg-[#8B4513]/5 p-1 rounded-[6px] transition-colors" title="Purge Program">
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <h4 className="font-medium text-base tracking-[-0.02em] text-[#3D2B1F] mb-[8px]">{c.title}</h4>
                          <p className="text-xs text-[#3D2B1F]/80 line-clamp-2 leading-[1.6]">{c.description}</p>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {activeTab === "lessons" && (
             <div className="grid lg:grid-cols-[400px_1fr] gap-[32px]">
               <div className="space-y-[32px]">
                  {/* Create Module Form */}
                  <div className="space-y-[16px]">
                    <h3 className="text-base font-medium text-[#3D2B1F]">1. Define Parent Module Tier</h3>
                    <form onSubmit={handleCreateModule} className="space-y-[16px] p-[24px] bg-white border border-[#8B4513]/20 rounded-[12px] shadow-none">
                       <select className="w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 p-3 rounded-[12px] text-xs focus:outline-none focus:border-[#8B4513]" value={newModule.course_id} onChange={(e) => setNewModule({...newModule, course_id: e.target.value})} required>
                         <option value="">Assign Parent Track</option>
                         {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                       </select>
                       <input type="text" placeholder="Tier Identifier (e.g. Phase 1: Mechanics)" className="w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 p-3 rounded-[12px] text-xs focus:outline-none focus:border-[#8B4513]" value={newModule.title} onChange={(e) => setNewModule({...newModule, title: e.target.value})} required />
                       <textarea placeholder="Directives Summary" className="w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 p-3 rounded-[12px] text-xs h-16 focus:outline-none focus:border-[#8B4513]" value={newModule.description} onChange={(e) => setNewModule({...newModule, description: e.target.value})} />
                       <label className="flex items-center gap-2 pt-1 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 rounded-[4px] border-[#8B4513]/20 text-[#8B4513] focus:ring-0" checked={newModule.has_assessment} onChange={(e) => setNewModule({...newModule, has_assessment: e.target.checked})} />
                          <span className="text-xs font-medium text-[#3D2B1F]">Require Tier Assessment Evaluation</span>
                       </label>
                       <Button type="submit" className="w-full h-10 rounded-[12px] font-medium text-xs bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] shadow-none mt-2">Initialize Subsystem</Button>
                    </form>
                  </div>

                  {/* Add Lesson Form */}
                  <div className="space-y-[16px]">
                    <h3 className="text-base font-medium text-[#3D2B1F]">2. Instantiate Directives Block</h3>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const res = await createLessonAction(newLesson);
                      if (res.success) {
                        alert("Directive committed securely!");
                        setNewLesson({ ...newLesson, title: "", content_url: "", notes: "", has_assignment: false });
                        fetchData();
                      } else {
                        alert("Execution failure: " + res.error);
                      }
                    }} className="space-y-[16px] p-[24px] bg-white border border-[#8B4513]/20 rounded-[12px] shadow-none">
                       <select className="w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 p-3 rounded-[12px] text-xs focus:outline-none focus:border-[#8B4513]" value={newLesson.course_id} onChange={(e) => setNewLesson({...newLesson, course_id: e.target.value, module_id: ""})} required>
                         <option value="">Select Target Pipeline</option>
                         {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                       </select>
                       <select className="w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 p-3 rounded-[12px] text-xs focus:outline-none focus:border-[#8B4513]" value={newLesson.module_id} onChange={(e) => setNewLesson({...newLesson, module_id: e.target.value})} required>
                         <option value="">Assign Scope Node</option>
                         {(() => {
                           const filtered = modules.filter(m => String(m.course_id) === String(newLesson.course_id));
                           if (filtered.length === 0 && newLesson.course_id) {
                             return <option value="" disabled>⚠️ First instantiate Subsystem Tier via Form 1</option>;
                           }
                           return filtered.map(m => (
                             <option key={m.id} value={m.id}>{m.title}</option>
                           ));
                         })()}
                       </select>
                       <input type="text" placeholder="Directive Definition Identifier" className="w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 p-3 rounded-[12px] text-xs focus:outline-none focus:border-[#8B4513]" value={newLesson.title} onChange={(e) => setNewLesson({...newLesson, title: e.target.value})} required />
                       <textarea placeholder="Operational Briefing / Payload Documentation" className="w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 p-3 rounded-[12px] text-xs h-20 focus:outline-none focus:border-[#8B4513]" value={newLesson.notes} onChange={(e) => setNewLesson({...newLesson, notes: e.target.value})} />
                       <input type="text" placeholder="Video Stream Pointer URI" className="w-full bg-[#F9F5F0]/50 border border-[#8B4513]/20 p-3 rounded-[12px] text-xs focus:outline-none focus:border-[#8B4513]" value={newLesson.content_url} onChange={(e) => setNewLesson({...newLesson, content_url: e.target.value})} />
                       <div className="flex flex-col gap-2 pt-1">
                         <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded-[4px] border-[#8B4513]/20 text-[#8B4513] focus:ring-0" checked={newLesson.is_preview} onChange={(e) => setNewLesson({...newLesson, is_preview: e.target.checked})} />
                            <span className="text-xs font-medium text-[#3D2B1F]">Allow Public Access Preview</span>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded-[4px] border-[#8B4513]/20 text-[#8B4513] focus:ring-0" checked={newLesson.has_assignment} onChange={(e) => setNewLesson({...newLesson, has_assignment: e.target.checked})} />
                            <span className="text-xs font-medium text-[#3D2B1F]">Enforce Strict Assessment Signoff</span>
                         </label>
                       </div>
                       <Button type="submit" className="w-full h-10 rounded-[12px] font-medium text-xs bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] shadow-none mt-2">Publish Directives</Button>
                    </form>
                  </div>
               </div>

               <div className="space-y-[24px]">
                  <h3 className="text-xl font-medium tracking-[-0.02em] text-[#3D2B1F]">Syllabus Topology Map</h3>
                  <div className="space-y-[24px]">
                     {courses.map(c => {
                       const courseModules = modules.filter(m => String(m.course_id) === String(c.id)).sort((a,b) => (a.order_index || 0) - (b.order_index || 0));
                       const unassignedLessons = lessons.filter(l => String(l.course_id) === String(c.id) && !l.module_id).sort((a,b) => (a.order_index || 0) - (b.order_index || 0));
                       
                       return (
                         <div key={c.id} className="p-[24px] bg-white border border-[#8B4513]/20 rounded-[12px] space-y-[16px] shadow-none">
                            <h4 className="font-medium text-base text-[#3D2B1F] flex items-center gap-2 border-b border-[#8B4513]/10 pb-2">
                               <BookOpen size={16} className="text-[#8B4513]" />
                               {c.title}
                            </h4>

                            <div className="space-y-[16px]">
                              {courseModules.map((mod) => {
                                const modLessons = lessons.filter(l => String(l.module_id) === String(mod.id)).sort((a,b) => (a.order_index || 0) - (b.order_index || 0));
                                return (
                                  <div key={mod.id} className="p-[16px] bg-[#F9F5F0]/50 border border-[#8B4513]/10 rounded-[12px] space-y-[8px]">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="font-medium text-xs text-[#3D2B1F]">{mod.title}</div>
                                        {mod.has_assessment && <span className="text-[9px] font-medium uppercase tracking-wider px-2 py-0.5 bg-[#8B4513]/5 text-[#8B4513] rounded-[12px] border border-[#8B4513]/10">Required Evaluation</span>}
                                      </div>
                                      <button onClick={() => handleDeleteModule(mod.id)} className="p-1 text-[#8B4513] hover:bg-[#8B4513]/5 rounded-[6px] transition-colors shrink-0" title="Purge Subsystem">
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                    
                                    <div className="space-y-1 pl-2 border-l border-[#8B4513]/20 pt-1">
                                      {modLessons.length === 0 ? (
                                        <div className="text-[10px] text-[#3D2B1F]/60 italic py-1">Subsystem unpopulated.</div>
                                      ) : (
                                        modLessons.map((lsn) => (
                                          <div key={lsn.id} className="flex items-center justify-between p-1.5 rounded-[8px] hover:bg-white transition-colors group">
                                            <div className="min-w-0 pr-2">
                                              <div className="text-xs font-normal text-[#3D2B1F] truncate">{lsn.title}</div>
                                              <div className="flex items-center gap-2 mt-0.5">
                                                {lsn.notes && <span className="text-[9px] text-[#3D2B1F]/50">📝 Specs</span>}
                                                {lsn.content_url && <span className="text-[9px] text-[#3D2B1F]/50">🎥 Stream</span>}
                                                {lsn.is_preview && <span className="text-[9px] font-medium text-[#8B4513]">Preview</span>}
                                                {lsn.has_assignment && <span className="text-[9px] font-medium text-[#8B4513]">Assessment</span>}
                                              </div>
                                            </div>
                                            <button onClick={() => handleDeleteLesson(lsn.id)} className="opacity-0 group-hover:opacity-100 p-1 text-[#8B4513] hover:bg-[#8B4513]/5 rounded transition-all shrink-0">
                                              <Trash2 size={12} />
                                            </button>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                );
                              })}

                              {unassignedLessons.length > 0 && (
                                <div className="p-[16px] bg-[#F9F5F0]/30 border border-dashed border-[#8B4513]/20 rounded-[12px] space-y-[8px]">
                                  <div className="text-[10px] font-medium text-[#3D2B1F]/60 uppercase tracking-wider">Unassigned Floating Nodes</div>
                                  <div className="space-y-1 pl-2 border-l border-[#8B4513]/10">
                                    {unassignedLessons.map((lsn) => (
                                      <div key={lsn.id} className="flex items-center justify-between p-1.5 rounded-[8px] hover:bg-white transition-colors group">
                                        <div className="min-w-0 pr-2">
                                          <div className="text-xs font-normal text-[#3D2B1F] truncate">{lsn.title}</div>
                                        </div>
                                        <button onClick={() => handleDeleteLesson(lsn.id)} className="opacity-0 group-hover:opacity-100 p-1 text-[#8B4513] hover:bg-[#8B4513]/5 rounded transition-all shrink-0">
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                         </div>
                       );
                     })}
                  </div>
               </div>
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

          {activeTab === "grading" && (
             <div className="space-y-[24px]">
                <h3 className="text-xl font-medium tracking-[-0.02em] text-[#3D2B1F]">Artifact Verification Pipeline</h3>
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
    </div>
  );
}
