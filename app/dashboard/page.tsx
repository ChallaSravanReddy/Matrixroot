"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CertificatePDF from "@/components/CertificatePDF";
import OfferLetterPDF from "@/components/OfferLetterPDF";
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
import { ProfileCompletionModal } from "@/components/ProfileCompletionModal";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [weeklyUpdates, setWeeklyUpdates] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          router.push("/login");
          return;
        }
        setSessionUser(session.user);

        const [profileRes, courseRes, enrollRes, updatesRes] = await Promise.all([
          supabase.from("profiles").select("*, departments(id, name)").eq("id", session.user.id).single(),
          supabase.from("courses").select("*, departments(name, slug)"),
          supabase.from("enrollments").select("*, courses(*)").eq("student_id", session.user.id),
          supabase.from("weekly_updates").select("*").eq("student_id", session.user.id)
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
        if (courseRes.data) setAllCourses(courseRes.data as Course[]);
        if (enrollRes.data) setEnrollments(enrollRes.data);
        setUserProgress(progressData);
        setCourseLessons(lessonData);
        if (updatesRes.data) setWeeklyUpdates(updatesRes.data);
      } catch (error) {
        console.error("Dashboard Load Error:", error);
        router.push("/login");
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
      <div className="flex min-h-screen bg-white items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#8B5A2B] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const activeEnrollment = enrollments.find(e => e.payment_status === "completed" || e.payment_status === "success");
  const departmentSlug = profile?.department_slug;
  const recommendedCourses = allCourses.filter(course => course.departments?.slug === departmentSlug);

  return (
    <div className="flex h-screen bg-white text-black overflow-hidden font-sans">
      {/* Sidebar - Restore Original Navigation layout */}
      <aside className="w-64 hidden lg:flex flex-col border-r border-black/10 bg-white shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-black/10">
          <div className="w-8 h-8 rounded-[8px] bg-black/5 flex items-center justify-center text-[#8B5A2B]">
            <GraduationCap size={20} className="text-[#8B5A2B]" />
          </div>
          <span className="font-bold text-base text-black">Matrix Root</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-black/40 uppercase tracking-wider mb-2">My Learning</p>
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard Hub" active />
          <SidebarItem icon={<BookOpen size={18} />} label="Courses" onClick={() => router.push('/dashboard/courses')} />
          <SidebarItem icon={<Layers size={18} />} label="Workspace Hub" onClick={() => router.push('/workspace')} />
          <SidebarItem icon={<BookOpen size={18} />} label="Subscribed Tracks" onClick={() => router.push('/dashboard/internships')} />
          <SidebarItem icon={<TrendingUp size={18} />} label="Progress & Grades" onClick={() => router.push('/dashboard/performance')} />
          <SidebarItem icon={<Sparkles size={18} />} label="Live Support" onClick={() => router.push('/dashboard/support')} />
          
          <div className="pt-6">
            <p className="px-3 text-[10px] font-bold text-black/40 uppercase tracking-wider mb-2">Account Management</p>
            <SidebarItem icon={<User size={18} />} label="Profile Setup" onClick={() => router.push('/profile')} />
            <SidebarItem icon={<LogOut size={18} />} label="Sign Out" onClick={handleSignOut} />
          </div>
        </nav>

        <div className="p-4 border-t border-black/10">
          <div className="flex items-center gap-3 p-2 rounded-[12px] bg-neutral-50 border border-black/10">
            <div className="w-8 h-8 rounded-[8px] bg-black/5 flex items-center justify-center text-black font-bold text-xs">
              {profile?.full_name?.charAt(0) || "S"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-black truncate">{profile?.full_name || "Student Account"}</p>
              <p className="text-[10px] text-black/60 truncate font-medium">{profile?.departments?.name || "Active Program"}</p>
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
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.aside 
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-0 left-0 bottom-0 w-72 bg-white flex flex-col border-r border-black/10"
            onClick={(e) => e.stopPropagation()}
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
              <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard Hub" active />
              <SidebarItem icon={<BookOpen size={18} />} label="Courses" onClick={() => { setIsSidebarOpen(false); router.push('/dashboard/courses'); }} />
              <SidebarItem icon={<Layers size={18} />} label="Workspace Hub" onClick={() => { setIsSidebarOpen(false); router.push('/workspace'); }} />
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
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        {/* Header Navigation */}
        <header className="h-16 border-b border-black/10 bg-white flex items-center justify-between px-6 shrink-0 shadow-none">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 lg:hidden text-black hover:bg-black/5 rounded-[8px]"
            >
              <Menu size={20} className="text-[#8B5A2B]" />
            </button>
            <span className="text-xs font-bold text-[#8B5A2B] bg-[#8B5A2B]/5 px-2.5 py-1 rounded-[6px] border border-[#8B5A2B]/10">
              Student Mode
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/support" className="flex items-center gap-1.5 text-xs font-semibold text-[#8B5A2B] bg-[#8B5A2B]/5 px-3 py-1.5 rounded-[8px] border border-[#8B5A2B]/10 hover:bg-[#8B5A2B]/10 transition-colors">
              <Sparkles size={12} className="text-[#8B5A2B]" /> Live Support
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-[24px] md:p-[48px] space-y-[32px] pb-20 max-w-7xl mx-auto w-full">
          {/* Welcome Announcement Block */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="bg-white border border-black/10 rounded-[12px] p-[24px] md:p-[32px] flex flex-col md:flex-row md:items-center justify-between gap-[24px]"
          >
            <div className="space-y-[8px]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-wider bg-[#8B5A2B]/10 px-2 py-0.5 rounded-[4px]">
                  Current Academic Term
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-black">
                Welcome back, {profile?.full_name?.split(' ')[0] || "Student"}! 👋
              </h1>
              <p className="text-xs text-black/70 max-w-xl leading-[1.6] font-medium">
                Resume your classes, submit tasks, and track your certificates.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <Button asChild className="rounded-[8px] bg-black text-white hover:bg-neutral-900 font-bold text-xs h-10 px-4 shadow-none border border-black/10">
                <Link href="/dashboard/internships">
                  View My Classes <ArrowRight size={14} className="ml-1.5 text-[#8B5A2B]" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]"
          >
            <StatCard 
              label="Completed Sessions" 
              value={`${userProgress.length} / ${courseLessons.length}`} 
              icon={<CheckCircle2 className="text-[#8B5A2B]" size={18} />} 
              progress={Math.round((userProgress.length / Math.max(1, courseLessons.length)) * 100)}
            />
            <StatCard 
              label="Certificates Earned" 
              value={enrollments.filter(e => e.certification_status === 'approved').length.toString()} 
              icon={<Award className="text-[#8B5A2B]" size={18} />} 
            />
            <StatCard 
              label="Core Department" 
              value={profile?.departments?.name || "General Study"} 
              icon={<Layers className="text-[#8B5A2B]" size={18} />} 
            />
            <StatCard 
              label="Current Standing" 
              value="Student" 
              icon={<BadgeCheck className="text-[#8B5A2B]" size={18} />} 
            />
          </motion.div>

          {/* Internship Progress Widget */}
          {activeEnrollment && (() => {
            const courseUpdates = weeklyUpdates.filter(u => u.course_id === activeEnrollment.course_id);
            const approvedWeeks = courseUpdates.filter(u => u.status === "approved").length;
            const submittedWeeks = courseUpdates.length;
            const totalWeeks = activeEnrollment.courses?.timeline_weeks ?? 8;
            const activeBlueprint = activeEnrollment.selected_problem_statement;
            
            // Helper to parse problem statements
            const parseBlueprintText = (text: string) => {
              if (!text) return { title: "", description: "", features: [] };
              const parts = text.split(/•\s*•\s*•\s*•\s*•/);
              if (parts.length < 2) {
                return {
                  title: "Project Blueprint",
                  description: text,
                  features: []
                };
              }

              const firstPart = parts[0].trim();
              let title = "Project Blueprint";
              let description = firstPart;

              const titleMatch = firstPart.match(/^(\d+\.\s+[^.\n]+?)(?=\s+[A-Z][a-z]|\s+Build\s+)/);
              if (titleMatch) {
                title = titleMatch[1].trim();
                description = firstPart.substring(titleMatch[0].length).trim();
              }

              const featuresText = parts[1].trim();
              let features: string[] = [];
              if (featuresText.includes('\n')) {
                features = featuresText.split('\n').map(f => f.trim()).filter(Boolean);
              } else {
                const rawFeatures = featuresText.split(/(?=\s+[A-Z][a-z\s])/);
                features = rawFeatures.map(f => f.trim()).filter(Boolean);
              }

              return { title, description, features };
            };

            const bp = parseBlueprintText(activeBlueprint || "");

            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="bg-white border border-black/10 rounded-[20px] p-6 md:p-8 space-y-6 shadow-sm"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-black/5 rounded-[6px] text-[#8B5A2B]">
                        <Layers size={18} className="text-[#8B5A2B]" />
                      </div>
                      <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Workspace Alignment</span>
                    </div>
                    <h3 className="text-lg font-bold text-black tracking-tight">Active Internship Progress</h3>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-[10px] font-extrabold text-[#8B5A2B] uppercase bg-[#8B5A2B]/10 border border-[#8B5A2B]/20 px-3 py-1 rounded-full tracking-wider">
                      Course: {activeEnrollment.courses?.title || "Active Internship"}
                    </span>
                  </div>
                </div>

                {/* Grid Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Blueprint Details */}
                  <div className="lg:col-span-7 space-y-4">
                    <span className="text-[10px] font-bold text-black/45 uppercase tracking-wider block">Active Problem Blueprint</span>
                    
                    {activeBlueprint ? (
                      <div className="bg-neutral-50/70 border border-black/10 rounded-[16px] p-5 space-y-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-[#8B5A2B] uppercase tracking-widest">{bp.title}</span>
                          <p className="text-xs font-semibold text-black leading-relaxed">{bp.description}</p>
                        </div>
                        
                        {bp.features.length > 0 && (
                          <div className="pt-3 border-t border-black/5 space-y-2">
                            <span className="text-[9px] font-bold text-black/40 uppercase tracking-wider block">Core Requirements</span>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {bp.features.map((feat, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-[11px] text-black/80 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5A2B] mt-1.5 shrink-0" />
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-[#8B5A2B]/5 border border-[#8B5A2B]/10 p-5 rounded-[16px] space-y-3">
                        <p className="text-xs text-[#8B5A2B] italic font-medium leading-relaxed">
                          Project blueprint selection pending. Enter the workspace hub to choose your assignment.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Status, Weekly indicators & Workspace Action */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-black/45 uppercase tracking-wider">Weekly Deliverables</span>
                        <span className="text-[11px] font-bold text-black">{submittedWeeks} of {totalWeeks} Submitted</span>
                      </div>
                      
                      {/* Timeline segments representation */}
                      <div className="flex gap-1.5 w-full">
                        {Array.from({ length: totalWeeks }).map((_, i) => {
                          const isSubmitted = i < submittedWeeks;
                          const isCurrent = i === submittedWeeks;
                          return (
                            <div 
                              key={i} 
                              className={`h-2.5 flex-1 rounded-full border transition-all ${
                                isSubmitted 
                                  ? "bg-black border-black" 
                                  : isCurrent 
                                    ? "bg-[#8B5A2B]/20 border-[#8B5A2B] animate-pulse" 
                                    : "bg-neutral-100 border-black/5"
                              }`}
                              title={`Week ${i + 1}: ${isSubmitted ? 'Submitted' : isCurrent ? 'Active' : 'Pending'}`}
                            />
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="bg-neutral-50 border border-black/10 rounded-[12px] p-3 text-center">
                          <span className="text-[9px] font-bold text-black/40 uppercase tracking-wider block">Approved Updates</span>
                          <span className="text-sm font-bold text-black mt-0.5 block">{approvedWeeks} Weeks</span>
                        </div>
                        <div className="bg-neutral-50 border border-black/10 rounded-[12px] p-3 text-center">
                          <span className="text-[9px] font-bold text-black/40 uppercase tracking-wider block">Remaining Plan</span>
                          <span className="text-sm font-bold text-black mt-0.5 block">{Math.max(0, totalWeeks - submittedWeeks)} Weeks</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button 
                        onClick={() => router.push(`/workspace/${activeEnrollment.course_id}`)} 
                        className="w-full bg-black text-white hover:bg-neutral-900 text-xs font-bold py-3 rounded-[12px] shadow-none flex items-center justify-center gap-2 transition-all"
                      >
                        Open Workspace Hub
                        <ArrowRight size={14} className="text-[#8B5A2B]" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* Enrolled Courses Grid */}
          {enrollments.length > 0 && (
            <section className="space-y-[16px]">
              <div className="border-b border-black/10 pb-[12px]">
                <h2 className="text-lg font-bold text-black">My Enrolled Tracks</h2>
                <p className="text-xs text-black/60">Your active courses</p>
              </div>
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]"
              >
                {enrollments.map(enroll => {
                  const course = enroll.courses;
                  if (!course) return null;
                  return (
                    <CourseCard 
                      key={course.id} 
                      course={course} 
                      enrolled={enroll} 
                      progress={userProgress.filter(p => p.course_id === course.id)}
                      lessons={courseLessons.filter(l => l.course_id === course.id)}
                      profile={profile}
                      onEnroll={() => router.push(`/dashboard/courses/${course.id}`)}
                      sessionUser={sessionUser}
                    />
                  );
                })}
              </motion.div>
            </section>
          )}

          {/* Specialization / Branch Courses */}
          <section className="space-y-[16px]">
            <div className="flex items-center justify-between border-b border-black/10 pb-[12px]">
              <div>
                <h2 className="text-lg font-bold text-black">Specialization Branch Pathways</h2>
                <p className="text-xs text-black/60">Find courses matching your specialization</p>
              </div>
              <Link href="/profile" className="text-xs font-bold text-[#8B5A2B] hover:underline flex items-center gap-1">
                Change Branch / Specialization <ArrowRight size={12} className="text-[#8B5A2B]" />
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
                  sessionUser={sessionUser}
                />
              ))}
              {recommendedCourses.length === 0 && (
                <div className="col-span-full p-[32px] text-center bg-white border border-black/10 rounded-[12px]">
                  <p className="text-xs text-black/60 font-medium">No courses found matching your declared branch specialization.</p>
                </div>
              )}
            </motion.div>
          </section>
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
        ? "bg-black text-white" 
        : "text-black/70 hover:bg-black/5 hover:text-black"
      }`}
    >
      <span className="text-[#8B5A2B] shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </motion.button>
  );
}

function StatCard({ label, value, icon, progress }: { label: string, value: string, icon: React.ReactNode, progress?: number }) {
  return (
    <div className="bg-white border border-black/10 rounded-[12px] p-[20px] flex flex-col justify-between hover:border-black/20 transition-colors">
      <div className="flex items-start justify-between mb-[12px]">
        <div className="w-9 h-9 rounded-[8px] bg-[#8B5A2B]/5 border border-[#8B5A2B]/10 flex items-center justify-center">
          {icon}
        </div>
        {progress !== undefined && (
          <span className="text-[10px] font-bold text-[#8B5A2B] bg-[#8B5A2B]/10 border border-[#8B5A2B]/20 px-2 py-0.5 rounded-[4px]">
            {progress}%
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-bold text-black/45 uppercase tracking-wider mb-[2px]">{label}</p>
        <p className="text-xl font-bold text-black">{value}</p>
      </div>
      {progress !== undefined && (
        <div className="mt-[12px] h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden border border-black/5">
          <div className="h-full bg-black" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

function CourseCard({ course, enrolled, progress, lessons, profile, onEnroll, sessionUser }: any) {
  const isEnrolled = enrolled?.payment_status === 'completed' || enrolled?.payment_status === 'success';
  const totalLessons = Math.max(1, lessons.length);
  const progressPercent = Math.round((progress.length / totalLessons) * 100);

  return (
    <div className="flex flex-col bg-white border border-black/10 rounded-[12px] hover:border-black/20 transition-colors shadow-none overflow-hidden group">
      {course.video_url && (
        <div className="h-40 w-full overflow-hidden relative bg-neutral-50 border-b border-black/10 shrink-0">
          <img src={getYouTubeThumbnail(course.video_url)} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-[4px] border border-black/10 flex items-center gap-1 text-[9px] font-bold text-black">
            <Clock size={10} className="text-[#8B5A2B]" /> Self-Paced
          </div>
        </div>
      )}

      <div className="p-[20px] flex flex-col flex-1">
        <div className="flex items-center justify-between mb-[8px]">
          <span className="text-[9px] font-bold text-[#8B5A2B] uppercase tracking-wider bg-[#8B5A2B]/10 border border-[#8B5A2B]/20 px-2 py-0.5 rounded-[4px]">
            {course.departments?.name || "Course"}
          </span>
          <span className="text-[10px] font-semibold text-black/50">
            {lessons.length} Modules
          </span>
        </div>
        
        <h3 className="text-base font-bold text-black mb-[6px] group-hover:text-[#8B5A2B] transition-colors leading-tight">
          {course.title}
        </h3>
        <p className="text-xs text-black/70 line-clamp-2 mb-[16px] leading-[1.6] flex-1 font-medium">
          {course.description}
        </p>
        
        {isEnrolled ? (
          <div className="mb-[16px] space-y-1.5 pt-2 border-t border-black/5">
            <div className="flex justify-between text-[10px] font-bold text-black/60">
              <span>Class Completion</span>
              <span className="text-[#8B5A2B]">{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden border border-black/5">
              <div className="h-full bg-black" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        ) : (
          <div className="mb-[16px] flex items-center gap-1.5 text-[10px] font-bold text-[#8B5A2B] pt-2 border-t border-black/5">
            <PlayCircle size={12} className="text-[#8B5A2B]" /> Course repository & guidelines included
          </div>
        )}

        <div className="space-y-[12px] mt-auto">
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
            <Button 
              className="w-full rounded-[8px] h-9 font-bold bg-black text-white hover:bg-neutral-900 shadow-none text-xs flex items-center justify-center gap-1.5" 
              onClick={() => window.location.href = `/dashboard/courses/${course.id}`}
            >
              {isEnrolled ? (
                <>Resume Learning <ArrowRight size={12} className="text-[#8B5A2B]" /></>
              ) : (
                <>Enroll in Course</>
              )}
            </Button>
          </motion.div>

          {isEnrolled && (
            <div className="pt-1 border-t border-black/10">
              <OfferLetterPDF 
                studentName={profile?.full_name || "Intern"}
                email={sessionUser?.email || ""}
                courseName={course.title}
                enrolledAt={enrolled.enrolled_at}
                enrollId={enrolled.id}
              />
            </div>
          )}

          {isEnrolled && enrolled?.certification_status === 'approved' && (
             <div className="pt-2 border-t border-black/10">
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
