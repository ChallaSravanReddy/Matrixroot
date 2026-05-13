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
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("courses");

  // Data States
  const [departments, setDepartments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [certRequests, setCertRequests] = useState<any[]>([]);

  // Form States
  const [newCourse, setNewCourse] = useState({ title: "", description: "", dept_id: "" });
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
      alert("Course created!");
      setNewCourse({ title: "", description: "", dept_id: "" });
      fetchData();
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
      alert("Module created!");
      setNewModule({ course_id: "", title: "", description: "", has_assessment: false });
      fetchData();
    } else {
      alert("Error creating module: " + res.error + "\n(Did you run the SQL script to create the course_modules table?)");
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
    if (!confirm("Are you sure you want to delete this course track? All associated modules might be removed. This cannot be undone.")) return;
    const res = await deleteCourseAction(courseId);
    if (res.success) {
      fetchData();
    } else {
      alert("Error deleting course: " + res.error);
    }
  };

  const handleMoveLesson = async (courseId: string, index: number, direction: 'up' | 'down') => {
    // Get all lessons for this course sorted by current order_index
    const courseLessons = lessons.filter(l => l.course_id === courseId).sort((a,b) => (a.order_index || 0) - (b.order_index || 0));
    
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === courseLessons.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    const temp = courseLessons[index];
    courseLessons[index] = courseLessons[newIndex];
    courseLessons[newIndex] = temp;

    // Create updates array
    const updates = courseLessons.map((l, i) => ({ id: l.id, order_index: i + 1 }));
    
    // Optimistically update local state so UI is snappy
    setLessons(prev => {
      const others = prev.filter(p => p.course_id !== courseId);
      const updated = courseLessons.map((l, i) => ({ ...l, order_index: i + 1 }));
      return [...others, ...updated];
    });

    const res = await reorderLessonsAction(updates);
    if (!res.success) {
      alert("Failed to reorder: " + res.error);
      fetchData(); // Revert local state on error
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground"><Loader2 className="animate-spin text-primary" /></div>;
  if (!isAdmin) return null;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 hidden lg:flex flex-col border-r border-border bg-card/30">
        <div className="p-6 flex items-center gap-3 border-b border-border">
          <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Logo" width={32} height={32} />
          <span className="font-bold text-lg">Admin Portal</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: "courses", label: "Courses", icon: <BookOpen size={18} /> },
            { id: "lessons", label: "Curriculum", icon: <PlusCircle size={18} /> },
            { id: "students", label: "Directory", icon: <Users size={18} /> },
            { id: "grading", label: "Assignments", icon: <FileCheck2 size={18} /> },
            { id: "certificates", label: "Approvals", icon: <Award size={18} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 min-h-[48px] rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={() => window.location.href='/dashboard'}>
            <ArrowLeft size={14} className="mr-2" /> Back to Student UI
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <h2 className="text-lg font-black uppercase tracking-widest">{activeTab} Management</h2>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
               <ShieldCheck size={14} className="text-primary" />
               Admin Access Secured
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 pb-20">
          
          {activeTab === "courses" && (
            <div className="grid lg:grid-cols-[400px_1fr] gap-10">
              <div className="space-y-6">
                 <h3 className="text-xl font-black">Create New Track</h3>
                 <form onSubmit={handleCreateCourse} className="space-y-4 p-6 bg-card border border-border rounded-[2rem] shadow-card">
                    <input type="text" placeholder="Track Title" className="w-full bg-background border border-border p-4 rounded-xl font-medium" value={newCourse.title} onChange={(e) => setNewCourse({...newCourse, title: e.target.value})} required />
                    <textarea placeholder="Description" className="w-full bg-background border border-border p-4 rounded-xl h-32 font-medium" value={newCourse.description} onChange={(e) => setNewCourse({...newCourse, description: e.target.value})} required />
                    <select className="w-full bg-background border border-border p-4 rounded-xl font-medium" value={newCourse.dept_id} onChange={(e) => setNewCourse({...newCourse, dept_id: e.target.value})} required>
                      <option value="">Select Branch</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <Button type="submit" className="w-full h-14 rounded-2xl font-black shadow-xl shadow-primary/20">Initialize Track</Button>
                 </form>
              </div>
              <div className="space-y-6">
                 <h3 className="text-xl font-black">Active Tracks</h3>
                 <div className="grid sm:grid-cols-2 gap-4">
                    {courses.map(c => (
                      <div key={c.id} className="p-6 bg-card border border-border rounded-[2rem] hover:border-primary/20 transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-[10px] font-bold text-primary uppercase tracking-widest">{c.departments?.name}</div>
                            <button onClick={() => handleDeleteCourse(c.id)} className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors" title="Delete Track">
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <h4 className="font-bold text-lg mb-2">{c.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {activeTab === "lessons" && (
             <div className="grid lg:grid-cols-[420px_1fr] gap-10">
               <div className="space-y-10">
                  {/* Create Module Form */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-black">1. Create Module</h3>
                    <form onSubmit={handleCreateModule} className="space-y-4 p-6 bg-card border border-border rounded-[2rem] shadow-card">
                       <select className="w-full bg-background border border-border p-4 rounded-xl font-medium" value={newModule.course_id} onChange={(e) => setNewModule({...newModule, course_id: e.target.value})} required>
                         <option value="">Select Track</option>
                         {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                       </select>
                       <input type="text" placeholder="Module Title (e.g. Week 1: Fundamentals)" className="w-full bg-background border border-border p-4 rounded-xl font-medium" value={newModule.title} onChange={(e) => setNewModule({...newModule, title: e.target.value})} required />
                       <textarea placeholder="Module Description (Optional)" className="w-full bg-background border border-border p-4 rounded-xl font-medium h-20" value={newModule.description} onChange={(e) => setNewModule({...newModule, description: e.target.value})} />
                       <label className="flex items-center gap-3 p-2 cursor-pointer">
                          <input type="checkbox" className="w-5 h-5 rounded-md accent-primary" checked={newModule.has_assessment} onChange={(e) => setNewModule({...newModule, has_assessment: e.target.checked})} />
                          <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Module-wide Assessment</span>
                       </label>
                       <Button type="submit" className="w-full h-12 rounded-xl font-black shadow-lg shadow-primary/20">Initialize Module</Button>
                    </form>
                  </div>

                  {/* Add Lesson Form */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-black">2. Add Lesson to Module</h3>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const res = await createLessonAction(newLesson);
                      if (res.success) {
                        alert("Lesson added successfully!");
                        setNewLesson({ ...newLesson, title: "", content_url: "", notes: "", has_assignment: false });
                        fetchData();
                      } else {
                        alert("Error adding lesson: " + res.error);
                      }
                    }} className="space-y-4 p-6 bg-card border border-border rounded-[2rem] shadow-card">
                       <select className="w-full bg-background border border-border p-4 rounded-xl font-medium" value={newLesson.course_id} onChange={(e) => setNewLesson({...newLesson, course_id: e.target.value, module_id: ""})} required>
                         <option value="">Select Track</option>
                         {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                       </select>
                       <select className="w-full bg-background border border-border p-4 rounded-xl font-medium" value={newLesson.module_id} onChange={(e) => setNewLesson({...newLesson, module_id: e.target.value})} required>
                         <option value="">Select Parent Module</option>
                         {(() => {
                           const filtered = modules.filter(m => String(m.course_id) === String(newLesson.course_id));
                           if (filtered.length === 0 && newLesson.course_id) {
                             return <option value="" disabled>⚠️ First initialize a Module using Form 1 above</option>;
                           }
                           return filtered.map(m => (
                             <option key={m.id} value={m.id}>{m.title}</option>
                           ));
                         })()}
                       </select>
                       <input type="text" placeholder="Lesson Title" className="w-full bg-background border border-border p-4 rounded-xl font-medium" value={newLesson.title} onChange={(e) => setNewLesson({...newLesson, title: e.target.value})} required />
                       <textarea placeholder="Text Notes / Study Material" className="w-full bg-background border border-border p-4 rounded-xl font-medium h-28" value={newLesson.notes} onChange={(e) => setNewLesson({...newLesson, notes: e.target.value})} />
                       <input type="text" placeholder="Video URL (Optional)" className="w-full bg-background border border-border p-4 rounded-xl font-medium" value={newLesson.content_url} onChange={(e) => setNewLesson({...newLesson, content_url: e.target.value})} />
                       <div className="flex flex-col gap-1">
                         <label className="flex items-center gap-3 p-2 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 rounded-md accent-primary" checked={newLesson.is_preview} onChange={(e) => setNewLesson({...newLesson, is_preview: e.target.checked})} />
                            <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Free Preview</span>
                         </label>
                         <label className="flex items-center gap-3 p-2 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 rounded-md accent-primary" checked={newLesson.has_assignment} onChange={(e) => setNewLesson({...newLesson, has_assignment: e.target.checked})} />
                            <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Lesson Assessment</span>
                         </label>
                       </div>
                       <Button type="submit" className="w-full h-12 rounded-xl font-black shadow-lg shadow-primary/20">Publish Lesson</Button>
                    </form>
                  </div>
               </div>

               <div className="space-y-8">
                  <h3 className="text-xl font-black">Curriculum Overview</h3>
                  <div className="space-y-8">
                     {courses.map(c => {
                       const courseModules = modules.filter(m => String(m.course_id) === String(c.id)).sort((a,b) => (a.order_index || 0) - (b.order_index || 0));
                       const unassignedLessons = lessons.filter(l => String(l.course_id) === String(c.id) && !l.module_id).sort((a,b) => (a.order_index || 0) - (b.order_index || 0));
                       
                       return (
                         <div key={c.id} className="p-6 bg-card/40 border border-border rounded-[2.5rem] space-y-6">
                            <h4 className="font-black text-lg text-primary flex items-center gap-2 border-b border-border/60 pb-3">
                               <BookOpen size={18} />
                               {c.title}
                            </h4>

                            {/* Render Modules */}
                            <div className="space-y-4">
                              {courseModules.map((mod, mIdx) => {
                                const modLessons = lessons.filter(l => String(l.module_id) === String(mod.id)).sort((a,b) => (a.order_index || 0) - (b.order_index || 0));
                                return (
                                  <div key={mod.id} className="p-4 bg-background border border-border rounded-2xl space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="font-bold text-sm">{mod.title}</div>
                                        {mod.has_assessment && <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded border border-amber-500/20">Module Assessment</span>}
                                      </div>
                                      <button onClick={() => handleDeleteModule(mod.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors shrink-0" title="Delete Module">
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                    
                                    {/* Lessons inside Module */}
                                    <div className="space-y-1.5 pl-3 border-l-2 border-border/60">
                                      {modLessons.length === 0 ? (
                                        <div className="text-[11px] text-muted-foreground italic py-1">No lessons added to this module yet.</div>
                                      ) : (
                                        modLessons.map((lsn, lIdx) => (
                                          <div key={lsn.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-accent/40 transition-colors group">
                                            <div className="min-w-0 pr-2">
                                              <div className="text-xs font-semibold truncate">{lsn.title}</div>
                                              <div className="flex items-center gap-2 mt-0.5">
                                                {lsn.notes && <span className="text-[9px] text-muted-foreground">📝 Notes</span>}
                                                {lsn.content_url && <span className="text-[9px] text-muted-foreground">🎥 Video</span>}
                                                {lsn.is_preview && <span className="text-[9px] font-bold text-sky-400">Preview</span>}
                                                {lsn.has_assignment && <span className="text-[9px] font-bold text-primary">Assessment</span>}
                                              </div>
                                            </div>
                                            <button onClick={() => handleDeleteLesson(lsn.id)} className="opacity-0 group-hover:opacity-100 p-1 text-destructive hover:bg-destructive/10 rounded transition-all shrink-0">
                                              <Trash2 size={12} />
                                            </button>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Unassigned/Legacy Lessons */}
                              {unassignedLessons.length > 0 && (
                                <div className="p-4 bg-background/50 border border-dashed border-border rounded-2xl space-y-3">
                                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Unassigned / General Lessons</div>
                                  <div className="space-y-1.5 pl-3 border-l-2 border-border/40">
                                    {unassignedLessons.map((lsn) => (
                                      <div key={lsn.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-accent/40 transition-colors group">
                                        <div className="min-w-0 pr-2">
                                          <div className="text-xs font-semibold truncate">{lsn.title}</div>
                                          <div className="flex items-center gap-2 mt-0.5">
                                            {lsn.notes && <span className="text-[9px] text-muted-foreground">📝 Notes</span>}
                                            {lsn.content_url && <span className="text-[9px] text-muted-foreground">🎥 Video</span>}
                                            {lsn.is_preview && <span className="text-[9px] font-bold text-sky-400">Preview</span>}
                                            {lsn.has_assignment && <span className="text-[9px] font-bold text-primary">Assessment</span>}
                                          </div>
                                        </div>
                                        <button onClick={() => handleDeleteLesson(lsn.id)} className="opacity-0 group-hover:opacity-100 p-1 text-destructive hover:bg-destructive/10 rounded transition-all shrink-0">
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {courseModules.length === 0 && unassignedLessons.length === 0 && (
                                <p className="text-xs text-muted-foreground italic text-center py-4">No curriculum structured yet.</p>
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
             <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <h3 className="text-xl font-black">Student Directory</h3>
                   <div className="relative w-full md:w-96">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <input type="text" placeholder="Search by name or email..." className="w-full bg-card border border-border pl-12 pr-4 py-3 rounded-2xl text-sm font-medium focus:border-primary outline-none transition-all" />
                   </div>
                </div>

                <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-card">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="border-b border-border bg-accent/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            <th className="px-8 py-5">Student Name</th>
                            <th className="px-8 py-5">Branch/Dept</th>
                            <th className="px-8 py-5">Role</th>
                            <th className="px-8 py-5">Status</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                         {students.map(s => (
                           <tr key={s.id} className="hover:bg-accent/10 transition-colors group">
                              <td className="px-8 py-5">
                                 <div className="font-bold">{s.full_name || "New User"}</div>
                                 <div className="text-[10px] text-muted-foreground lowercase">{s.id.substring(0,18)}...</div>
                              </td>
                              <td className="px-8 py-5 text-sm font-medium">{s.department_slug?.toUpperCase() || "UNASSIGNED"}</td>
                              <td className="px-8 py-5">
                                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.role === 'admin' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                                    {s.role || "student"}
                                 </span>
                              </td>
                              <td className="px-8 py-5">
                                 <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Active
                                 </div>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                   {students.length === 0 && (
                     <div className="py-20 text-center text-muted-foreground font-medium">No students found in the directory.</div>
                   )}
                </div>
             </div>
          )}

          {activeTab === "grading" && (
             <div className="space-y-6">
                <h3 className="text-xl font-black">Pending Reviews</h3>
                <div className="grid gap-6">
                   {submissions.length === 0 ? (
                     <div className="py-20 text-center bg-accent/20 border-2 border-dashed border-border rounded-3xl text-muted-foreground font-medium">No pending assignments.</div>
                   ) : (
                     submissions.map(sub => (
                       <div key={sub.id} className="p-8 bg-card border border-border rounded-[2.5rem] flex flex-col md:flex-row gap-8 hover:shadow-2xl transition-all shadow-card">
                          <div className="flex-1 space-y-4">
                             <div>
                                <h4 className="text-xl font-black">{sub.profiles?.full_name || "Student"}</h4>
                                <p className="text-sm font-bold text-primary uppercase tracking-wider">{sub.lessons?.courses?.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">Module: {sub.lessons?.title}</p>
                             </div>
                             <div className="p-4 bg-accent/30 rounded-2xl flex items-center justify-between group cursor-pointer border border-transparent hover:border-primary/20 transition-all">
                                <span className="text-xs font-bold truncate pr-4">{sub.assignment_url}</span>
                                <a href={sub.assignment_url} target="_blank" className="shrink-0 text-primary p-2 hover:bg-primary/10 rounded-lg"><ExternalLink size={16} /></a>
                             </div>
                          </div>
                          <div className="flex items-center gap-4">
                             {sub.status === 'approved' ? (
                                <div className="px-6 py-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl font-black text-xs uppercase tracking-widest">Verified</div>
                             ) : (
                                <Button className="h-14 rounded-2xl px-8 font-black shadow-lg" onClick={() => handleApproveAssignment(sub.id, sub.enrollment?.id, sub.user_id, sub.lessons?.course_id)}>Review & Approve</Button>
                             )}
                          </div>
                       </div>
                     ))
                   )}
                </div>
             </div>
          )}

          {activeTab === "certificates" && (
             <div className="space-y-6">
                <h3 className="text-xl font-black">Certification Queue</h3>
                <div className="grid gap-6">
                   {certRequests.map(req => (
                     <div key={req.id} className="p-8 bg-card border border-border rounded-[2.5rem] flex items-center justify-between shadow-card hover:border-primary/20 transition-all">
                        <div>
                           <h4 className="text-xl font-black">{req.profiles?.full_name}</h4>
                           <p className="text-primary font-bold">{req.courses?.title}</p>
                           <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">ID: {req.id.substring(0,8)}</p>
                        </div>
                        <div className="flex gap-3">
                           <Button className="rounded-xl px-6 h-12 font-black shadow-lg shadow-primary/20" onClick={() => handleGrade(req.id, "90", "approved")}>Approve</Button>
                           <Button variant="outline" className="rounded-xl px-6 h-12 font-black border-border" onClick={() => handleGrade(req.id, "0", "rejected")}>Reject</Button>
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
