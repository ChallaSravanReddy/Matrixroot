"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  TrendingUp, LayoutDashboard, BookOpen, User, LogOut,
  ArrowLeft, Award, ShieldCheck, CheckCircle2, Menu, X,
  GraduationCap, Layers, BookMarked, Clock, BarChart2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 400, damping: 25 } },
};

export default function PerformanceReportCardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [allLessons, setAllLessons] = useState<any[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      try {
        const [profileRes, enrollRes] = await Promise.all([
          supabase.from("profiles").select("*, departments(name)").eq("id", session.user.id).single(),
          supabase.from("enrollments").select("*, courses(*)").eq("student_id", session.user.id).in("payment_status", ["completed", "success"]),
        ]);

        let enrolledCourseIds: string[] = [];
        if (enrollRes.data) {
          enrolledCourseIds = enrollRes.data.map((e: any) => e.course_id);
        }

        let progressData: any[] = [];
        let lessonData: any[] = [];

        if (enrolledCourseIds.length > 0) {
          const [progressRes, lessonRes] = await Promise.all([
            supabase.from("user_progress").select("*").eq("user_id", session.user.id).in("course_id", enrolledCourseIds),
            supabase.from("lessons").select("id, course_id, title, order_index, has_assignment").in("course_id", enrolledCourseIds).order("order_index", { ascending: true }),
          ]);
          if (progressRes.data) progressData = progressRes.data;
          if (lessonRes.data) lessonData = lessonRes.data;
        }

        if (profileRes.data) setProfile(profileRes.data);
        if (enrollRes.data) {
          setEnrollments(enrollRes.data);
          if (enrollRes.data.length > 0) setActiveCourseId(enrollRes.data[0].course_id);
        }
        setUserProgress(progressData);
        setAllLessons(lessonData);
      } catch (err) {
        console.error("Performance Page Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F9F5F0] items-center justify-center font-sans">
        <div className="animate-spin h-8 w-8 border-4 border-[#8B4513] border-t-transparent rounded-full" />
      </div>
    );
  }

  // ── Derived metrics ──────────────────────────────────────────────
  const totalEnrolled = enrollments.length;
  const totalLessonsCompleted = userProgress.length;

  const totalLessonsAcrossEnrolled = allLessons.filter(l =>
    enrollments.some(e => e.course_id === l.course_id)
  ).length;

  const overallProgress = totalLessonsAcrossEnrolled > 0
    ? Math.round((totalLessonsCompleted / totalLessonsAcrossEnrolled) * 100)
    : 0;

  const assignmentsSubmitted = userProgress.filter(p => p.assignment_url).length;

  // Per-course stats
  const courseStats = enrollments.map(enr => {
    const course = enr.courses;
    const lessons = allLessons.filter(l => l.course_id === enr.course_id);
    const completed = userProgress.filter(p => p.course_id === enr.course_id);
    const pct = lessons.length > 0 ? Math.round((completed.length / lessons.length) * 100) : 0;
    const lastActivity = completed.length > 0
      ? completed.sort((a: any, b: any) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0].completed_at
      : null;
    const assignments = completed.filter((p: any) => p.assignment_url).length;
    return { course, enr, lessons, completed, pct, lastActivity, assignments };
  });

  const activeStat = courseStats.find(s => s.enr.course_id === activeCourseId) || courseStats[0];

  // Active course lesson list
  const activeLessons = activeStat ? allLessons.filter(l => l.course_id === activeStat.enr.course_id) : [];
  const activeCompletedIds = new Set((activeStat?.completed || []).map((p: any) => p.lesson_id));

  return (
    <div className="flex h-screen bg-[#F9F5F0] text-[#3D2B1F] overflow-hidden font-sans">

      {/* Desktop Sidebar */}
      <aside className="w-64 hidden lg:flex flex-col border-r border-[#8B4513]/10 bg-white shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-[#8B4513]/10">
          <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Logo" width={32} height={32} />
          <span className="font-medium text-lg text-[#3D2B1F]">Matrix Root</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard Overview" onClick={() => router.push('/dashboard')} />
          <SidebarItem icon={<BookOpen size={18} />} label="Courses" onClick={() => router.push('/dashboard/courses')} />
          <SidebarItem icon={<Layers size={18} />} label="Workspace Hub" onClick={() => router.push('/workspace')} />
          <SidebarItem icon={<BookOpen size={18} />} label="My Internships" onClick={() => router.push('/dashboard/internships')} />
          <SidebarItem icon={<TrendingUp size={18} />} label="Performance Metrics" active />
          <div className="pt-6">
            <SidebarItem icon={<User size={18} />} label="Member Settings" onClick={() => router.push('/profile')} />
            <SidebarItem icon={<LogOut size={18} />} label="Terminate Session" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} />
          </div>
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setIsSidebarOpen(false)}>
          <div className="absolute inset-0 bg-[#3D2B1F]/40 backdrop-blur-sm" />
          <motion.aside
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-0 left-0 bottom-0 w-72 bg-white flex flex-col border-r border-[#8B4513]/10"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 flex items-center justify-between border-b border-[#8B4513]/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[8px] bg-[#8B4513]/10 flex items-center justify-center text-[#8B4513]">
                  <GraduationCap size={20} />
                </div>
                <span className="font-bold text-base text-[#3D2B1F]">Matrix Root</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-[#3D2B1F]/40 hover:text-[#3D2B1F]">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
              <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard Hub" onClick={() => router.push('/dashboard')} />
              <SidebarItem icon={<BookOpen size={18} />} label="Courses" onClick={() => { setIsSidebarOpen(false); router.push('/dashboard/courses'); }} />
              <SidebarItem icon={<Layers size={18} />} label="Workspace Hub" onClick={() => { setIsSidebarOpen(false); router.push('/workspace'); }} />
              <SidebarItem icon={<BookOpen size={18} />} label="My Internships" onClick={() => router.push('/dashboard/internships')} />
              <SidebarItem icon={<TrendingUp size={18} />} label="Performance Metrics" active />
              <div className="pt-6">
                <SidebarItem icon={<User size={18} />} label="Profile Setup" onClick={() => router.push('/profile')} />
                <SidebarItem icon={<LogOut size={18} />} label="Sign Out" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} />
              </div>
            </nav>
          </motion.aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 border-b border-[#8B4513]/10 bg-[#F9F5F0]/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-[#8B4513] hover:bg-[#8B4513]/5 rounded-[8px]">
              <Menu size={20} />
            </button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
              <Button variant="outline" size="icon" onClick={() => router.push('/dashboard')} className="rounded-[12px] h-8 w-8 border-[#8B4513]/20 shadow-none">
                <ArrowLeft size={16} className="text-[#8B4513]" />
              </Button>
            </motion.div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#3D2B1F]">Performance Metrics</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[12px] bg-[#8B4513]/5 text-[10px] font-medium text-[#8B4513] border border-[#8B4513]/10">
              <Award size={12} />
              <span>Live Student Data</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 pb-20 max-w-[1400px] w-full mx-auto">

          {/* Student Info Banner */}
          <motion.div variants={cardVariants} initial="hidden" animate="visible"
            className="bg-white border border-[#8B4513]/20 rounded-[12px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#8B4513]/10 flex items-center justify-center text-[#8B4513] text-lg font-bold shrink-0">
                {profile?.full_name?.charAt(0)?.toUpperCase() || "S"}
              </div>
              <div>
                <h1 className="text-base font-semibold text-[#3D2B1F]">{profile?.full_name || "Student"}</h1>
                <p className="text-xs text-[#3D2B1F]/60 mt-0.5">
                  {profile?.departments?.name || profile?.college || "Matrix Root Academy"}
                  {profile?.year ? ` · Year ${profile.year}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-[12px] border border-emerald-200 self-start sm:self-auto">
              <ShieldCheck size={13} />
              <span>{totalEnrolled} Course{totalEnrolled !== 1 ? "s" : ""} Enrolled</span>
            </div>
          </motion.div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <StatCard label="Overall Progress" value={`${overallProgress}%`} sub="Lessons completed" bar={overallProgress} barColor="#8B4513" delay={0} />
            <StatCard label="Lessons Completed" value={`${totalLessonsCompleted}`} sub={`of ${totalLessonsAcrossEnrolled} total`} bar={totalLessonsAcrossEnrolled > 0 ? (totalLessonsCompleted / totalLessonsAcrossEnrolled) * 100 : 0} barColor="#059669" delay={0.1} />
            <StatCard label="Assignments Submitted" value={`${assignmentsSubmitted}`} sub="Task submissions" bar={totalLessonsCompleted > 0 ? (assignmentsSubmitted / totalLessonsCompleted) * 100 : 0} barColor="#d97706" delay={0.2} />
            <StatCard label="Courses Enrolled" value={`${totalEnrolled}`} sub="Active tracks" bar={Math.min(totalEnrolled * 25, 100)} barColor="#7c3aed" delay={0.3} />
          </div>

          {/* No enrollments state */}
          {enrollments.length === 0 && (
            <motion.div variants={cardVariants} initial="hidden" animate="visible"
              className="bg-white border border-[#8B4513]/20 rounded-[12px] p-12 text-center space-y-3">
              <BookMarked size={40} className="text-[#8B4513]/30 mx-auto" />
              <h3 className="text-base font-medium text-[#3D2B1F]">No Courses Enrolled Yet</h3>
              <p className="text-xs text-[#3D2B1F]/60">Enroll in a course to start tracking your performance here.</p>
              <button onClick={() => router.push('/dashboard/courses')}
                className="mt-2 px-5 py-2 bg-[#8B4513] text-white text-xs font-semibold rounded-[10px] hover:bg-[#7a3c12] transition-colors">
                Browse Courses
              </button>
            </motion.div>
          )}

          {/* Course Tabs + Detail */}
          {enrollments.length > 0 && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-lg font-medium tracking-[-0.02em] text-[#3D2B1F]">Course Progress Breakdown</h3>
                <p className="text-xs text-[#3D2B1F]/60">Select a course below to view lesson-level details</p>
              </div>

              {/* Course Tab Switcher */}
              <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none border-b border-[#8B4513]/10">
                {courseStats.map((stat, i) => {
                  const isActive = stat.enr.course_id === activeCourseId;
                  return (
                    <motion.button
                      key={stat.enr.course_id}
                      whileHover={{ y: -1 }} whileTap={{ y: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      onClick={() => setActiveCourseId(stat.enr.course_id)}
                      className={`pb-3 text-xs font-medium transition-colors relative shrink-0 flex items-center gap-2 ${isActive ? "text-[#8B4513] font-semibold" : "text-[#3D2B1F]/60 hover:text-[#3D2B1F]"}`}
                    >
                      <BookOpen size={12} className={isActive ? "text-[#8B4513]" : "text-[#3D2B1F]/40"} />
                      <span className="max-w-[160px] truncate">{stat.course?.title || `Course ${i + 1}`}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-[8px] border ${isActive ? "bg-[#8B4513]/5 text-[#8B4513] border-[#8B4513]/20" : "bg-white text-[#3D2B1F]/60 border-[#8B4513]/10"}`}>
                        {stat.pct}%
                      </span>
                      {isActive && (
                        <motion.div layoutId="activeTabUnderline"
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#8B4513]"
                          transition={{ type: "spring", stiffness: 400, damping: 25 }} />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Active Course Detail */}
              {activeStat && (
                <motion.div variants={cardVariants} initial="hidden" animate="visible" key={activeCourseId}
                  className="bg-white border border-[#8B4513]/20 rounded-[12px] overflow-hidden shadow-none">

                  {/* Course Header */}
                  <div className="p-6 md:p-8 border-b border-[#8B4513]/10 bg-[#F9F5F0]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-[#3D2B1F]">{activeStat.course?.title}</h3>
                      <p className="text-xs text-[#3D2B1F]/60 mt-1">
                        {activeStat.completed.length} of {activeStat.lessons.length} lessons completed
                        {activeStat.lastActivity && ` · Last active ${new Date(activeStat.lastActivity).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Progress ring */}
                      <div className="relative w-14 h-14">
                        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                          <circle cx="28" cy="28" r="22" fill="none" stroke="#F9F5F0" strokeWidth="5" />
                          <circle cx="28" cy="28" r="22" fill="none" stroke="#8B4513" strokeWidth="5"
                            strokeDasharray={`${2 * Math.PI * 22}`}
                            strokeDashoffset={`${2 * Math.PI * 22 * (1 - activeStat.pct / 100)}`}
                            strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[#8B4513]">
                          {activeStat.pct}%
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-medium text-[#3D2B1F]/60 block tracking-wider">Status</span>
                        <span className="text-xs font-semibold text-emerald-800">
                          {activeStat.pct === 100 ? "Completed ✓" : activeStat.pct > 50 ? "In Progress" : activeStat.pct > 0 ? "Started" : "Not Started"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lesson Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#8B4513]/10 text-[10px] font-medium uppercase tracking-wider text-[#3D2B1F]/60 bg-[#F9F5F0]/20">
                          <th className="p-4 pl-6">#</th>
                          <th className="p-4">Lesson Title</th>
                          <th className="p-4 text-center">Assignment</th>
                          <th className="p-4 text-center">Completed On</th>
                          <th className="p-4 pr-6 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#8B4513]/5 text-xs">
                        {activeLessons.map((lesson, idx) => {
                          const progressEntry = activeStat.completed.find((p: any) => p.lesson_id === lesson.id);
                          const isDone = activeCompletedIds.has(lesson.id);
                          return (
                            <tr key={lesson.id} className="hover:bg-[#F9F5F0]/30 transition-colors">
                              <td className="p-4 pl-6 text-[#3D2B1F]/40 font-mono text-[11px]">{String(idx + 1).padStart(2, "0")}</td>
                              <td className="p-4 font-normal text-[#3D2B1F] max-w-xs">
                                <span className="truncate block max-w-[260px]">{lesson.title}</span>
                              </td>
                              <td className="p-4 text-center">
                                {lesson.has_assignment ? (
                                  progressEntry?.assignment_url ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#8B4513] bg-[#8B4513]/5 px-2 py-0.5 rounded border border-[#8B4513]/10">
                                      <CheckCircle2 size={10} /> Submitted
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Pending</span>
                                  )
                                ) : (
                                  <span className="text-[10px] text-[#3D2B1F]/30">—</span>
                                )}
                              </td>
                              <td className="p-4 text-center text-[#3D2B1F]/60">
                                {progressEntry?.completed_at
                                  ? new Date(progressEntry.completed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                                  : <span className="text-[#3D2B1F]/30">—</span>}
                              </td>
                              <td className="p-4 pr-6 text-right">
                                {isDone ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-[12px] border border-emerald-200">
                                    <CheckCircle2 size={10} /> Done
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#3D2B1F]/50 bg-slate-50 px-2 py-0.5 rounded-[12px] border border-slate-200">
                                    <Clock size={10} /> Pending
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {activeLessons.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center py-10 text-xs text-[#3D2B1F]/40 italic">No lessons found for this course.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer */}
                  <div className="p-4 bg-[#F9F5F0]/30 border-t border-[#8B4513]/10 flex flex-wrap items-center justify-between gap-4 text-xs text-[#3D2B1F]/70">
                    <div className="flex items-center gap-2">
                      <BarChart2 size={14} className="text-[#8B4513]" />
                      <span>{activeStat.assignments} assignment{activeStat.assignments !== 1 ? "s" : ""} submitted for this course</span>
                    </div>
                    <div className="font-medium text-[#3D2B1F]">
                      Lessons Done: <span className="text-[#8B4513]">{activeStat.completed.length} / {activeStat.lessons.length}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub, bar, barColor, delay }: {
  label: string; value: string; sub: string; bar: number; barColor: string; delay: number;
}) {
  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay }}
      className="bg-white border border-[#8B4513]/20 rounded-[12px] p-6 flex flex-col justify-between shadow-none">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-medium uppercase tracking-wider text-[#3D2B1F]/60">{label}</span>
      </div>
      <div>
        <p className="text-3xl font-normal tracking-[-0.02em] text-[#3D2B1F]">{value}</p>
        <p className="text-xs text-[#3D2B1F]/70 mt-1 leading-[1.6]">{sub}</p>
      </div>
      <div className="h-1 w-full bg-[#F9F5F0] rounded-full mt-4 overflow-hidden border border-[#8B4513]/10">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(bar, 100)}%`, backgroundColor: barColor }} />
      </div>
    </motion.div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 min-h-[40px] rounded-[12px] text-xs font-medium transition-colors ${active ? "bg-[#8B4513]/5 text-[#8B4513] border border-[#8B4513]/10 font-semibold" : "text-[#3D2B1F]/70 hover:bg-[#8B4513]/5 hover:text-[#3D2B1F]"}`}
    >
      <span className="text-[#8B4513]">{icon}</span>
      {label}
    </motion.button>
  );
}
