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
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnrollmentModal } from "@/components/EnrollmentModal";

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
  hidden: { opacity: 0, y: 40 },
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
      {/* Sidebar */}
      <aside className="w-64 hidden lg:flex flex-col border-r border-[#8B4513]/10 bg-white">
        <div className="p-6 flex items-center gap-3 border-b border-[#8B4513]/10">
          <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Logo" width={32} height={32} />
          <span className="font-medium text-lg text-[#3D2B1F]">Matrix Root</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="px-3 text-[10px] font-semibold text-[#3D2B1F]/60 uppercase tracking-wider mb-2">Student Ledger</p>
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard Overview" active />
          <SidebarItem icon={<BookOpen size={18} />} label="My Internships" onClick={() => router.push('/dashboard/internships')} />
          <SidebarItem icon={<TrendingUp size={18} />} label="Performance Metrics" onClick={() => router.push('/dashboard/performance')} />
          
          <div className="pt-6">
            <p className="px-3 text-[10px] font-semibold text-[#3D2B1F]/60 uppercase tracking-wider mb-2">Configuration</p>
            <SidebarItem icon={<User size={18} />} label="Member Settings" onClick={() => router.push('/profile')} />
            <SidebarItem icon={<LogOut size={18} />} label="Terminate Session" onClick={handleSignOut} />
          </div>
        </nav>

        <div className="p-4 border-t border-[#8B4513]/10">
          <div className="flex items-center gap-3 p-2 rounded-[12px] bg-[#8B4513]/5 border border-[#8B4513]/10">
            <div className="w-8 h-8 rounded-[12px] bg-[#8B4513]/10 flex items-center justify-center text-[#8B4513] font-medium text-xs">
              {profile?.full_name?.charAt(0) || "M"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#3D2B1F] truncate">{profile?.full_name || "Institution Scholar"}</p>
              <p className="text-[10px] text-[#3D2B1F]/60 truncate">{profile?.departments?.name || "Active Track"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-[#8B4513]/10 bg-[#F9F5F0]/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#3D2B1F]">Curriculum Ledger</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D2B1F]/40 h-4 w-4" />
              <input 
                type="text" 
                placeholder="Query parameters..." 
                className="pl-10 pr-4 py-1.5 bg-white border border-[#8B4513]/20 rounded-[12px] text-xs focus:outline-none focus:border-[#8B4513] w-64 text-[#3D2B1F]"
              />
            </div>
            <div className="w-8 h-8 rounded-[12px] border border-[#8B4513]/20 flex items-center justify-center text-[#8B4513] hover:bg-[#8B4513]/5 transition-colors cursor-pointer">
              <Sparkles size={14} />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-[32px] md:p-[64px] space-y-[48px] pb-20">
          {/* Welcome Announcement Block */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="bg-white border border-[#8B4513]/20 rounded-[12px] p-[32px] md:p-[48px] shadow-none"
          >
            <div className="max-w-2xl">
              <span className="text-xs font-medium text-[#8B4513] uppercase tracking-wider block mb-[8px]">
                Active Directives Status
              </span>
              <h1 className="text-3xl font-normal tracking-[-0.02em] text-[#3D2B1F] mb-[16px]">
                Greetings, {profile?.full_name?.split(' ')[0] || "Scholar"}.
              </h1>
              <p className="text-sm text-[#3D2B1F]/80 leading-[1.6]">
                Your engineering track progress is strictly preserved and logged inside verifiable records. Select your active modules below to resume mechanical mastery.
              </p>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px]"
          >
            <StatCard 
              label="Completed Directives" 
              value={`${userProgress.length} / ${courseLessons.length}`} 
              icon={<ShieldCheck className="text-[#8B4513]" size={18} />} 
              progress={(userProgress.length / Math.max(1, courseLessons.length)) * 100}
            />
            <StatCard 
              label="Credentials Validated" 
              value={enrollments.filter(e => e.certification_status === 'approved').length.toString()} 
              icon={<Award className="text-[#8B4513]" size={18} />} 
            />
            <StatCard 
              label="Primary Designation" 
              value={profile?.departments?.name || "Foundational"} 
              icon={<GraduationCap className="text-[#8B4513]" size={18} />} 
            />
            <StatCard 
              label="Operational Track" 
              value="Verified Candidate" 
              icon={<BadgeCheck className="text-[#8B4513]" size={18} />} 
            />
          </motion.div>

          {/* Internship Tracks */}
          <section className="space-y-[24px]">
            <div className="flex items-center justify-between border-b border-[#8B4513]/10 pb-[16px]">
              <h2 className="text-xl font-medium tracking-[-0.02em] text-[#3D2B1F]">Assigned Professional Modules</h2>
              <Link href="/onboarding" className="relative text-xs font-medium text-[#8B4513] group py-1 px-2">
                Reconfigure Discipline <ArrowRight size={12} className="inline ml-1" />
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1.5px] bg-[#8B4513] transition-all duration-300 group-hover:w-full rounded-full" />
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
                  onEnroll={() => setSelectedCourse({id: course.id, title: course.title})}
                />
              ))}
              {recommendedCourses.length === 0 && (
                <motion.div variants={cardVariants} className="col-span-full py-[48px] text-center bg-white border border-[#8B4513]/10 rounded-[12px]">
                  <p className="text-xs text-[#3D2B1F]/60 font-medium">No specialized programs allocated for current discipline parameters.</p>
                </motion.div>
              )}
            </motion.div>
          </section>

          {/* Other Tracks */}
          <section className="space-y-[24px]">
            <div className="border-b border-[#8B4513]/10 pb-[16px]">
              <h2 className="text-xl font-medium tracking-[-0.02em] text-[#3D2B1F]">Alternate Engineering Directives</h2>
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
                  onEnroll={() => setSelectedCourse({id: course.id, title: course.title})}
                />
              ))}
            </motion.div>
          </section>
        </div>
      </main>

      {/* Enrollment Modal Integration */}
      {selectedCourse && (
        <EnrollmentModal 
          open={!!selectedCourse} 
          onOpenChange={(open) => !open && setSelectedCourse(null)}
          courseTitle={selectedCourse.title}
          onPay={() => {
            window.location.href = `/dashboard/courses/${selectedCourse.id}`;
          }}
          loading={false}
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
      className={`w-full flex items-center gap-3 px-4 min-h-[40px] rounded-[12px] text-xs font-medium transition-colors ${
        active 
        ? "bg-[#8B4513]/5 text-[#8B4513] border border-[#8B4513]/10 font-semibold" 
        : "text-[#3D2B1F]/70 hover:bg-[#8B4513]/5 hover:text-[#3D2B1F]"
      }`}
    >
      <span className="text-[#8B4513]">{icon}</span>
      {label}
    </motion.button>
  );
}

function StatCard({ label, value, icon, progress }: { label: string, value: string, icon: React.ReactNode, progress?: number }) {
  return (
    <motion.div 
      variants={cardVariants}
      className="bg-white border border-[#8B4513]/20 rounded-[12px] p-[24px] shadow-none flex flex-col justify-between hover:border-[#8B4513]/40 transition-colors"
    >
      <div className="flex items-start justify-between mb-[16px]">
        <div className="w-10 h-10 rounded-[12px] bg-[#8B4513]/5 border border-[#8B4513]/10 flex items-center justify-center">
          {icon}
        </div>
        {progress !== undefined && (
          <span className="text-[10px] font-medium text-[#8B4513] bg-[#8B4513]/5 border border-[#8B4513]/10 px-2 py-0.5 rounded-[12px]">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-medium text-[#3D2B1F]/60 uppercase tracking-wider mb-[4px]">{label}</p>
        <p className="text-2xl font-normal tracking-[-0.02em] text-[#3D2B1F]">{value}</p>
      </div>
      {progress !== undefined && (
        <div className="mt-[16px] h-1 w-full bg-[#F9F5F0] rounded-full overflow-hidden border border-[#8B4513]/10">
          <div className="h-full bg-[#8B4513]" style={{ width: `${progress}%` }} />
        </div>
      )}
    </motion.div>
  );
}

function CourseCard({ course, enrolled, progress, lessons, profile, onEnroll }: any) {
  const isEnrolled = enrolled?.payment_status === 'completed';
  const progressPercent = Math.round((progress.length / Math.max(1, lessons.length)) * 100);

  return (
    <motion.div 
      variants={cardVariants}
      className="flex flex-col bg-white border border-[#8B4513]/20 rounded-[12px] p-[24px] hover:border-[#8B4513]/40 transition-colors shadow-none group overflow-hidden"
    >
      {course.video_url && (
        <div className="h-40 w-full rounded-[8px] overflow-hidden mb-[16px] border border-[#8B4513]/10 relative bg-[#F9F5F0] shrink-0">
          <img src={course.video_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}

      <div className="border-b border-[#8B4513]/10 pb-[16px] mb-[16px] flex items-center justify-between">
        <span className="text-[10px] font-medium text-[#8B4513] uppercase tracking-wider bg-[#8B4513]/5 border border-[#8B4513]/10 px-2 py-0.5 rounded-[12px]">
          {course.departments?.name || "Discipline"}
        </span>
        <BookOpen size={16} className="text-[#8B4513]/60" />
      </div>
      
      <div className="flex flex-col flex-1">
        <h3 className="text-lg font-medium tracking-[-0.02em] text-[#3D2B1F] mb-[8px]">
          {course.title}
        </h3>
        <p className="text-xs text-[#3D2B1F]/80 line-clamp-3 mb-[24px] leading-[1.6] flex-1">
          {course.description}
        </p>
        
        {isEnrolled && (
          <div className="mb-[24px] space-y-1">
            <div className="flex justify-between text-[10px] font-medium text-[#3D2B1F]/60 uppercase tracking-wider">
              <span>Mechanical Completion</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-1 w-full bg-[#F9F5F0] rounded-full overflow-hidden border border-[#8B4513]/10">
              <div className="h-full bg-[#8B4513]" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}

        <div className="space-y-[16px]">
          <motion.div 
            whileHover={{ scale: 1.01 }} 
            whileTap={{ scale: 0.98 }} 
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Button 
              className="w-full rounded-[12px] h-10 font-medium bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] shadow-none text-xs" 
              onClick={() => isEnrolled ? window.location.href = `/dashboard/courses/${course.id}` : onEnroll()}
            >
              {isEnrolled ? "Resume Directives" : "Affirm Enrollment"}
            </Button>
          </motion.div>

          {isEnrolled && enrolled?.certification_status === 'approved' && (
             <div className="pt-[8px] border-t border-[#8B4513]/10">
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
    </motion.div>
  );
}
