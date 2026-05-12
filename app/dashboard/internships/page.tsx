"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  BookOpen, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Award, 
  ShieldCheck,
  TrendingUp,
  LayoutDashboard,
  User,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CertificatePDF from "@/components/CertificatePDF";

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
      <div className="flex min-h-screen bg-background items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 hidden lg:flex flex-col border-r border-border bg-card/30">
        <div className="p-6 flex items-center gap-3 border-b border-border">
          <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Logo" width={32} height={32} />
          <span className="font-bold text-lg">Matrix Root</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard" onClick={() => router.push('/dashboard')} />
          <SidebarItem icon={<BookOpen size={18} />} label="My Internships" active />
          <SidebarItem icon={<TrendingUp size={18} />} label="Performance" />
          
          <div className="pt-6">
            <SidebarItem icon={<User size={18} />} label="Profile Settings" onClick={() => router.push('/profile')} />
            <SidebarItem icon={<LogOut size={18} />} label="Sign Out" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} />
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-20 border-b border-border bg-background/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="rounded-xl">
              <ArrowLeft size={20} />
            </Button>
            <h2 className="text-xl font-bold">My Internships</h2>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enrollments.length > 0 ? (
              enrollments.map((enroll) => {
                const lessons = courseLessons.filter(l => l.course_id === enroll.course_id);
                const progress = userProgress.filter(p => p.course_id === enroll.course_id);
                const progressPercent = Math.round((progress.length / Math.max(1, lessons.length)) * 100);

                return (
                  <div key={enroll.id} className="flex flex-col bg-card border border-border rounded-[2.5rem] p-6 hover:border-primary/30 transition-all group">
                    <div className="flex items-center justify-between mb-6">
                       <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                          <BookOpen size={24} />
                       </div>
                       {enroll.certification_status === 'approved' ? (
                         <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                            <ShieldCheck size={12} /> Certified
                         </div>
                       ) : (
                         <div className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                            <Clock size={12} /> In Progress
                         </div>
                       )}
                    </div>

                    <h3 className="text-xl font-black mb-2 leading-tight">{enroll.courses?.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-8">{enroll.courses?.description}</p>

                    <div className="space-y-4 mt-auto">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span>Course Progress</span>
                          <span>{progressPercent}%</span>
                        </div>
                        <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                          <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                        </div>
                      </div>

                      <div className="pt-4 grid gap-3">
                        <Button className="w-full rounded-2xl h-12 font-bold" onClick={() => router.push(`/dashboard/courses/${enroll.course_id}`)}>
                          Resume Module
                        </Button>
                        
                        {enroll.certification_status === 'approved' && (
                          <CertificatePDF 
                            studentName={profile?.full_name || "Student"} 
                            courseName={enroll.courses?.title} 
                            branch={profile?.departments?.name || "Engineering"} 
                            score={enroll.final_score || 0} 
                            certId={enroll.id}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-20 text-center bg-card border-2 border-dashed border-border rounded-[3rem] space-y-6">
                 <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto">
                    <BookOpen size={40} className="text-muted-foreground" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black">No Active Internships</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">You haven't enrolled in any specialized tracks yet. Visit the catalog to start your journey.</p>
                 </div>
                 <Button onClick={() => router.push('/dashboard')}>Browse All Tracks</Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
        active 
        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
        : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
