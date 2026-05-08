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
      const data = await fetchAdminData(activeTab);

      if (activeTab === "courses") {
        if (data.departments) setDepartments(data.departments);
        if (data.courses) setCourses(data.courses);
      }
      
      if (activeTab === "lessons") {
        if (data.courses) setCourses(data.courses);
      }

      if (activeTab === "students") {
        if (data.students) setStudents(data.students);
      }

      if (activeTab === "grading" || activeTab === "certificates") {
        const { progressData, profiles, lessons, allCourses, enrolls } = data;

        if (progressData && profiles && lessons && allCourses && enrolls) {
          // Join the data manually in JS
          const joined = progressData.map((progress: any) => {
            const student = profiles.find((p: any) => p.id === progress.user_id);
            const lesson = lessons.find((l: any) => String(l.id) === String(progress.lesson_id));
            const course = allCourses.find((c: any) => String(c.id) === String(lesson?.course_id));
            const enrollment = enrolls.find((e: any) => e.student_id === progress.user_id && String(e.course_id) === String(lesson?.course_id));

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
            .filter((e: any) => e.payment_status === 'completed' && !e.is_certified)
            .map((e: any) => ({
              ...e,
              courses: allCourses.find((c: any) => String(c.id) === String(e.course_id)),
              profiles: profiles.find((p: any) => p.id === e.student_id)
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
      if (res.certified) {
        alert("All assignments approved! Certificate has been automatically issued.");
      } else {
        alert("Assignment approved! Progress updated.");
      }
      fetchData();
    } else {
      alert("Failed to update status: " + res.error);
    }
  };

  const handleGrade = async (enrollmentId: string, score: string, status: 'approved' | 'rejected') => {
    const parsedScore = parseInt(score) || 0;
    const res = await updateEnrollmentAction(enrollmentId, parsedScore, status);
    if (res.success) {
      alert(`Certificate ${status === 'approved' ? 'Approved' : 'Rejected'}!`);
      fetchData();
    } else {
      alert("Error updating record: " + res.error);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createCourseAction(newCourse);
    if (res.success) {
      alert("Course created!");
      setNewCourse({ title: "", description: "", dept_id: "" });
      fetchData();
    } else {
      alert("Error creating course: " + res.error);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createLessonAction(newLesson);
    if (res.success) {
      alert("Lesson added!");
      setNewLesson({ course_id: "", title: "", content_url: "", is_preview: false });
    } else {
      alert("Error adding lesson: " + res.error);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900">Loading...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-slate-200 bg-white/80 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Matrix Root Logo" width={40} height={40} className="object-contain drop-shadow-md" priority />
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Admin Portal
          </h1>
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
                activeTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        <button onClick={() => window.location.href='/dashboard'} className="mt-auto py-3 text-xs text-slate-400 hover:text-slate-900 transition-colors">← Back to Dashboard</button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        
        {activeTab === "courses" && (
          <div className="space-y-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold mb-6">Create New Course</h2>
              <form onSubmit={handleCreateCourse} className="space-y-4 bg-white p-8 rounded-3xl border border-slate-200">
                <input type="text" placeholder="Course Title" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl" value={newCourse.title} onChange={(e) => setNewCourse({...newCourse, title: e.target.value})} required />
                <textarea placeholder="Description" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl h-32" value={newCourse.description} onChange={(e) => setNewCourse({...newCourse, description: e.target.value})} required />
                <select className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl" value={newCourse.dept_id} onChange={(e) => setNewCourse({...newCourse, dept_id: e.target.value})} required>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <button className="w-full py-4 bg-blue-600 rounded-xl font-bold hover:bg-blue-700 transition-all">Create Track</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "certificates" && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold">Certificate Approvals</h2>
            <div className="grid grid-cols-1 gap-6">
              {certRequests.length === 0 ? (
                <div className="p-20 text-center bg-white/80 rounded-3xl border border-slate-200 border-dashed text-slate-400">
                  No pending certificate requests.
                </div>
              ) : (
                certRequests.map((req) => (
                  <div key={req.id} className="bg-white border border-slate-200 p-8 rounded-3xl flex items-center justify-between shadow-xl transition-all hover:border-slate-300">
                    <div>
                      <h3 className="text-xl font-bold">{req.profiles?.full_name || "Unknown Student"}</h3>
                      <p className="text-blue-600 font-medium">{req.courses?.title}</p>
                      <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Enrollment ID: {req.id}</p>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => handleGrade(req.id, "90", "approved")}
                        className="px-6 py-3 bg-sky-600 hover:bg-sky-500 rounded-xl font-bold text-sm shadow-lg shadow-sky-600/20"
                      >
                        Approve Certificate
                      </button>
                      <button 
                        onClick={() => handleGrade(req.id, "0", "rejected")}
                        className="px-6 py-3 bg-slate-200 hover:bg-red-600 rounded-xl font-bold text-sm"
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
                <div className="p-20 text-center bg-white/80 rounded-3xl border border-slate-200 border-dashed text-slate-400">
                  No assignments submitted yet.
                </div>
              ) : (
                submissions.map((sub) => (
                  <div key={sub.id} className="bg-white border border-slate-200 p-8 rounded-3xl flex flex-col md:flex-row gap-8 shadow-xl transition-all hover:border-slate-300">
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold">{sub.profiles?.full_name || "Student"}</h3>
                        <p className="text-blue-600 font-semibold">{sub.lessons?.courses?.title}</p>
                        <p className="text-sm text-slate-400">Lesson: {sub.lessons?.title}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-2">Assignment URL</p>
                        <a href={sub.assignment_url} target="_blank" rel="noreferrer" className="text-sky-400 hover:text-sky-300 break-all font-mono text-sm">
                          {sub.assignment_url}
                        </a>
                      </div>
                    </div>
                    <div className="w-full md:w-64 space-y-4 flex flex-col justify-center">
                      <div className="flex flex-col items-center gap-2">
                        {sub.status === 'approved' ? (
                          <span className="px-6 py-3 bg-sky-500/10 text-sky-500 border border-sky-500/20 rounded-xl font-bold text-sm flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                            </svg>
                            Approved
                          </span>
                        ) : (
                          <button 
                            onClick={() => handleApproveAssignment(sub.id, sub.enrollment?.id, sub.user_id, sub.lessons?.course_id)} 
                            className="w-full bg-blue-600 hover:bg-blue-700 p-4 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
                          >
                            Approve This Assignment
                          </button>
                        )}
                        <p className="text-[10px] text-slate-600 text-center uppercase tracking-widest font-bold">
                          Status: {sub.status || 'Pending'}
                        </p>
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
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 text-xs uppercase tracking-widest font-bold">
                  <tr><th className="p-6">Student</th><th className="p-6">Branch</th><th className="p-6">Role</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-slate-200/30 transition-colors">
                      <td className="p-6">
                        <div className="font-bold">{s.full_name || "New Student"}</div>
                      </td>
                      <td className="p-6"><span className="px-3 py-1 bg-slate-200 rounded-lg text-xs border border-slate-300">{s.departments?.name || "Unassigned"}</span></td>
                      <td className="p-6"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${s.role === 'admin' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>{s.role}</span></td>
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
