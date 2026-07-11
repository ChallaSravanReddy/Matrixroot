"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CertificatePDF from "@/components/CertificatePDF";
import OfferLetterPDF from "@/components/OfferLetterPDF";
import { useSidebarContext } from "@/components/SidebarContext";
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
  PlayCircle,
  Layers,
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
  dept_id: string;
  dept_ids: string[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
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

export default function CoursesPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [departmentsList, setDepartmentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const { setIsSidebarOpen } = useSidebarContext();
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCoursesPageData = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          router.push("/login");
          return;
        }
        setSessionUser(session.user);

        const [profileRes, courseRes, enrollRes, deptRes] = await Promise.all([
          supabase.from("profiles").select("*, departments(id, name)").eq("id", session.user.id).single(),
          supabase.from("courses").select("*"),
          supabase.from("enrollments").select("*, courses(*)").eq("student_id", session.user.id),
          supabase.from("departments").select("*")
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
        if (deptRes.data) setDepartmentsList(deptRes.data);
        if (enrollRes.data) setEnrollments(enrollRes.data);
        setUserProgress(progressData);
        setCourseLessons(lessonData);
      } catch (error) {
        console.error("Courses Page Load Error:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesPageData();
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

  const departmentSlug = profile?.department_slug;
  const recommendedCourses = allCourses.filter(course => {
    const courseDepts = departmentsList.filter((d: any) => 
      d.id === course.dept_id || (course.dept_ids && course.dept_ids.includes(d.id))
    );
    return courseDepts.some((d: any) => d.slug === departmentSlug);
  });

  const otherCourses = allCourses.filter(course => {
    const courseDepts = departmentsList.filter((d: any) => 
      d.id === course.dept_id || (course.dept_ids && course.dept_ids.includes(d.id))
    );
    return !courseDepts.some((d: any) => d.slug === departmentSlug);
  });

  // Client-side filtering logic
  const filteredRecommended = recommendedCourses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOther = otherCourses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAF6F0]">
        {/* Header Navigation */}
        <header className="h-16 border-b border-black/10 bg-white flex items-center justify-between px-6 shrink-0 shadow-none">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 lg:hidden text-black hover:bg-black/5 rounded-[8px]"
            >
              <Menu size={20} className="text-[#8B5A2B]" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-[#8B5A2B] bg-[#FDBF84]/20 border border-[#FDBF84]/30 px-2 py-0.5 rounded-[6px]">
              {profile?.departments?.name || "Active Program"}
            </span>
          </div>
        </header>

        {/* Content View */}
        <div className="flex-1 overflow-y-auto p-[32px] md:p-[48px] space-y-[40px] pb-24 bg-[#FAF6F0]">
          
          {/* Centered live search bar & header */}
          <div className="flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-black flex items-center justify-center gap-2">
                <BookOpen className="text-[#8B5A2B]" size={28} /> Course Catalog
              </h1>
              <p className="text-xs text-black/60">Find and search for specialization tracks and training courses.</p>
            </div>

            {/* Crisp, Centered Live Course Search Engine */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B5A2B] h-4 w-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses by title..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-black/10 rounded-[12px] focus:outline-none focus:border-black transition-all text-sm text-black placeholder-black/40 shadow-xs"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
                >
                  <X size={14} className="text-[#8B5A2B]" />
                </button>
              )}
            </div>
          </div>

          {/* Specialization / Branch Courses */}
          <section className="space-y-[16px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/10 pb-[12px] gap-2">
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
              {filteredRecommended.map(course => (
                <motion.div key={course.id} variants={cardVariants}>
                  <CourseCard 
                    course={course} 
                    enrolled={enrollments.find(e => e.course_id === course.id)} 
                    progress={userProgress.filter(p => p.course_id === course.id)}
                    lessons={courseLessons.filter(l => l.course_id === course.id)}
                    profile={profile}
                    departmentsList={departmentsList}
                    sessionUser={sessionUser}
                  />
                </motion.div>
              ))}
              {filteredRecommended.length === 0 && (
                <div className="col-span-full p-[32px] text-center bg-neutral-50 border border-black/10 rounded-[12px]">
                  <p className="text-xs text-black/60 font-medium">No specialization courses found matching your query.</p>
                </div>
              )}
            </motion.div>
          </section>

          {/* Alternate Study Tracks */}
          <section className="space-y-[16px]">
            <div className="border-b border-black/10 pb-[12px]">
              <h2 className="text-lg font-bold text-black">Explore Parallel Study Tracks</h2>
              <p className="text-xs text-black/60">Learn skills from other branches</p>
            </div>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]"
            >
              {filteredOther.map(course => (
                <motion.div key={course.id} variants={cardVariants}>
                  <CourseCard 
                    course={course} 
                    enrolled={enrollments.find(e => e.course_id === course.id)}
                    progress={userProgress.filter(p => p.course_id === course.id)}
                    lessons={courseLessons.filter(l => l.course_id === course.id)}
                    profile={profile}
                    departmentsList={departmentsList}
                    sessionUser={sessionUser}
                  />
                </motion.div>
              ))}
              {filteredOther.length === 0 && (
                <div className="col-span-full p-[32px] text-center bg-neutral-50 border border-black/10 rounded-[12px]">
                  <p className="text-xs text-black/60 font-medium">No alternate courses available matching your query.</p>
                </div>
              )}
            </motion.div>
          </section>
        </div>
    </main>
  );
}



function CourseCard({ course, enrolled, progress, lessons, profile, departmentsList, sessionUser }: any) {
  const router = useRouter();
  const isEnrolled = enrolled?.payment_status === 'completed' || enrolled?.payment_status === 'success';
  const totalLessons = Math.max(1, lessons.length);
  const progressPercent = Math.round((progress.length / totalLessons) * 100);

  // Filter departments mapped to this course (either primary dept_id or in dept_ids array)
  const courseDepts = departmentsList.filter((d: any) => 
    d.id === course.dept_id || (course.dept_ids && course.dept_ids.includes(d.id))
  );

  return (
    <div className="flex flex-col h-full bg-white border border-black/10 rounded-[12px] hover:border-black/20 transition-all shadow-none overflow-hidden group">
      {course.video_url && (
        <div className="h-40 w-full overflow-hidden relative bg-neutral-50 border-b border-black/10 shrink-0">
          <img src={getYouTubeThumbnail(course.video_url)} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-[4px] border border-black/10 flex items-center gap-1 text-[9px] font-bold text-black">
            <Clock size={10} className="text-[#8B5A2B]" /> Self-Paced
          </div>
        </div>
      )}

      <div className="p-[20px] flex flex-col flex-1">
        {/* Department badges and belonging indicator */}
        <div className="space-y-2 mb-[12px]">
          <div className="flex flex-wrap gap-1">
            {courseDepts.map((dept: any) => {
              const isUserDept = dept.slug === profile?.department_slug;
              const isItDept = dept.slug === 'it';
              const badgeStyle = isUserDept 
                ? (isItDept 
                    ? "bg-[#8B5A2B] text-white border-[#8B5A2B]" // IT brown highlight
                    : "bg-[#FDBF84] text-neutral-900 border-[#FDBF84]/60" // User's department peach highlight
                  )
                : "bg-black/5 text-black/60 border-black/10";
              return (
                <span key={dept.id} className={`text-[9px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-[4px] ${badgeStyle}`}>
                  {dept.slug.toUpperCase()}
                </span>
              );
            })}
          </div>

          {course.dept_ids && course.dept_ids.length > 1 && courseDepts.some((d: any) => d.slug === profile?.department_slug) && (
            <span className="text-[9px] font-bold text-[#8B5A2B] bg-[#FDBF84]/20 border border-[#FDBF84]/40 px-2 py-0.5 rounded-[4px] uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck size={10} className="text-[#8B5A2B]" /> This course belongs to your department
            </span>
          )}
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
              <div className="h-full bg-[#8B5A2B]" style={{ width: `${progressPercent}%` }} />
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
              className="w-full rounded-[8px] h-9 font-extrabold bg-[#FDBF84] text-neutral-900 hover:bg-[#FCAE68] shadow-none text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-[#FDBF84]/25" 
              onClick={() => router.push(`/dashboard/courses/${course.id}`)}
            >
              {isEnrolled ? (
                <>Resume Learning <ArrowRight size={12} className="text-neutral-900" /></>
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
