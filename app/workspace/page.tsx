"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Clock,
  Menu,
  X,
  Lock,
  Unlock,
  CheckCircle,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileCompletionModal } from "@/components/ProfileCompletionModal";

interface Course {
  id: string;
  title: string;
  description: string;
  video_url: string;
  departments: {
    name: string;
    slug: string;
  };
}

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const fetchWorkspaceHubData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setSessionUser(session.user);

      try {
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
      <div className="flex min-h-screen bg-[#F9F5F0] items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#8B4513] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Filter only completed or successful payments
  const activeEnrollments = enrollments.filter(e => e.payment_status === "completed" || e.payment_status === "success");

  return (
    <div className="flex h-screen bg-[#F9F5F0] text-[#3D2B1F] overflow-hidden font-sans">
      {/* Sidebar - Friendly Edtech layout */}
      <aside className="w-64 hidden lg:flex flex-col border-r border-[#8B4513]/10 bg-white">
        <div className="p-6 flex items-center gap-3 border-b border-[#8B4513]/10">
          <div className="w-8 h-8 rounded-[8px] bg-[#8B4513]/10 flex items-center justify-center text-[#8B4513]">
            <GraduationCap size={20} />
          </div>
          <span className="font-bold text-base text-[#3D2B1F]">Matrix Root Studio</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-[#8B4513] uppercase tracking-wider mb-2">My Learning</p>
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard Hub" onClick={() => router.push('/dashboard')} />
          <SidebarItem icon={<BookOpen size={18} />} label="Courses" onClick={() => router.push('/dashboard/courses')} />
          <SidebarItem icon={<Layers size={18} />} label="Workspace Hub" active />
          <SidebarItem icon={<BookOpen size={18} />} label="Subscribed Tracks" onClick={() => router.push('/dashboard/internships')} />
          <SidebarItem icon={<TrendingUp size={18} />} label="Progress & Grades" onClick={() => router.push('/dashboard/performance')} />
          <SidebarItem icon={<Sparkles size={18} />} label="Live Support" onClick={() => router.push('/dashboard/support')} />
          
          <div className="pt-6">
            <p className="px-3 text-[10px] font-bold text-[#8B4513] uppercase tracking-wider mb-2">Account Management</p>
            <SidebarItem icon={<User size={18} />} label="Profile Setup" onClick={() => router.push('/profile')} />
            <SidebarItem icon={<LogOut size={18} />} label="Sign Out" onClick={handleSignOut} />
          </div>
        </nav>

        <div className="p-4 border-t border-[#8B4513]/10">
          <div className="flex items-center gap-3 p-2 rounded-[12px] bg-[#F9F5F0] border border-[#8B4513]/10">
            <div className="w-8 h-8 rounded-[8px] bg-[#8B4513]/10 flex items-center justify-center text-[#8B4513] font-bold text-xs">
              {profile?.full_name?.charAt(0) || "S"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#3D2B1F] truncate">{profile?.full_name || "Student Account"}</p>
              <p className="text-[10px] text-[#3D2B1F]/60 truncate font-medium">{profile?.departments?.name || "Active Program"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-[#3D2B1F]/40 backdrop-blur-sm" />
          <motion.aside 
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-0 left-0 bottom-0 w-72 bg-white flex flex-col border-r border-[#8B4513]/10"
            onClick={(e) => e.stopPropagation()}
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
              <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard Hub" onClick={() => { setIsSidebarOpen(false); router.push('/dashboard'); }} />
              <SidebarItem icon={<BookOpen size={18} />} label="Courses" onClick={() => { setIsSidebarOpen(false); router.push('/dashboard/courses'); }} />
              <SidebarItem icon={<Layers size={18} />} label="Workspace Hub" active />
              <SidebarItem icon={<BookOpen size={18} />} label="Subscribed Tracks" onClick={() => router.push('/dashboard/internships')} />
              <SidebarItem icon={<TrendingUp size={18} />} label="Progress & Grades" onClick={() => router.push('/dashboard/performance')} />
              <SidebarItem icon={<Sparkles size={18} />} label="Live Support" onClick={() => { setIsSidebarOpen(false); router.push('/dashboard/support'); }} />
              <div className="pt-6">
                <SidebarItem icon={<User size={18} />} label="Profile Setup" onClick={() => router.push('/profile')} />
                <SidebarItem icon={<LogOut size={18} />} label="Sign Out" onClick={handleSignOut} />
              </div>
            </nav>
          </motion.aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header Navigation */}
        <header className="h-16 border-b border-[#8B4513]/10 bg-white flex items-center justify-between px-6 shrink-0 shadow-none">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 lg:hidden text-[#8B4513] hover:bg-[#8B4513]/5 rounded-[8px]"
            >
              <Menu size={20} />
            </button>
            <span className="text-xs font-bold text-[#8B4513] bg-[#8B4513]/5 px-2.5 py-1 rounded-[6px] border border-[#8B4513]/10">
              Edtech Studio Mode
            </span>
          </div>
        </header>

        {/* Content View */}
        <div className="flex-1 overflow-y-auto p-[32px] md:p-[48px] space-y-[40px] pb-24">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#3D2B1F] flex items-center gap-2">
              <Layers className="text-[#8B4513]" size={24} /> Workspace Hub
            </h1>
            <p className="text-xs text-[#3D2B1F]/60 mt-1">Submit weekly task deliverables and view grading status for your enrolled study tracks.</p>
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
                  className="flex flex-col bg-white border border-[#8B4513]/20 rounded-[12px] hover:border-[#8B4513]/40 transition-colors overflow-hidden relative"
                >
                  <div className="p-[20px] flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-[8px]">
                      <span className="text-[9px] font-bold text-[#8B4513] uppercase tracking-wider bg-[#8B4513]/5 border border-[#8B4513]/10 px-2 py-0.5 rounded-[4px]">
                        {course.departments?.name || "Internship"}
                      </span>
                      <span className="flex items-center gap-1 text-[9px] font-bold text-[#3D2B1F]/60">
                        {isCompleted ? (
                          <span className="text-green-600 flex items-center gap-0.5"><Unlock size={10} /> Unlocked</span>
                        ) : (
                          <span className="text-amber-600 flex items-center gap-0.5"><Lock size={10} /> Locked</span>
                        )}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#3D2B1F] mb-[6px] leading-tight">
                      {course.title}
                    </h3>
                    <p className="text-xs text-[#3D2B1F]/70 line-clamp-2 mb-[16px] leading-[1.6] flex-1 font-medium">
                      {course.description}
                    </p>

                    <div className="mb-[20px] space-y-1.5 pt-2 border-t border-[#8B4513]/5">
                      <div className="flex justify-between text-[10px] font-bold text-[#3D2B1F]/60">
                        <span>Course Lessons Progress</span>
                        <span className="text-[#8B4513]">{progressPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#F9F5F0] rounded-full overflow-hidden border border-[#8B4513]/5">
                        <div className="h-full bg-[#8B4513]" style={{ width: `${progressPercent}%` }} />
                      </div>
                    </div>

                    <div className="mt-auto pt-1">
                      {isCompleted ? (
                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                          <Button 
                            className="w-full rounded-[8px] h-9 font-bold bg-[#8B4513] text-white hover:bg-[#723910] shadow-none text-xs flex items-center justify-center gap-1.5" 
                            onClick={() => router.push(`/workspace/${course.id}`)}
                          >
                            Enter Workspace <ArrowRight size={12} />
                          </Button>
                        </motion.div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-200/50 p-2 rounded-[8px] text-center">
                            Complete all lessons to unlock your screenshot submissions board.
                          </p>
                          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                            <Button 
                              className="w-full rounded-[8px] h-9 font-bold bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] shadow-none text-xs flex items-center justify-center gap-1.5" 
                              onClick={() => router.push(`/dashboard/courses/${course.id}`)}
                            >
                              Go to Lessons <ArrowRight size={12} />
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
              <div className="col-span-full py-[64px] text-center bg-white border border-[#8B4513]/10 rounded-[12px] space-y-[16px]">
                <div className="w-12 h-12 bg-[#8B4513]/5 border border-[#8B4513]/10 rounded-[12px] flex items-center justify-center mx-auto text-[#8B4513]">
                  <Layers size={20} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#3D2B1F]">No Active Workspaces Found</h3>
                  <p className="text-xs text-[#3D2B1F]/70 max-w-sm mx-auto font-medium">You need to enroll in a study track to start submitting screenshot deliverables.</p>
                </div>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="pt-2">
                  <Button className="rounded-[8px] bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] shadow-none h-10 px-6 text-xs font-bold" onClick={() => router.push('/dashboard/courses')}>
                    Browse Course Catalog
                  </Button>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {showProfileModal && (
        <ProfileCompletionModal
          userId={sessionUser?.id}
          initialData={profile}
          onComplete={() => {
            setShowProfileModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <motion.button 
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3.5 min-h-[36px] rounded-[8px] text-xs font-bold transition-colors ${
        active 
        ? "bg-[#8B4513]/5 text-[#8B4513] border border-[#8B4513]/10" 
        : "text-[#3D2B1F]/70 hover:bg-[#8B4513]/5 hover:text-[#3D2B1F]"
      }`}
    >
      <span className="text-[#8B4513] shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </motion.button>
  );
}
