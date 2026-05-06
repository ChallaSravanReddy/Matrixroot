"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CertificatePDF from "@/components/CertificatePDF";

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
        // Parallel fetching for 5x faster load times
        const [
          { data: userProfile },
          { data: courseData },
          { data: allEnrollments },
          { data: progress },
          { data: lessons }
        ] = await Promise.all([
          supabase.from("profiles").select("*, departments(id, name)").eq("id", session.user.id).single(),
          supabase.from("courses").select("*, departments(name, slug)"),
          supabase.from("enrollments").select("*, courses(*)").eq("student_id", session.user.id),
          supabase.from("user_progress").select("*").eq("user_id", session.user.id),
          supabase.from("lessons").select("id, course_id")
        ]);

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
      <div className="flex min-h-screen bg-zinc-950 items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
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
      <div className="group flex flex-col bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 relative">
        
        {/* Recommended Badge */}
        {isRecommended && (
          <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            Recommended
          </div>
        )}

        {/* Thumbnail Placeholder */}
        <div className="w-full h-48 bg-zinc-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 group-hover:scale-105 transition-transform duration-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-zinc-600 group-hover:text-indigo-400/50 transition-colors duration-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
            </svg>
          </div>
          
          {/* Department tag at bottom left */}
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg text-xs font-medium text-zinc-300">
            {course.departments?.name || 'General'}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-6 flex flex-col">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">{course.title}</h3>
          
          {/* Progress Bar for Enrolled Courses */}
          {isAlreadyEnrolled && (
            <div className="mb-4 space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-zinc-500">Course Progress</span>
                <span className="text-indigo-400">
                  {Math.round((userProgress.filter(p => p.course_id === course.id).length / Math.max(1, courseLessons.filter(l => l.course_id === course.id).length)) * 100)}%
                </span>
              </div>
              <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-1000" 
                  style={{ width: `${(userProgress.filter(p => p.course_id === course.id).length / Math.max(1, courseLessons.filter(l => l.course_id === course.id).length)) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          <p className="text-sm text-zinc-400 mb-6 flex-1 line-clamp-3">
            {course.description || "No description available."}
          </p>
          
          <button 
            onClick={() => window.location.href = `/courses/${course.id}`}
            className={`w-full py-2.5 px-4 font-medium rounded-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 group-hover:shadow-indigo-500/20 ${
              isAlreadyEnrolled 
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20" 
              : "bg-zinc-800 hover:bg-indigo-600 text-white group-hover:bg-indigo-600"
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
            <div className="mt-3 pt-3 border-t border-zinc-800">
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
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-72 hidden md:flex flex-col border-r border-zinc-800/60 bg-zinc-900/20 backdrop-blur-md">
        <div className="p-6 border-b border-zinc-800/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            R
          </div>
          <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Rooted Matrix
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          <div className="space-y-3">
            <div className="px-3">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Student Profile</p>
              <h3 className="text-lg font-bold text-white mt-1 truncate">{profile?.full_name || "New Student"}</h3>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 bg-indigo-500/10 text-indigo-300 rounded-xl border border-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>
              <span className="font-medium text-sm truncate">{departmentName ? departmentName : "No Branch Selected"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Menu</p>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-indigo-400 bg-indigo-500/10 rounded-lg transition-colors border border-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              Dashboard
            </button>
            <button 
              onClick={() => window.location.href = '/internships'}
              className="w-full flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
              </svg>
              View Internships
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors">
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
            <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Internship Tracks</p>
            <div className="space-y-1">
              {allCourses.map((course) => (
                <button 
                  key={course.id} 
                  onClick={() => window.location.href = `/courses/${course.id}`}
                  className="w-full flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all group"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-indigo-500 transition-colors"></div>
                  <span className="text-sm font-medium truncate">{course.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-800/60 space-y-2">
          <button 
            onClick={() => window.location.href = '/profile'}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl hover:bg-zinc-800 transition-all text-sm font-medium text-zinc-300 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Profile Settings
          </button>
          
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl hover:bg-zinc-800 transition-all text-sm font-medium text-zinc-300 hover:text-white"
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
        <header className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-white">
              R
            </div>
            <span className="font-bold text-white">Dashboard</span>
          </div>
          <button onClick={() => window.location.href = '/profile'} className="p-2 text-zinc-400 hover:text-white mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </button>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-20 space-y-12">
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back!</h1>
            <p className="text-zinc-400 text-lg">
              {departmentName ? (
                <>Here are your internship modules for <span className="text-indigo-400 font-medium">{departmentName}</span>.</>
              ) : (
                <span className="text-amber-400 font-medium">Choose your branch in Profile Settings to see your recommended track.</span>
              )}
            </p>
          </div>

          {/* STUDENT SUCCESS ANALYTICS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Progress Card */}
            <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Course Progress</p>
                <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded border border-indigo-500/20 uppercase tracking-tighter">
                  {Math.round((stats.completedLessons / stats.totalLessons) * 100)}%
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-4">
                {stats.completedLessons} / {stats.totalLessons} <span className="text-xs text-zinc-500 font-normal">Modules Done</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                  style={{ width: `${(stats.completedLessons / stats.totalLessons) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Assignment Card */}
            <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Submissions</p>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {stats.assignmentCount} <span className="text-xs text-zinc-500 font-normal">Assignments Submitted</span>
              </div>
              <p className="text-xs text-zinc-500">Keep submitting to qualify for certification.</p>
            </div>
          </div>

          {/* RECOMMENDED COURSES SECTION */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold border-b border-zinc-800 pb-2 inline-block">
              Recommended for Your Branch
            </h2>
            
            {recommendedCourses.length === 0 ? (
              <div className="w-full p-8 bg-zinc-900/30 border border-zinc-800/60 border-dashed rounded-2xl flex flex-col items-center justify-center text-center">
                <p className="text-zinc-400">
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
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-2">
              <h2 className="text-2xl font-bold text-zinc-300">
                Explore Other Internships
              </h2>
              <span className="px-3 py-1 bg-zinc-800 text-zinc-400 text-xs font-semibold rounded-full">
                {otherCourses.length} Modules
              </span>
            </div>
            
            {otherCourses.length === 0 ? (
              <div className="w-full p-8 bg-zinc-900/30 border border-zinc-800/60 border-dashed rounded-2xl flex flex-col items-center justify-center text-center">
                <p className="text-zinc-400">No other courses available at the moment.</p>
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
