"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import {
  TrendingUp, LayoutDashboard, BookOpen, User, LogOut,
  ArrowLeft, Award, ShieldCheck, CheckCircle2, Menu, X,
  GraduationCap, Layers, BookMarked, Clock, BarChart2, Sparkles
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
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) { router.push("/login"); return; }

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
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-white items-center justify-center font-sans">
        <div className="animate-spin h-8 w-8 border-4 border-[#8B5A2B] border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

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
    <div className="flex h-screen bg-white text-black overflow-hidden font-sans">

      {/* Desktop Sidebar */}
      <aside className="w-64 hidden lg:flex flex-col border-r border-black/10 bg-white shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-black/10">
          <div className="w-8 h-8 rounded-[8px] bg-black/5 flex items-center justify-center text-[#8B5A2B]">
            <GraduationCap size={20} className="text-[#8B5A2B]" />
          </div>
          <span className="font-bold text-base text-black">Matrix Root Studio</span>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard Hub" onClick={() => router.push('/dashboard')} />
          <SidebarItem icon={<BookOpen size={18} />} label="Courses" onClick={() => router.push('/dashboard/courses')} />
          <SidebarItem icon={<Layers size={18} />} label="Workspace Hub" onClick={() => router.push('/workspace')} />
          <SidebarItem icon={<BookOpen size={18} />} label="Subscribed Tracks" onClick={() => router.push('/dashboard/internships')} />
          <SidebarItem icon={<TrendingUp size={18} />} label="Progress & Grades" active />
          <SidebarItem icon={<Sparkles size={18} />} label="Live Support" onClick={() => router.push('/dashboard/support')} />
          <div className="pt-6">
            <SidebarItem icon={<User size={18} />} label="Profile Setup" onClick={() => router.push('/profile')} />
            <SidebarItem icon={<LogOut size={18} />} label="Sign Out" onClick={handleSignOut} />
          </div>
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setIsSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.aside
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-0 left-0 bottom-0 w-72 bg-white flex flex-col border-r border-black/10"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 flex items-center justify-between border-b border-black/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[8px] bg-black/5 flex items-center justify-center text-[#8B5A2B]">
                  <GraduationCap size={20} className="text-[#8B5A2B]" />
                </div>
                <span className="font-bold text-base text-black">Matrix Root</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-black/40 hover:text-black">
                <X size={20} className="text-[#8B5A2B]" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
              <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard Hub" onClick={() => router.push('/dashboard')} />
              <SidebarItem icon={<BookOpen size={18} />} label="Courses" onClick={() => { setIsSidebarOpen(false); router.push('/dashboard/courses'); }} />
              <SidebarItem icon={<Layers size={18} />} label="Workspace Hub" onClick={() => { setIsSidebarOpen(false); router.push('/workspace'); }} />
              <SidebarItem icon={<BookOpen size={18} />} label="Subscribed Tracks" onClick={() => router.push('/dashboard/internships')} />
              <SidebarItem icon={<TrendingUp size={18} />} label="Progress & Grades" active />
              <SidebarItem icon={<Sparkles size={18} />} label="Live Support" onClick={() => { setIsSidebarOpen(false); router.push('/dashboard/support'); }} />
              <div className="pt-6">
                <SidebarItem icon={<User size={18} />} label="Profile Setup" onClick={() => router.push('/profile')} />
                <SidebarItem icon={<LogOut size={18} />} label="Sign Out" onClick={handleSignOut} />
              </div>
            </nav>
          </motion.aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        <header className="h-16 border-b border-black/10 bg-white flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-black hover:bg-black/5 rounded-[8px]">
              <Menu size={20} className="text-[#8B5A2B]" />
            </button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
              <Button variant="outline" size="icon" onClick={() => router.push('/dashboard')} className="rounded-[12px] h-8 w-8 border-black/10 shadow-none">
                <ArrowLeft size={16} className="text-[#8B5A2B]" />
              </Button>
            </motion.div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-black">Performance Metrics</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[12px] bg-[#8B5A2B]/10 text-[10px] font-medium text-[#8B5A2B] border border-[#8B5A2B]/20">
              <Award size={12} className="text-[#8B5A2B]" />
              <span>Live Student Data</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 pb-20 max-w-[1400px] w-full mx-auto bg-white">

          {/* Student Info Banner */}
          <motion.div variants={cardVariants} initial="hidden" animate="visible"
            className="bg-white border border-black/10 rounded-[12px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center text-black text-lg font-bold shrink-0">
                {profile?.full_name?.charAt(0)?.toUpperCase() || "S"}
              </div>
              <div>
                <h1 className="text-base font-semibold text-black">{profile?.full_name || "Student"}</h1>
                <p className="text-xs text-black/60 mt-0.5">
                  {profile?.departments?.name || profile?.college || "Matrix Root Academy"}
                  {profile?.year ? ` · Year ${profile.year}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-[12px] border border-emerald-250 self-start sm:self-auto">
              <ShieldCheck size={13} className="text-[#8B5A2B]" />
              <span>{totalEnrolled} Course{totalEnrolled !== 1 ? "s" : ""} Enrolled</span>
            </div>
          </motion.div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <StatCard label="Overall Progress" value={`${overallProgress}%`} sub="Lessons completed" bar={overallProgress} barColor="#000000" delay={0} />
            <StatCard label="Lessons Completed" value={`${totalLessonsCompleted}`} sub={`of ${totalLessonsAcrossEnrolled} total`} bar={totalLessonsAcrossEnrolled > 0 ? (totalLessonsCompleted / totalLessonsAcrossEnrolled) * 100 : 0} barColor="#000000" delay={0.1} />
            <StatCard label="Assignments Submitted" value={`${assignmentsSubmitted}`} sub="Task submissions" bar={totalLessonsCompleted > 0 ? (assignmentsSubmitted / totalLessonsCompleted) * 100 : 0} barColor="#000000" delay={0.2} />
            <StatCard label="Courses Enrolled" value={`${totalEnrolled}`} sub="Active tracks" bar={Math.min(totalEnrolled * 25, 100)} barColor="#000000" delay={0.3} />
          </div>

          {/* No enrollments state */}
          {enrollments.length === 0 && (
            <motion.div variants={cardVariants} initial="hidden" animate="visible"
              className="bg-white border border-black/10 rounded-[12px] p-12 text-center space-y-3">
              <BookMarked size={40} className="text-[#8B5A2B]/40 mx-auto" />
              <h3 className="text-base font-medium text-black">No Courses Enrolled Yet</h3>
              <p className="text-xs text-black/60">Enroll in a course to start tracking your performance here.</p>
              <button onClick={() => router.push('/dashboard/courses')}
                className="mt-2 px-5 py-2 bg-black text-white text-xs font-semibold rounded-[10px] hover:bg-neutral-900 transition-colors">
                Browse Courses
              </button>
            </motion.div>
          )}

          {/* Course Tabs + Detail */}
          {enrollments.length > 0 && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-lg font-medium tracking-[-0.02em] text-black">Course Progress Breakdown</h3>
                <p className="text-xs text-black/60">Select a course below to view lesson-level details</p>
              </div>

              {/* Course Tab Switcher */}
              <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none border-b border-black/10">
                {courseStats.map((stat, i) => {
                  const isActive = stat.enr.course_id === activeCourseId;
                  return (
                    <motion.button
                      key={stat.enr.course_id}
                      whileHover={{ y: -1 }} whileTap={{ y: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      onClick={() => setActiveCourseId(stat.enr.course_id)}
                      className={`pb-3 text-xs font-medium transition-colors relative shrink-0 flex items-center gap-2 ${isActive ? "text-black font-semibold" : "text-black/60 hover:text-black"}`}
                    >
                      <BookOpen size={12} className={isActive ? "text-[#8B5A2B]" : "text-[#8B5A2B]/60"} />
                      <span className="max-w-[160px] truncate">{stat.course?.title || `Course ${i + 1}`}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-[8px] border ${isActive ? "bg-black text-white border-black" : "bg-white text-black/60 border-black/10"}`}>
                        {stat.pct}%
                      </span>
                      {isActive && (
                        <motion.div layoutId="activeTabUnderline"
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"
                          transition={{ type: "spring", stiffness: 400, damping: 25 }} />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Active Course Detail */}
              {activeStat && (
                <motion.div variants={cardVariants} initial="hidden" animate="visible" key={activeCourseId}
                  className="bg-white border border-black/10 rounded-[12px] overflow-hidden shadow-none">

                  {/* Course Header */}
                  <div className="p-6 md:p-8 border-b border-black/10 bg-neutral-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-black">{activeStat.course?.title}</h3>
                      <p className="text-xs text-black/60 mt-1">
                        {activeStat.completed.length} of {activeStat.lessons.length} lessons completed
                        {activeStat.lastActivity && ` · Last active ${new Date(activeStat.lastActivity).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Progress ring */}
                      <div className="relative w-14 h-14">
                        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                          <circle cx="28" cy="28" r="22" fill="none" stroke="#f3f4f6" strokeWidth="5" />
                          <circle cx="28" cy="28" r="22" fill="none" stroke="#000000" strokeWidth="5"
                            strokeDasharray={`${2 * Math.PI * 22}`}
                            strokeDashoffset={`${2 * Math.PI * 22 * (1 - activeStat.pct / 100)}`}
                            strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-black">
                          {activeStat.pct}%
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-medium text-black/60 block tracking-wider">Status</span>
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
                        <tr className="border-b border-black/10 text-[10px] font-medium uppercase tracking-wider text-black/60 bg-neutral-50/50">
                          <th className="p-4 pl-6">#</th>
                          <th className="p-4">Lesson Title</th>
                          <th className="p-4 text-center">Assignment</th>
                          <th className="p-4 text-center">Completed On</th>
                          <th className="p-4 pr-6 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 text-xs">
                        {activeLessons.map((lesson, idx) => {
                          const progressEntry = activeStat.completed.find((p: any) => p.lesson_id === lesson.id);
                          const isDone = activeCompletedIds.has(lesson.id);
                          return (
                            <tr key={lesson.id} className="hover:bg-neutral-50 transition-colors">
                              <td className="p-4 pl-6 text-black/40 font-mono text-[11px]">{String(idx + 1).padStart(2, "0")}</td>
                              <td className="p-4 font-normal text-black max-w-xs">
                                <span className="truncate block max-w-[260px]">{lesson.title}</span>
                              </td>
                              <td className="p-4 text-center">
                                {lesson.has_assignment ? (
                                  progressEntry?.assignment_url ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-black bg-black/5 px-2 py-0.5 rounded border border-black/10">
                                      <CheckCircle2 size={10} className="text-[#8B5A2B]" /> Submitted
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-250">Pending</span>
                                  )
                                ) : (
                                  <span className="text-[10px] text-black/30">—</span>
                                )}
                              </td>
                               <td className="p-4 text-center text-black/60">
                                {progressEntry?.completed_at
                                  ? new Date(progressEntry.completed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                                  : <span className="text-black/30">—</span>}
                              </td>
                              <td className="p-4 pr-6 text-right">
                                {isDone ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-[12px] border border-emerald-250">
                                    <CheckCircle2 size={10} className="text-[#8B5A2B]" /> Done
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-black/50 bg-neutral-50 px-2 py-0.5 rounded-[12px] border border-black/10">
                                    <Clock size={10} className="text-[#8B5A2B]" /> Pending
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {activeLessons.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center py-10 text-xs text-black/40 italic">No lessons found for this course.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer */}
                  <div className="p-4 bg-neutral-50 border-t border-black/10 flex flex-wrap items-center justify-between gap-4 text-xs text-black/70">
                    <div className="flex items-center gap-2">
                      <BarChart2 size={14} className="text-[#8B5A2B]" />
                      <span>{activeStat.assignments} assignment{activeStat.assignments !== 1 ? "s" : ""} submitted for this course</span>
                    </div>
                    <div className="font-medium text-black">
                      Lessons Done: <span className="text-black">{activeStat.completed.length} / {activeStat.lessons.length}</span>
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
      className="bg-white border border-black/10 rounded-[12px] p-6 flex flex-col justify-between shadow-none">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-medium uppercase tracking-wider text-black/60">{label}</span>
      </div>
      <div>
        <p className="text-3xl font-normal tracking-[-0.02em] text-black">{value}</p>
        <p className="text-xs text-black/70 mt-1 leading-[1.6]">{sub}</p>
      </div>
      <div className="h-1 w-full bg-neutral-100 rounded-full mt-4 overflow-hidden border border-black/5">
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
      className={`w-full flex items-center gap-3 px-4 min-h-[40px] rounded-[12px] text-xs font-medium transition-colors ${
        active 
        ? "bg-black text-white" 
        : "text-black/70 hover:bg-black/5 hover:text-black"
      }`}
    >
      <span className="text-[#8B5A2B] shrink-0">{icon}</span>
      {label}
    </motion.button>
  );
}
