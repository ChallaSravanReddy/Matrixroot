"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profile?.role !== "admin") {
      alert("Access Denied: Admins Only");
      window.location.href = "/dashboard";
    } else {
      setIsAdmin(true);
    }
    setLoading(false);
  };

  const fetchData = async () => {
    try {
      if (activeTab === "courses") {
        const { data: depts } = await supabase.from("departments").select("*");
        if (depts) setDepartments(depts);
        const { data: crs } = await supabase.from("courses").select("*, departments(name)");
        if (crs) setCourses(crs);
      }
      
      if (activeTab === "lessons") {
        const { data: crs } = await supabase.from("courses").select("*");
        if (crs) setCourses(crs);
      }

      if (activeTab === "students") {
        const { data: stds } = await supabase
          .from("profiles")
          .select("*, departments(name)");
        if (stds) setStudents(stds);
      }

      if (activeTab === "grading" || activeTab === "certificates") {
        // Fetch raw progress data (Simple query to avoid 400 join errors)
        const { data: progressData } = await supabase
          .from("user_progress")
          .select("*")
          .not("assignment_url", "is", null);
        
        // Fetch related tables separately
        const { data: profiles } = await supabase.from("profiles").select("id, full_name");
        const { data: lessons } = await supabase.from("lessons").select("id, title, course_id");
        const { data: allCourses } = await supabase.from("courses").select("id, title");
        const { data: enrolls } = await supabase.from("enrollments").select("*");

        if (progressData && profiles && lessons && allCourses && enrolls) {
          // Join the data manually in JS
          const joined = progressData.map(progress => {
            const student = profiles.find(p => p.id === progress.user_id);
            const lesson = lessons.find(l => String(l.id) === String(progress.lesson_id));
            const course = allCourses.find(c => String(c.id) === String(lesson?.course_id));
            const enrollment = enrolls.find(e => e.student_id === progress.user_id && String(e.course_id) === String(lesson?.course_id));

            return {
              ...progress,
              profiles: student,
              lessons: {
                ...lesson,
                courses: course
              },
              enrollment: enrollment
            };
          });

          setSubmissions(joined);

          // Filter for certification requests
          const readyForCert = enrolls
            .filter(e => e.payment_status === 'completed' && !e.is_certified)
            .map(e => ({
              ...e,
              courses: allCourses.find(c => String(c.id) === String(e.course_id))
            }));
          
          setCertRequests(readyForCert);
        }
      }
    } catch (err) {
      console.error("Fetch Data Error:", err);
    }
  };

  const handleGrade = async (enrollmentId: string, score: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from("enrollments")
      .update({ 
        is_certified: status === 'approved',
        certification_status: status,
        final_score: parseInt(score) || 0
      })
      .eq("id", enrollmentId);

    if (error) {
      alert("Error updating record.");
    } else {
      alert(`Certificate ${status === 'approved' ? 'Approved' : 'Rejected'}!`);
      fetchData();
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("courses").insert([newCourse]);
    if (!error) {
      alert("Course created!");
      setNewCourse({ title: "", description: "", dept_id: "" });
      fetchData();
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("lessons").insert([newLesson]);
    if (!error) {
      alert("Lesson added!");
      setNewLesson({ course_id: "", title: "", content_url: "", is_preview: false });
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Loading...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-zinc-800 bg-zinc-900/50 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/20">R</div>
          <h1 className="text-xl font-bold tracking-tight">Admin Portal</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          {[
            { id: "courses", label: "Courses", icon: "📚" },
            { id: "lessons", label: "Upload Lessons", icon: "🎬" },
            { id: "students", label: "Students", icon: "👥" },
            { id: "grading", label: "Assignments", icon: "📝" },
            { id: "certificates", label: "Cert Approvals", icon: "🎓" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${
                activeTab === tab.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        <button onClick={() => window.location.href='/dashboard'} className="mt-auto py-3 text-xs text-zinc-500 hover:text-white transition-colors">← Back to Dashboard</button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        
        {activeTab === "courses" && (
          <div className="space-y-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold mb-6">Create New Course</h2>
              <form onSubmit={handleCreateCourse} className="space-y-4 bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
                <input type="text" placeholder="Course Title" className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl" value={newCourse.title} onChange={(e) => setNewCourse({...newCourse, title: e.target.value})} required />
                <textarea placeholder="Description" className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl h-32" value={newCourse.description} onChange={(e) => setNewCourse({...newCourse, description: e.target.value})} required />
                <select className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl" value={newCourse.dept_id} onChange={(e) => setNewCourse({...newCourse, dept_id: e.target.value})} required>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <button className="w-full py-4 bg-indigo-600 rounded-xl font-bold hover:bg-indigo-500 transition-all">Create Track</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "certificates" && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold">Certificate Approvals</h2>
            <div className="grid grid-cols-1 gap-6">
              {certRequests.length === 0 ? (
                <div className="p-20 text-center bg-zinc-900/50 rounded-3xl border border-zinc-800 border-dashed text-zinc-500">
                  No pending certificate requests.
                </div>
              ) : (
                certRequests.map((req) => (
                  <div key={req.id} className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl flex items-center justify-between shadow-xl transition-all hover:border-zinc-700">
                    <div>
                      <h3 className="text-xl font-bold">{req.student_id.substring(0,8)}...</h3>
                      <p className="text-indigo-400 font-medium">{req.courses?.title}</p>
                      <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">Enrollment ID: {req.id}</p>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => handleGrade(req.id, "90", "approved")}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20"
                      >
                        Approve Certificate
                      </button>
                      <button 
                        onClick={() => handleGrade(req.id, "0", "rejected")}
                        className="px-6 py-3 bg-zinc-800 hover:bg-red-600 rounded-xl font-bold text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "grading" && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold">Assignment Submissions</h2>
            <div className="grid grid-cols-1 gap-6">
              {submissions.length === 0 ? (
                <div className="p-20 text-center bg-zinc-900/50 rounded-3xl border border-zinc-800 border-dashed text-zinc-500">
                  No assignments submitted yet.
                </div>
              ) : (
                submissions.map((sub) => (
                  <div key={sub.id} className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl flex flex-col md:flex-row gap-8 shadow-xl transition-all hover:border-zinc-700">
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold">{sub.profiles?.full_name || "Student"}</h3>
                        <p className="text-indigo-400 font-semibold">{sub.lessons?.courses?.title}</p>
                        <p className="text-sm text-zinc-500">Lesson: {sub.lessons?.title}</p>
                      </div>
                      <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                        <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-2">Assignment URL</p>
                        <a href={sub.assignment_url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 break-all font-mono text-sm">
                          {sub.assignment_url}
                        </a>
                      </div>
                    </div>
                    <div className="w-full md:w-64 space-y-4 flex flex-col justify-center">
                      <input type="number" id={`score-${sub.id}`} placeholder="Score (0-100)" className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl font-bold" defaultValue={sub.enrollment?.final_score || 0} />
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => handleGrade(sub.enrollment?.id, (document.getElementById(`score-${sub.id}`) as HTMLInputElement).value, "approved")} className="bg-emerald-600 hover:bg-emerald-500 p-3 rounded-xl text-xs font-bold transition-all">Approve</button>
                        <button onClick={() => handleGrade(sub.enrollment?.id, (document.getElementById(`score-${sub.id}`) as HTMLInputElement).value, "rejected")} className="bg-zinc-800 hover:bg-red-600 p-3 rounded-xl text-xs font-bold transition-all">Reject</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "students" && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold">Student Directory</h2>
            <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-xl">
              <table className="w-full text-left">
                <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-widest font-bold">
                  <tr><th className="p-6">Student</th><th className="p-6">Branch</th><th className="p-6">Role</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="p-6">
                        <div className="font-bold">{s.full_name || "New Student"}</div>
                      </td>
                      <td className="p-6"><span className="px-3 py-1 bg-zinc-800 rounded-lg text-xs border border-zinc-700">{s.departments?.name || "Unassigned"}</span></td>
                      <td className="p-6"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${s.role === 'admin' ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-500'}`}>{s.role}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
