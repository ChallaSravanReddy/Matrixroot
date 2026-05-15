"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  ArrowLeft, 
  Clock, 
  ShieldCheck,
  TrendingUp,
  LayoutDashboard,
  User,
  LogOut,
  GraduationCap,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CertificatePDF from "@/components/CertificatePDF";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

export default function MyInternshipsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchMyData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const [profileRes, enrollRes, progressRes, lessonRes] = await Promise.all([
        supabase.from("profiles").select("*, departments(name)").eq("id", session.user.id).single(),
        supabase.from("enrollments").select("*, courses(*)").eq("student_id", session.user.id).eq("payment_status", "completed"),
        supabase.from("user_progress").select("*").eq("user_id", session.user.id),
        supabase.from("lessons").select("id, course_id")
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (enrollRes.data) setEnrollments(enrollRes.data);
      if (progressRes.data) setUserProgress(progressRes.data);
      if (lessonRes.data) setCourseLessons(lessonRes.data);
      setLoading(false);
    };

    fetchMyData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F9F5F0] items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#8B4513] border-t-transparent rounded-full"></div>
      </div>
    );
  }

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
          <SidebarItem icon={<BookOpen size={18} />} label="Subscribed Tracks" active />
          <SidebarItem icon={<TrendingUp size={18} />} label="Progress & Grades" onClick={() => router.push('/dashboard/performance')} />
          
          <div className="pt-6">
            <p className="px-3 text-[10px] font-bold text-[#8B4513] uppercase tracking-wider mb-2">Account Management</p>
            <SidebarItem icon={<User size={18} />} label="Profile Setup" onClick={() => router.push('/profile')} />
            <SidebarItem icon={<LogOut size={18} />} label="Sign Out" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} />
          </div>
        </nav>
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
              <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard Hub" onClick={() => router.push('/dashboard')} />
              <SidebarItem icon={<BookOpen size={18} />} label="Subscribed Tracks" active />
              <SidebarItem icon={<TrendingUp size={18} />} label="Progress & Grades" onClick={() => router.push('/dashboard/performance')} />
              <div className="pt-6">
                <SidebarItem icon={<User size={18} />} label="Profile Setup" onClick={() => router.push('/profile')} />
                <SidebarItem icon={<LogOut size={18} />} label="Sign Out" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} />
              </div>
            </nav>
          </motion.aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 border-b border-[#8B4513]/10 bg-white flex items-center gap-4 px-6 shrink-0 shadow-none">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-[#8B4513] hover:bg-[#8B4513]/5 rounded-[8px]"
          >
            <Menu size={20} />
          </button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
            <Button variant="outline" size="icon" onClick={() => router.push('/dashboard')} className="rounded-[8px] h-8 w-8 border-[#8B4513]/20 shadow-none">
              <ArrowLeft size={16} className="text-[#8B4513]" />
            </Button>
          </motion.div>
          <h2 className="text-xs font-bold text-[#3D2B1F]">My Enrolled Course Classes</h2>
        </header>

        <div className="flex-1 overflow-y-auto p-[24px] md:p-[48px] pb-20 max-w-7xl mx-auto w-full">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]"
          >
            {enrollments.length > 0 ? (
              enrollments.map((enroll) => {
                const lessons = courseLessons.filter(l => l.course_id === enroll.course_id);
                const progress = userProgress.filter(p => p.course_id === enroll.course_id);
                const totalLessons = Math.max(1, lessons.length);
                const progressPercent = Math.round((progress.length / totalLessons) * 100);

                return (
                  <motion.div 
                    variants={cardVariants}
                    key={enroll.id} 
                    className="flex flex-col bg-white border border-[#8B4513]/20 rounded-[12px] p-[20px] hover:border-[#8B4513]/40 transition-colors shadow-none group"
                  >
                    <div className="flex items-center justify-between border-b border-[#8B4513]/10 pb-[12px] mb-[12px]">
                       <div className="w-8 h-8 rounded-[8px] bg-[#8B4513]/5 border border-[#8B4513]/10 flex items-center justify-center text-[#8B4513]">
                          <BookOpen size={14} />
                       </div>
                       {enroll.certification_status === 'approved' ? (
                         <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-[4px] border border-emerald-200">
                            <ShieldCheck size={10} /> Certified
                         </div>
                       ) : (
                         <div className="flex items-center gap-1 text-[9px] font-bold text-[#8B4513] uppercase tracking-wider bg-[#8B4513]/5 px-2 py-0.5 rounded-[4px] border border-[#8B4513]/10">
                            <Clock size={10} /> In Progress
                         </div>
                       )}
                    </div>

                    <h3 className="text-base font-bold text-[#3D2B1F] mb-[6px] group-hover:text-[#8B4513] transition-colors leading-tight">
                      {enroll.courses?.title}
                    </h3>
                    <p className="text-xs text-[#3D2B1F]/70 line-clamp-2 mb-[16px] leading-[1.6] font-medium">
                      {enroll.courses?.description}
                    </p>

                    <div className="space-y-[16px] mt-auto">
                      <div className="space-y-1.5 pt-2 border-t border-[#8B4513]/5">
                        <div className="flex justify-between text-[10px] font-bold text-[#3D2B1F]/60">
                          <span>Track Progress</span>
                          <span className="text-[#8B4513]">{progressPercent}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#F9F5F0] rounded-full overflow-hidden border border-[#8B4513]/5">
                          <div className="h-full bg-[#8B4513]" style={{ width: `${progressPercent}%` }} />
                        </div>
                      </div>

                      <div className="pt-[12px] border-t border-[#8B4513]/10 space-y-[8px]">
                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                          <Button className="w-full rounded-[8px] h-9 font-bold bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] shadow-none text-xs" onClick={() => router.push(`/dashboard/courses/${enroll.course_id}`)}>
                            Resume Lessons
                          </Button>
                        </motion.div>
                        
                        {enroll.certification_status === 'approved' && (
                          <div className="pt-2">
                            <CertificatePDF 
                              studentName={profile?.full_name || "Graduate"} 
                              courseName={enroll.courses?.title} 
                              branch={profile?.departments?.name || "Engineering"} 
                              score={enroll.final_score || 0} 
                              certId={enroll.id}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div variants={cardVariants} className="col-span-full py-[64px] text-center bg-white border border-[#8B4513]/10 rounded-[12px] space-y-[16px]">
                 <div className="w-12 h-12 bg-[#8B4513]/5 border border-[#8B4513]/10 rounded-[12px] flex items-center justify-center mx-auto text-[#8B4513]">
                    <BookOpen size={20} />
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#3D2B1F]">No Subscriptions Active Yet</h3>
                    <p className="text-xs text-[#3D2B1F]/70 max-w-sm mx-auto font-medium">Browse available institutional courses to subscribe and kickstart your career learning track.</p>
                 </div>
                 <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="pt-2">
                   <Button className="rounded-[8px] bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] shadow-none h-10 px-6 text-xs font-bold" onClick={() => router.push('/dashboard')}>
                     Browse Course Catalog
                   </Button>
                 </motion.div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
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
