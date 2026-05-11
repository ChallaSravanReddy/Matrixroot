"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  fetchAdminData, 
  approveAssignmentAction, 
  updateEnrollmentAction, 
  createCourseAction, 
  createLessonAction 
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
  Loader2
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
  const [students, setStudents] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [certRequests, setCertRequests] = useState<any[]>([]);

  // Form States
  const [newCourse, setNewCourse] = useState({ title: "", description: "", dept_id: "" });
  const [newLesson, setNewLesson] = useState({ course_id: "", title: "", content_url: "", is_preview: false });

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
      if (activeTab === "lessons" && data.courses) setCourses(data.courses);
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
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
                      <div key={c.id} className="p-6 bg-card border border-border rounded-[2rem] hover:border-primary/20 transition-all">
                        <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">{c.departments?.name}</div>
                        <h4 className="font-bold text-lg mb-2">{c.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                      </div>
                    ))}
                 </div>
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
