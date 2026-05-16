"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CertificatePDF from "@/components/CertificatePDF";
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
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Search,
  Sparkles,
  BadgeCheck,
  Award,
  PlayCircle,
  Layers,
  CheckCircle2,
  Clock,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnrollmentModal } from "@/components/EnrollmentModal";
import { getYouTubeThumbnail } from "@/lib/utils";

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

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<{id: string, title: string} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      try {
        const [profileRes, courseRes, enrollRes, progressRes, lessonRes] = await Promise.all([
          supabase.from("profiles").select("*, departments(id, name)").eq("id", session.user.id).single(),
          supabase.from("courses").select("*, departments(name, slug)"),
          supabase.from("enrollments").select("*, courses(*)").eq("student_id", session.user.id),
          supabase.from("user_progress").select("*").eq("user_id", session.user.id),
          supabase.from("lessons").select("id, course_id")
        ]);

        if (profileRes.data) setProfile(profileRes.data);
        if (courseRes.data) setAllCourses(courseRes.data as Course[]);
        if (enrollRes.data) setEnrollments(enrollRes.data);
        if (progressRes.data) setUserProgress(progressRes.data);
        if (lessonRes.data) setCourseLessons(lessonRes.data);
      } catch (error) {
        console.error("Dashboard Load Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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

  const departmentSlug = profile?.department_slug;
  const recommendedCourses = allCourses.filter(course => course.departments?.slug === departmentSlug);
  const otherCourses = allCourses.filter(course => course.departments?.slug !== departmentSlug);

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
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard Hub" active />
          <SidebarItem icon={<BookOpen size={18} />} label="Subscribed Tracks" onClick={() => router.push('/dashboard/internships')} />
          <SidebarItem icon={<TrendingUp size={18} />} label="Progress & Grades" onClick={() => router.push('/dashboard/performance')} />
          
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
              <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard Hub" active />
              <SidebarItem icon={<BookOpen size={18} />} label="Subscribed Tracks" onClick={() => router.push('/dashboard/internships')} />
              <SidebarItem icon={<TrendingUp size={18} />} label="Progress & Grades" onClick={() => router.push('/dashboard/performance')} />
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
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D2B1F]/40 h-4 w-4" />
              <input 
                type="text" 
                placeholder="Search courses, classes, lessons..." 
                className="pl-9 pr-4 py-1.5 bg-[#F9F5F0] border border-[#8B4513]/10 rounded-[8px] text-xs focus:outline-none focus:border-[#8B4513] w-64 text-[#3D2B1F] font-medium"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8B4513] bg-[#8B4513]/5 px-3 py-1.5 rounded-[8px] border border-[#8B4513]/10">
              <Sparkles size={12} /> Live Support
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-[24px] md:p-[48px] space-y-[32px] pb-20 max-w-7xl mx-auto w-full">
          {/* Welcome Announcement Block - Edtech Style */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="bg-white border border-[#8B4513]/20 rounded-[12px] p-[24px] md:p-[32px] flex flex-col md:flex-row md:items-center justify-between gap-[24px]"
          >
            <div className="space-y-[8px]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#8B4513] uppercase tracking-wider bg-[#8B4513]/5 px-2 py-0.5 rounded-[4px]">
                  Academic term active
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#3D2B1F]">
                Welcome back, {profile?.full_name?.split(' ')[0] || "Student"}! 👋
              </h1>
              <p className="text-xs text-[#3D2B1F]/80 max-w-xl leading-[1.6] font-medium">
                Pick up exactly where you left off. Review assigned course videos, submit evaluated projects, and earn accredited institutional certificates.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <Button asChild className="rounded-[8px] bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] font-bold text-xs h-10 px-4 shadow-none">
                <Link href="/dashboard/internships">
                  View My Classes <ArrowRight size={14} className="ml-1.5" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats Grid - Productive Edtech badges */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]"
          >
            <StatCard 
              label="Completed Sessions" 
              value={`${userProgress.length} / ${courseLessons.length}`} 
              icon={<CheckCircle2 className="text-[#8B4513]" size={18} />} 
              progress={Math.round((userProgress.length / Math.max(1, courseLessons.length)) * 100)}
            />
            <StatCard 
              label="Certificates Earned" 
              value={enrollments.filter(e => e.certification_status === 'approved').length.toString()} 
              icon={<Award className="text-[#8B4513]" size={18} />} 
            />
            <StatCard 
              label="Core Department" 
              value={profile?.departments?.name || "General Study"} 
              icon={<Layers className="text-[#8B4513]" size={18} />} 
            />
            <StatCard 
              label="Current Standing" 
              value="Enrolled Member" 
              icon={<BadgeCheck className="text-[#8B4513]" size={18} />} 
            />
          </motion.div>

          {/* Core Enrolled / Recommended Edtech Programs */}
          <section className="space-y-[16px]">
            <div className="flex items-center justify-between border-b border-[#8B4513]/10 pb-[12px]">
              <div>
                <h2 className="text-lg font-bold text-[#3D2B1F]">My Subscribed Programs</h2>
                <p className="text-xs text-[#3D2B1F]/60">Structured pathways linked to your declared specialization</p>
              </div>
              <Link href="/onboarding" className="text-xs font-bold text-[#8B4513] hover:underline flex items-center gap-1">
                Change Stream <ArrowRight size={12} />
              </Link>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]"
            >
              {recommendedCourses.map(course => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  enrolled={enrollments.find(e => e.course_id === course.id)} 
                  progress={userProgress.filter(p => p.course_id === course.id)}
                  lessons={courseLessons.filter(l => l.course_id === course.id)}
                  profile={profile}
                  onEnroll={() => router.push(`/dashboard/courses/${course.id}`)}
                />
              ))}
              {recommendedCourses.length === 0 && (
                <div className="col-span-full p-[32px] text-center bg-white border border-[#8B4513]/10 rounded-[12px]">
                  <p className="text-xs text-[#3D2B1F]/60 font-medium">No active program courses are matching your profile stream setup yet.</p>
                </div>
              )}
            </motion.div>
          </section>

          {/* Alternate Available Programs */}
          <section className="space-y-[16px]">
            <div className="border-b border-[#8B4513]/10 pb-[12px]">
              <h2 className="text-lg font-bold text-[#3D2B1F]">Explore Additional Study Tracks</h2>
              <p className="text-xs text-[#3D2B1F]/60">Expand your skills across parallel technology engineering sectors</p>
            </div>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]"
            >
              {otherCourses.slice(0, 3).map(course => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  enrolled={enrollments.find(e => e.course_id === course.id)}
                  progress={userProgress.filter(p => p.course_id === course.id)}
                  lessons={courseLessons.filter(l => l.course_id === course.id)}
                  profile={profile}
                  onEnroll={() => router.push(`/dashboard/courses/${course.id}`)}
                />
              ))}
            </motion.div>
          </section>
        </div>
      </main>

      {/* Enrollment Modal Integration */}
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

function StatCard({ label, value, icon, progress }: { label: string, value: string, icon: React.ReactNode, progress?: number }) {
  return (
    <div className="bg-white border border-[#8B4513]/15 rounded-[12px] p-[20px] flex flex-col justify-between hover:border-[#8B4513]/30 transition-colors">
      <div className="flex items-start justify-between mb-[12px]">
        <div className="w-9 h-9 rounded-[8px] bg-[#8B4513]/5 border border-[#8B4513]/10 flex items-center justify-center">
          {icon}
        </div>
        {progress !== undefined && (
          <span className="text-[10px] font-bold text-[#8B4513] bg-[#8B4513]/5 border border-[#8B4513]/10 px-2 py-0.5 rounded-[4px]">
            {progress}%
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-bold text-[#3D2B1F]/60 uppercase tracking-wider mb-[2px]">{label}</p>
        <p className="text-xl font-bold text-[#3D2B1F]">{value}</p>
      </div>
      {progress !== undefined && (
        <div className="mt-[12px] h-1.5 w-full bg-[#F9F5F0] rounded-full overflow-hidden border border-[#8B4513]/5">
          <div className="h-full bg-[#8B4513]" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

function CourseCard({ course, enrolled, progress, lessons, profile, onEnroll }: any) {
  const isEnrolled = enrolled?.payment_status === 'completed';
  const totalLessons = Math.max(1, lessons.length);
  const progressPercent = Math.round((progress.length / totalLessons) * 100);

  return (
    <div className="flex flex-col bg-white border border-[#8B4513]/20 rounded-[12px] hover:border-[#8B4513]/40 transition-colors shadow-none overflow-hidden group">
      {course.video_url && (
        <div className="h-40 w-full overflow-hidden relative bg-[#F9F5F0] border-b border-[#8B4513]/10 shrink-0">
          <img src={getYouTubeThumbnail(course.video_url)} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-[4px] border border-[#8B4513]/10 flex items-center gap-1 text-[9px] font-bold text-[#3D2B1F]">
            <Clock size={10} className="text-[#8B4513]" /> Self-Paced
          </div>
        </div>
      )}

      <div className="p-[20px] flex flex-col flex-1">
        <div className="flex items-center justify-between mb-[8px]">
          <span className="text-[9px] font-bold text-[#8B4513] uppercase tracking-wider bg-[#8B4513]/5 border border-[#8B4513]/10 px-2 py-0.5 rounded-[4px]">
            {course.departments?.name || "Program Stream"}
          </span>
          <span className="text-[10px] font-semibold text-[#3D2B1F]/50">
            {lessons.length} Modules
          </span>
        </div>
        
        <h3 className="text-base font-bold text-[#3D2B1F] mb-[6px] group-hover:text-[#8B4513] transition-colors leading-tight">
          {course.title}
        </h3>
        <p className="text-xs text-[#3D2B1F]/70 line-clamp-2 mb-[16px] leading-[1.6] flex-1 font-medium">
          {course.description}
        </p>
        
        {isEnrolled ? (
          <div className="mb-[16px] space-y-1.5 pt-2 border-t border-[#8B4513]/5">
            <div className="flex justify-between text-[10px] font-bold text-[#3D2B1F]/60">
              <span>Class Completion</span>
              <span className="text-[#8B4513]">{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#F9F5F0] rounded-full overflow-hidden border border-[#8B4513]/5">
              <div className="h-full bg-[#8B4513]" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        ) : (
          <div className="mb-[16px] flex items-center gap-1.5 text-[10px] font-bold text-[#8B4513]/80 pt-2 border-t border-[#8B4513]/5">
            <PlayCircle size={12} /> Live stream repository support
          </div>
        )}

        <div className="space-y-[12px] mt-auto">
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
            <Button 
              className="w-full rounded-[8px] h-9 font-bold bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] shadow-none text-xs flex items-center justify-center gap-1.5" 
              onClick={() => isEnrolled ? window.location.href = `/dashboard/courses/${course.id}` : onEnroll()}
            >
              {isEnrolled ? (
                <>Resume Learning <ArrowRight size={12} /></>
              ) : (
                <>Subscribe Course</>
              )}
            </Button>
          </motion.div>

          {isEnrolled && enrolled?.certification_status === 'approved' && (
             <div className="pt-2 border-t border-[#8B4513]/10">
               <CertificatePDF 
                  studentName={profile?.full_name || "Graduate"} 
                  courseName={course.title} 
                  branch={profile?.departments?.name || "Engineering"} 
                  score={enrolled?.final_score || 0} 
                  certId={enrolled?.id}
               />
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
