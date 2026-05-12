"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CertificatePDF from "@/components/CertificatePDF";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  LogOut, 
  User, 
  ShieldCheck, 
  Clock, 
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
      <div className="flex min-h-screen bg-background items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const departmentSlug = profile?.department_slug;
  const recommendedCourses = allCourses.filter(course => course.departments?.slug === departmentSlug);
  const otherCourses = allCourses.filter(course => course.departments?.slug !== departmentSlug);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 hidden lg:flex flex-col border-r border-border bg-card/30">
        <div className="p-6 flex items-center gap-3 border-b border-border">
          <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Logo" width={32} height={32} />
          <span className="font-bold text-lg">Matrix Root</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Student Menu</p>
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard" active />
          <SidebarItem icon={<BookOpen size={18} />} label="My Internships" onClick={() => router.push('/dashboard/internships')} />
          <SidebarItem icon={<TrendingUp size={18} />} label="Performance" />
          
          <div className="pt-6">
            <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Account</p>
            <SidebarItem icon={<User size={18} />} label="Profile Settings" onClick={() => router.push('/profile')} />
            <SidebarItem icon={<LogOut size={18} />} label="Sign Out" onClick={handleSignOut} />
          </div>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-accent/50">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
              {profile?.full_name?.charAt(0) || "S"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{profile?.full_name || "Student"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{profile?.departments?.name || "No Track"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-border bg-background/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Dashboard</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input 
                type="text" 
                placeholder="Search tracks..." 
                className="pl-10 pr-4 py-2 bg-accent/30 border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
              />
            </div>
            <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              <Sparkles size={20} />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 pb-20">
          {/* Welcome Card */}
          <div className="relative rounded-[2rem] p-8 text-primary-foreground overflow-hidden" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
            <div className="relative z-10">
              <h1 className="text-3xl font-black mb-2">Welcome back, {profile?.full_name?.split(' ')[0] || "Student"}!</h1>
              <p className="text-primary-foreground/80 max-w-lg">
                Continue your industry-standard internship journey. Your progress is saved and mentor-reviewed.
              </p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              label="Completed Modules" 
              value={`${userProgress.length} / ${courseLessons.length}`} 
              icon={<ShieldCheck className="text-primary" size={20} />} 
              progress={(userProgress.length / Math.max(1, courseLessons.length)) * 100}
            />
            <StatCard 
              label="Certificates Earned" 
              value={enrollments.filter(e => e.certification_status === 'approved').length.toString()} 
              icon={<Award className="text-amber-500" size={20} />} 
            />
            <StatCard 
              label="Current Track" 
              value={profile?.departments?.name || "General"} 
              icon={<GraduationCap className="text-sky-500" size={20} />} 
            />
            <StatCard 
              label="Account Type" 
              value="Industrial Internship" 
              icon={<BadgeCheck className="text-emerald-500" size={20} />} 
            />
          </div>

          {/* Internship Tracks */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight">Your Recommended Tracks</h2>
              <Link href="/signup" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                View all tracks <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                <div className="col-span-full py-12 text-center bg-accent/20 rounded-3xl border-2 border-dashed border-border">
                  <p className="text-muted-foreground font-medium">No recommended tracks found for your branch. Visit Profile Settings to update.</p>
                </div>
              )}
            </div>
          </section>

          {/* Other Tracks */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black tracking-tight">Explore Other Disciplines</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            </div>
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
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 min-h-[48px] rounded-xl text-sm font-bold transition-all ${
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

function StatCard({ label, value, icon, progress }: { label: string, value: string, icon: React.ReactNode, progress?: number }) {
  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border rounded-[2rem] p-6 md:p-8 shadow-sm hover:shadow-card hover:border-primary/20 transition-all group flex flex-col justify-between">
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
        {progress !== undefined && (
          <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1.5 rounded-lg">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">{label}</p>
        <p className="text-3xl font-black tracking-tight">{value}</p>
      </div>
      {progress !== undefined && (
        <div className="mt-4 h-1.5 w-full bg-accent rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

function CourseCard({ course, enrolled, progress, lessons, profile, onEnroll }: any) {
  const isEnrolled = enrolled?.payment_status === 'completed';
  const progressPercent = Math.round((progress.length / Math.max(1, lessons.length)) * 100);

  return (
    <div className="flex flex-col bg-card border border-border rounded-[2.5rem] p-2 hover:border-primary/30 hover:shadow-2xl transition-all group">
      <div className="h-48 w-full bg-accent/30 rounded-[2rem] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity">
           <BookOpen size={64} className="text-primary" />
        </div>
        <div className="absolute top-4 left-4 px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/20">
          {course.departments?.name || "Track"}
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-black mb-2 leading-tight group-hover:text-primary transition-colors">{course.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">{course.description}</p>
        
        {isEnrolled && (
          <div className="mb-6 space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button 
            className="w-full rounded-2xl h-12 font-bold shadow-lg" 
            variant={isEnrolled ? "default" : "secondary"}
            onClick={() => isEnrolled ? window.location.href = `/dashboard/courses/${course.id}` : onEnroll()}
          >
            {isEnrolled ? "Continue Learning" : "Start Internship"}
          </Button>

          {isEnrolled && enrolled?.certification_status === 'approved' && (
             <CertificatePDF 
                studentName={profile?.full_name || "Graduate"} 
                courseName={course.title} 
                branch={profile?.departments?.name || "Engineering"} 
                score={enrolled?.final_score || 0} 
                certId={enrolled?.id}
             />
          )}
        </div>
      </div>
    </div>
  );
}
