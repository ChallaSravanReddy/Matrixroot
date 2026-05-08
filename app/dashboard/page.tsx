"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CertificatePDF from "@/components/CertificatePDF";
import Image from "next/image";

export const dynamic = "force-dynamic";

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

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    completedLessons: 0,
    totalLessons: 0,
    assignmentCount: 0,
    activeCourse: ""
  });
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [courseLessons, setCourseLessons] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }

      try {
        // Parallel fetching
        const [
          profileRes,
          courseRes,
          enrollRes,
          progressRes,
          lessonRes
        ] = await Promise.all([
          supabase.from("profiles").select("*, departments(id, name)").eq("id", session.user.id).single(),
          supabase.from("courses").select("*, departments(name, slug)"),
          supabase.from("enrollments").select("*, courses(*)").eq("student_id", session.user.id),
          supabase.from("user_progress").select("*").eq("user_id", session.user.id),
          supabase.from("lessons").select("id, course_id")
        ]);

        if (profileRes.error) console.error("Profile Fetch Error:", profileRes.error);
        if (courseRes.error) console.error("Courses Fetch Error:", courseRes.error);
        if (enrollRes.error) console.error("Enrollments Fetch Error:", enrollRes.error);
        if (progressRes.error) console.error("Progress Fetch Error:", progressRes.error);
        if (lessonRes.error) console.error("Lessons Fetch Error:", lessonRes.error);

        const userProfile = profileRes.data;
        const courseData = courseRes.data;
        const allEnrollments = enrollRes.data;
        const progress = progressRes.data;
        const lessons = lessonRes.data;

        if (userProfile) setProfile(userProfile);
        if (courseData) setAllCourses(courseData as Course[]);
        
        if (allEnrollments && allEnrollments.length > 0) {
          setEnrollments(allEnrollments);
          setEnrollment(allEnrollments[0]);
        }

        if (progress && lessons) {
          setUserProgress(progress);
          setCourseLessons(lessons);
          
          const assignmentsWithLinks = progress.filter(p => p.assignment_url && p.assignment_url.trim() !== "").length;
          setStats({
            completedLessons: progress.length,
            totalLessons: lessons.length || 1,
            assignmentCount: assignmentsWithLinks,
            activeCourse: userProfile?.department_slug ? `Active in ${userProfile.departments?.name}` : "No Active Track"
          });
        }
      } catch (error) {
        console.error("Dashboard Load Error (Unexpected):", error);
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
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const departmentSlug = profile?.department_slug;
  const departmentName = profile?.departments?.name || departmentSlug;

  // Filter courses based on user's department
  const recommendedCourses = allCourses.filter(course => course.departments?.slug === departmentSlug);
  const otherCourses = allCourses.filter(course => course.departments?.slug !== departmentSlug);

  // Component to render a course card
  const CourseCard = ({ course, isRecommended }: { course: Course, isRecommended: boolean }) => {
    const isAlreadyEnrolled = enrollments.some(e => e.course_id === course.id && e.payment_status === 'completed');

    return (
      <div className="group flex flex-col bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 relative">
        
        {/* Recommended Badge */}
        {isRecommended && (
          <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-gradient-to-r from-sky-500 to-blue-600 text-slate-900 text-xs font-bold uppercase tracking-wider rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            Recommended
          </div>
        )}

        {/* Thumbnail Placeholder */}
        <div className="w-full h-48 bg-slate-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-sky-500/20 group-hover:scale-105 transition-transform duration-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-slate-600 group-hover:text-blue-600/50 transition-colors duration-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
            </svg>
          </div>
          
          {/* Department tag at bottom left */}
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg text-xs font-medium text-slate-700">
            {course.departments?.name || 'General'}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-6 flex flex-col">
          <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">{course.title}</h3>
          
          {/* Progress Bar for Enrolled Courses */}
          {isAlreadyEnrolled && (
            <div className="mb-4 space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-slate-400">Course Progress</span>
                <span className="text-blue-600">
                  {Math.round((userProgress.filter(p => p.course_id === course.id).length / Math.max(1, courseLessons.filter(l => l.course_id === course.id).length)) * 100)}%
                </span>
              </div>
              <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-1000" 
                  style={{ width: `${(userProgress.filter(p => p.course_id === course.id).length / Math.max(1, courseLessons.filter(l => l.course_id === course.id).length)) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          <p className="text-sm text-slate-600 mb-6 flex-1 line-clamp-3">
            {course.description || "No description available."}
          </p>
          
          <button 
            onClick={() => window.location.href = `/dashboard/courses/${course.id}`}
            className={`w-full py-2.5 px-4 font-medium rounded-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 group-hover:shadow-blue-500/20 ${
              isAlreadyEnrolled 
              ? "bg-sky-600 hover:bg-sky-500 text-white shadow-sky-500/20" 
              : "bg-slate-200 hover:bg-blue-600 text-white group-hover:bg-blue-600"
            }`}
          >
            {isAlreadyEnrolled ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                Enrolled
              </>
            ) : (
              <>
                Start Internship
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 transform group-hover:translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                </svg>
              </>
            )}
          </button>

          {/* Certificate Download - Only if approved for this specific course */}
          {isAlreadyEnrolled && enrollments.find(e => e.course_id === course.id)?.certification_status === 'approved' && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <CertificatePDF 
                studentName={profile?.full_name || "Graduate"} 
                courseName={course.title} 
                branch={profile?.departments?.name || "Engineering"} 
                score={enrollments.find(e => e.course_id === course.id)?.final_score || 0} 
                certId={enrollments.find(e => e.course_id === course.id)?.id.substring(0, 13).toUpperCase() || "CERT"}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-72 hidden md:flex flex-col border-r border-slate-200/60 bg-white/20 backdrop-blur-md">
        <div className="p-6 border-b border-slate-200/60 flex items-center gap-3">
          <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Matrix Root Logo" width={32} height={32} className="object-contain drop-shadow-md" priority />
          <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Matrix Root
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          <div className="space-y-3">
            <div className="px-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Student Profile</p>
              <h3 className="text-lg font-bold text-slate-900 mt-1 truncate">{profile?.full_name || "New Student"}</h3>
            </div>
            
          </div>

          <div className="space-y-2">
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu</p>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-blue-600 bg-blue-500/10 rounded-lg transition-colors border border-blue-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              Dashboard
            </button>
            <button 
              onClick={() => window.location.href = '/internships'}
              className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
              </svg>
              View Internships
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              Support / Office Hours
            </button>

            {profile?.role === 'admin' && (
              <button 
                onClick={() => window.location.href = '/admin'}
                className="w-full flex items-center gap-3 px-3 py-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-all border border-transparent hover:border-amber-500/30 font-bold mt-4 animate-pulse"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                Go to Admin Panel
              </button>
            )}
          </div>

          {/* COURSES PANEL */}
          <div className="space-y-2">
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Internship Tracks</p>
            <div className="space-y-1">
              {allCourses.map((course) => (
                <button 
                  key={course.id} 
                  onClick={() => window.location.href = `/dashboard/courses/${course.id}`}
                  className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all group"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-700 transition-colors"></div>
                  <span className="text-sm font-medium truncate">{course.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200/60 space-y-2">
          <button 
            onClick={() => window.location.href = '/profile'}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-600 rounded-xl hover:bg-slate-200 transition-all text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Profile Settings
          </button>
          
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-600 rounded-xl hover:bg-slate-200 transition-all text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center font-bold text-slate-900">
              R
            </div>
            <span className="font-bold text-slate-900">Dashboard</span>
          </div>
          <button onClick={() => window.location.href = '/profile'} className="p-2 text-slate-600 hover:text-slate-900 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </button>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-20 space-y-12">
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back!</h1>
            <p className="text-slate-600 text-lg">
              {departmentName ? (
                <>Here are your internship modules for <span className="text-blue-600 font-medium">{departmentName}</span>.</>
              ) : (
                <span className="text-amber-400 font-medium">Choose your branch in Profile Settings to see your recommended track.</span>
              )}
            </p>
          </div>

          {/* STUDENT SUCCESS ANALYTICS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Progress Card */}
            <div className="bg-white/40 backdrop-blur-md border border-slate-200 rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <p className="text-slate-600 text-sm font-medium uppercase tracking-wider">Course Progress</p>
                <span className="px-2 py-1 bg-blue-500/10 text-blue-600 text-[10px] font-bold rounded border border-blue-500/20 uppercase tracking-tighter">
                  {Math.round((stats.completedLessons / stats.totalLessons) * 100)}%
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-4">
                {stats.completedLessons} / {stats.totalLessons} <span className="text-xs text-slate-400 font-normal">Modules Done</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-sky-600 transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                  style={{ width: `${(stats.completedLessons / stats.totalLessons) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Assignment Card */}
            <div className="bg-white/40 backdrop-blur-md border border-slate-200 rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <p className="text-slate-600 text-sm font-medium uppercase tracking-wider">Submissions</p>
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {stats.assignmentCount} <span className="text-xs text-slate-400 font-normal">Assignments Submitted</span>
              </div>
              <p className="text-xs text-slate-400">Keep submitting to qualify for certification.</p>
            </div>
          </div>

          {/* RECOMMENDED COURSES SECTION */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold border-b border-slate-200 pb-2 inline-block">
              Recommended for Your Branch
            </h2>
            
            {recommendedCourses.length === 0 ? (
              <div className="w-full p-8 bg-white/30 border border-slate-200/60 border-dashed rounded-2xl flex flex-col items-center justify-center text-center">
                <p className="text-slate-600">
                  {!departmentSlug ? "Choose your branch in Profile Settings to see recommended courses." : "No recommended courses available for this branch yet."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} isRecommended={true} />
                ))}
              </div>
            )}
          </section>

          {/* EXPLORE OTHER INTERNSHIPS SECTION */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
              <h2 className="text-2xl font-bold text-slate-700">
                Explore Other Internships
              </h2>
              <span className="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-semibold rounded-full">
                {otherCourses.length} Modules
              </span>
            </div>
            
            {otherCourses.length === 0 ? (
              <div className="w-full p-8 bg-white/30 border border-slate-200/60 border-dashed rounded-2xl flex flex-col items-center justify-center text-center">
                <p className="text-slate-600">No other courses available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherCourses.map((course) => (
                  <CourseCard key={course.id} course={course} isRecommended={false} />
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
