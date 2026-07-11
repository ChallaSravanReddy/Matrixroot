"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSidebarContext } from "@/components/SidebarContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  LogOut, 
  User, 
  Layers,
  ArrowRight,
  TrendingUp,
  Menu,
  X,
  Lock,
  Unlock,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileCompletionModal } from "@/components/ProfileCompletionModal";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring" as const, 
      stiffness: 400, 
      damping: 25 
    } 
  },
};

export default function WorkspaceHubPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const { setIsSidebarOpen } = useSidebarContext();
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const fetchWorkspaceHubData = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          router.push("/login");
          return;
        }
        setSessionUser(session.user);

        const [profileRes, enrollRes] = await Promise.all([
          supabase.from("profiles").select("*, departments(id, name)").eq("id", session.user.id).single(),
          supabase.from("enrollments").select("*, courses(*, departments(*))").eq("student_id", session.user.id)
        ]);

        let enrolledCourseIds: string[] = [];
        if (enrollRes.data) {
          enrolledCourseIds = enrollRes.data
            .filter((e: any) => e.payment_status === "completed" || e.payment_status === "success")
            .map((e: any) => e.course_id);
        }

        let progressData: any[] = [];
        let lessonData: any[] = [];

        if (enrolledCourseIds.length > 0) {
          const [progressRes, lessonRes] = await Promise.all([
            supabase.from("user_progress").select("*").eq("user_id", session.user.id).in("course_id", enrolledCourseIds),
            supabase.from("lessons").select("id, course_id").in("course_id", enrolledCourseIds)
          ]);
          if (progressRes.data) progressData = progressRes.data;
          if (lessonRes.data) lessonData = lessonRes.data;
        }

        if (profileRes.data) {
          setProfile(profileRes.data);
          if (!profileRes.data.department_slug || !profileRes.data.year_of_study || !profileRes.data.college_name || !profileRes.data.phone) {
            setShowProfileModal(true);
          }
        } else {
          setShowProfileModal(true);
        }
        if (enrollRes.data) setEnrollments(enrollRes.data);
        setUserProgress(progressData);
        setCourseLessons(lessonData);
      } catch (error) {
        console.error("Workspace Hub Load Error:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaceHubData();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#FAF6F0] items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#FDBF84] border-t-[#8B5A2B] rounded-full"></div>
      </div>
    );
  }

  // Filter only completed or successful payments
  const activeEnrollments = enrollments.filter(e => e.payment_status === "completed" || e.payment_status === "success");

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAF6F0]">
        {/* Header Navigation */}
        <header className="h-16 border-b border-black/10 bg-white flex items-center justify-between px-6 shrink-0 shadow-none">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 lg:hidden text-black hover:bg-black/5 rounded-[8px]"
            >
              <Menu size={20} />
            </button>
            <span className="text-xs font-bold text-[#8B5A2B] bg-[#FDBF84]/25 px-2.5 py-1 rounded-[6px] border border-[#FDBF84]/40">
              Edtech Studio Mode
            </span>
          </div>
        </header>

        {/* Content View */}
        <div className="flex-1 overflow-y-auto p-[32px] md:p-[48px] space-y-[40px] pb-24 bg-[#FAF6F0]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-black flex items-center gap-2">
              <Layers className="text-[#8B5A2B]" size={24} /> Workspace Hub
            </h1>
            <p className="text-xs text-black/60 mt-1">Submit weekly task deliverables and view grading status for your enrolled study tracks.</p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]"
          >
            {activeEnrollments.map(enroll => {
              const course = enroll.courses;
              if (!course) return null;

              const lessonsForCourse = courseLessons.filter(l => l.course_id === course.id);
              const completedForCourse = userProgress.filter(p => p.course_id === course.id);
              
              const totalLessons = Math.max(1, lessonsForCourse.length);
              const progressPercent = Math.round((completedForCourse.length / totalLessons) * 100);
              const isCompleted = lessonsForCourse.length > 0 && completedForCourse.length >= lessonsForCourse.length;

              return (
                <motion.div 
                  key={enroll.id} 
                  variants={cardVariants}
                  className="flex flex-col bg-white border border-black/10 rounded-[12px] hover:border-black/20 transition-colors overflow-hidden relative"
                >
                  <div className="p-[20px] flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-[8px]">
                      <span className="text-[9px] font-bold text-[#8B5A2B] uppercase tracking-wider bg-[#FDBF84]/25 border border-[#FDBF84]/40 px-2 py-0.5 rounded-[4px]">
                        {course.departments?.name || "Internship"}
                      </span>
                      <span className="flex items-center gap-1 text-[9px] font-bold text-black/60">
                        {isCompleted ? (
                          <span className="text-green-600 flex items-center gap-0.5"><Unlock size={10} /> Unlocked</span>
                        ) : (
                          <span className="text-amber-600 flex items-center gap-0.5"><Lock size={10} /> Locked</span>
                        )}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-black mb-[6px] leading-tight">
                      {course.title}
                    </h3>
                    <p className="text-xs text-black/70 line-clamp-2 mb-[16px] leading-[1.6] flex-1 font-medium">
                      {course.description}
                    </p>

                    <div className="mb-[20px] space-y-1.5 pt-2 border-t border-black/5">
                      <div className="flex justify-between text-[10px] font-bold text-black/60">
                        <span>Course Lessons Progress</span>
                        <span className="text-[#8B5A2B]">{progressPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden border border-black/5">
                        <div className="h-full bg-[#8B5A2B]" style={{ width: `${progressPercent}%` }} />
                      </div>
                    </div>

                    <div className="mt-auto pt-1">
                      {isCompleted ? (
                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                          <Button 
                            className="w-full rounded-[8px] h-9 font-extrabold bg-[#FDBF84] text-neutral-900 hover:bg-[#FCAE68] border border-[#FDBF84]/25 shadow-none text-xs flex items-center justify-center gap-1.5 cursor-pointer" 
                            onClick={() => router.push(`/workspace/${course.id}`)}
                          >
                            Enter Workspace <ArrowRight size={12} className="text-neutral-900" />
                          </Button>
                        </motion.div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-[10px] text-amber-600 font-bold bg-amber-500/5 border border-amber-500/10 p-2 rounded-[8px] text-center">
                            Complete all lessons to unlock your screenshot submissions board.
                          </p>
                          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                            <Button 
                              className="w-full rounded-[8px] h-9 font-extrabold bg-[#FDBF84] text-neutral-900 hover:bg-[#FCAE68] border border-[#FDBF84]/25 shadow-none text-xs flex items-center justify-center gap-1.5 cursor-pointer" 
                              onClick={() => router.push(`/dashboard/courses/${course.id}`)}
                            >
                              Go to Lessons <ArrowRight size={12} className="text-neutral-900" />
                            </Button>
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {activeEnrollments.length === 0 && (
              <div className="col-span-full py-[64px] text-center bg-white border border-black/10 rounded-[12px] space-y-[16px]">
                <div className="w-12 h-12 bg-[#FDBF84]/20 border border-[#FDBF84]/35 rounded-[12px] flex items-center justify-center mx-auto text-[#8B5A2B]">
                  <Layers size={20} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-black">No Active Workspaces Found</h3>
                  <p className="text-xs text-black/70 max-w-sm mx-auto font-medium">You need to enroll in a study track to start submitting screenshot deliverables.</p>
                </div>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="pt-2">
                  <Button className="rounded-[8px] bg-[#FDBF84] text-neutral-900 hover:bg-[#FCAE68] border border-[#FDBF84]/25 shadow-none h-10 px-6 text-xs font-extrabold cursor-pointer" onClick={() => router.push('/dashboard/courses')}>
                    Browse Course Catalog
                  </Button>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
    </main>
  );
}


