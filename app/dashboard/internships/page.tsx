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
  LogOut
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
      {/* Sidebar */}
      <aside className="w-64 hidden lg:flex flex-col border-r border-[#8B4513]/10 bg-white">
        <div className="p-6 flex items-center gap-3 border-b border-[#8B4513]/10">
          <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Logo" width={32} height={32} />
          <span className="font-medium text-lg text-[#3D2B1F]">Matrix Root</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard Overview" onClick={() => router.push('/dashboard')} />
          <SidebarItem icon={<BookOpen size={18} />} label="My Internships" active />
          <SidebarItem icon={<TrendingUp size={18} />} label="Performance Metrics" onClick={() => router.push('/dashboard/performance')} />
          
          <div className="pt-6">
            <SidebarItem icon={<User size={18} />} label="Member Settings" onClick={() => router.push('/profile')} />
            <SidebarItem icon={<LogOut size={18} />} label="Terminate Session" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} />
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 border-b border-[#8B4513]/10 bg-[#F9F5F0]/50 backdrop-blur-md flex items-center gap-4 px-6 shrink-0">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
            <Button variant="outline" size="icon" onClick={() => router.push('/dashboard')} className="rounded-[12px] h-8 w-8 border-[#8B4513]/20 shadow-none">
              <ArrowLeft size={16} className="text-[#8B4513]" />
            </Button>
          </motion.div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#3D2B1F]">Active Subscriptions Ledger</h2>
        </header>

        <div className="flex-1 overflow-y-auto p-[32px] md:p-[64px] pb-20">
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
                const progressPercent = Math.round((progress.length / Math.max(1, lessons.length)) * 100);

                return (
                  <motion.div 
                    variants={cardVariants}
                    key={enroll.id} 
                    className="flex flex-col bg-white border border-[#8B4513]/20 rounded-[12px] p-[24px] hover:border-[#8B4513]/40 transition-colors shadow-none group"
                  >
                    <div className="flex items-center justify-between border-b border-[#8B4513]/10 pb-[16px] mb-[16px]">
                       <div className="w-10 h-10 rounded-[12px] bg-[#8B4513]/5 border border-[#8B4513]/10 flex items-center justify-center text-[#8B4513]">
                          <BookOpen size={16} />
                       </div>
                       {enroll.certification_status === 'approved' ? (
                         <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-[12px] border border-emerald-200">
                            <ShieldCheck size={12} /> Mastered
                         </div>
                       ) : (
                         <div className="flex items-center gap-1 text-[10px] font-medium text-[#8B4513] uppercase tracking-wider bg-[#8B4513]/5 px-2 py-0.5 rounded-[12px] border border-[#8B4513]/10">
                            <Clock size={12} /> Active Track
                         </div>
                       )}
                    </div>

                    <h3 className="text-lg font-medium tracking-[-0.02em] text-[#3D2B1F] mb-[8px]">
                      {enroll.courses?.title}
                    </h3>
                    <p className="text-xs text-[#3D2B1F]/80 line-clamp-3 mb-[24px] leading-[1.6]">
                      {enroll.courses?.description}
                    </p>

                    <div className="space-y-[16px] mt-auto">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-medium text-[#3D2B1F]/60 uppercase tracking-wider">
                          <span>Completion Metric</span>
                          <span>{progressPercent}%</span>
                        </div>
                        <div className="h-1 w-full bg-[#F9F5F0] rounded-full overflow-hidden border border-[#8B4513]/10">
                          <div className="h-full bg-[#8B4513]" style={{ width: `${progressPercent}%` }} />
                        </div>
                      </div>

                      <div className="pt-[16px] border-t border-[#8B4513]/10 space-y-[8px]">
                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                          <Button className="w-full rounded-[12px] h-10 font-medium bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] shadow-none text-xs" onClick={() => router.push(`/dashboard/courses/${enroll.course_id}`)}>
                            Resume Execution
                          </Button>
                        </motion.div>
                        
                        {enroll.certification_status === 'approved' && (
                          <div className="pt-[8px]">
                            <CertificatePDF 
                              studentName={profile?.full_name || "Scholar"} 
                              courseName={enroll.courses?.title} 
                              branch={profile?.departments?.name || "Foundational"} 
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
              <motion.div variants={cardVariants} className="col-span-full py-[64px] text-center bg-white border border-[#8B4513]/10 rounded-[12px] space-y-[24px]">
                 <div className="w-12 h-12 bg-[#8B4513]/5 border border-[#8B4513]/10 rounded-[12px] flex items-center justify-center mx-auto text-[#8B4513]">
                    <BookOpen size={20} />
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-xl font-normal tracking-[-0.02em] text-[#3D2B1F]">Ledger Unpopulated</h3>
                    <p className="text-xs text-[#3D2B1F]/80 max-w-sm mx-auto">No programmatic records instantiated for current identity profiles.</p>
                 </div>
                 <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                   <Button className="rounded-[12px] bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] shadow-none h-10 text-xs font-medium" onClick={() => router.push('/dashboard')}>
                     Inspect Offerings
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
