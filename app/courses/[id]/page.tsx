"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface Lesson {
  id: string;
  title: string;
  content_url?: string;
  is_preview?: boolean;
  order_index?: number;
}

export default function CourseDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/login";
        return;
      }

      // Fetch course details
      const { data: courseData } = await supabase
        .from("courses")
        .select("*, departments(name)")
        .eq("id", id)
        .single();
        
      if (courseData) {
        setCourse(courseData);
      } else {
        // Fallback for demo if ID is invalid
        window.location.href = "/dashboard";
      }

      // Fetch lessons
      const { data: lessonData } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", id)
        .order("order_index", { ascending: true });
        
      if (lessonData && lessonData.length > 0) {
        setLessons(lessonData);
      } else {
        // Insert dummy syllabus for the demo if no lessons are found
        setLessons([
          { id: "1", title: "Module 1: Introduction & Fundamentals" },
          { id: "2", title: "Module 2: Advanced Techniques" },
          { id: "3", title: "Module 3: Hands-on Project" },
          { id: "4", title: "Module 4: Final Assessment" }
        ]);
      }
      // Check enrollment status
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("*")
        .eq("student_id", session.user.id)
        .eq("course_id", id)
        .eq("payment_status", "completed")
        .maybeSingle();
      
      if (enrollment) {
        setIsEnrolled(true);
      }
      
      setLoading(false);
    };

    fetchCourseData();
  }, [id]);

  const handleEnroll = () => {
    setShowPayment(true);
  };

  const handlePayNow = async () => {
    setEnrollLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      // Update enrollments table (mock function)
      const { error } = await supabase
        .from('enrollments')
        .insert({
          student_id: session.user.id,
          course_id: id,
          payment_status: 'completed'
        });
        
      if (error) {
        console.error("Payment insert error:", error);
        // We'll proceed anyway for the demo if table doesn't exist
      }
      
      // Redirect to first lesson
      const firstLessonId = lessons.length > 0 ? lessons[0].id : '';
      if (firstLessonId) {
        window.location.href = `/dashboard/courses/${id}/lessons/${firstLessonId}`;
      } else {
        alert("No lessons available yet.");
        setShowPayment(false);
        setEnrollLoading(false);
      }
      
    } catch (err) {
      console.error(err);
      setEnrollLoading(false);
      setShowPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-zinc-950 items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 p-6 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <button 
          onClick={() => window.location.href = '/dashboard'} 
          className="p-2 bg-zinc-800/50 hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent truncate max-w-[250px] md:max-w-none">
            {course?.title || "Course Details"}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column: Course Info & Syllabus */}
          <div className="lg:col-span-2 space-y-10">
            {/* Hero Image / Placeholder */}
            <div className="w-full h-64 md:h-80 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden relative shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-zinc-900 to-purple-600/30"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24 text-zinc-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                </svg>
              </div>
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-xs font-medium text-cyan-300 uppercase tracking-wider">
                  {course?.departments?.name || "General"} Track
                </span>
                <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-xs font-medium text-purple-300 uppercase tracking-wider">
                  Internship
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">{course?.title}</h2>
              <p className="text-lg text-zinc-400 leading-relaxed whitespace-pre-wrap">
                {course?.description || "A comprehensive training program designed to equip you with the skills necessary for modern industry demands. This course blends theoretical knowledge with intense, practical application."}
              </p>
            </div>

            {/* Syllabus */}
            <div className="space-y-6 pt-6 border-t border-zinc-800">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-white">Course Syllabus</h3>
                <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-400 font-medium">
                  {lessons.length} Modules
                </span>
              </div>
              
              <div className="space-y-4">
                {lessons.map((lesson, index) => {
                  const isLocked = !isEnrolled && !lesson.is_preview;
                  
                  return (
                    <button 
                      key={lesson.id} 
                      onClick={() => {
                        if (isLocked) {
                          handleEnroll();
                        } else {
                          window.location.href = `/dashboard/courses/${id}/lessons/${lesson.id}`;
                        }
                      }}
                      className={`w-full flex gap-6 p-6 bg-zinc-900/50 backdrop-blur-sm border rounded-2xl transition-all text-left group ${
                        isLocked ? "border-zinc-800 opacity-75 cursor-default" : "border-zinc-800 hover:bg-zinc-800/50 hover:border-indigo-500/30 cursor-pointer"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border transition-colors ${
                          isLocked 
                          ? "bg-zinc-800 border-zinc-700 text-zinc-500" 
                          : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                        }`}>
                          {isLocked ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                          ) : index + 1}
                        </div>
                        {index !== lessons.length - 1 && (
                          <div className="w-px h-full bg-zinc-800 mt-4"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-2 flex flex-col justify-center">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <h4 className={`text-lg font-semibold transition-colors ${isLocked ? "text-zinc-500" : "text-white"}`}>
                              {lesson.title}
                            </h4>
                            {lesson.is_preview && (
                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold uppercase tracking-wider">
                                Free Preview
                              </span>
                            )}
                          </div>
                          {isLocked && (
                            <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Locked</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Enrollment Card */}
          <div className="relative">
            <div className="sticky top-24 bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-3xl p-8 shadow-2xl space-y-8">
              
              {!isEnrolled && (
                <div className="space-y-2 text-center">
                  <p className="text-zinc-400 font-medium uppercase tracking-wider text-sm">Enrollment Status</p>
                  <div className="text-4xl font-bold text-white">₹4,999</div>
                  <p className="text-xs text-zinc-500 line-through">₹9,999</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-zinc-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-indigo-400">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  <span>Full lifetime access</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-indigo-400">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  <span>Certificate of Completion</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-indigo-400">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  <span>1-on-1 Mentorship</span>
                </div>
              </div>

              <button 
                onClick={isEnrolled ? () => {
                  const firstLessonId = lessons.length > 0 ? lessons[0].id : '';
                  if (firstLessonId) window.location.href = `/dashboard/courses/${id}/lessons/${firstLessonId}`;
                } : handleEnroll}
                className={`w-full py-4 ${isEnrolled ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25" : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25"} text-white font-bold rounded-2xl transition-all shadow-lg active:scale-[0.98] flex justify-center items-center gap-2`}
              >
                {isEnrolled ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    Go to Training
                  </>
                ) : "Enroll in Training"}
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => !enrollLoading && setShowPayment(false)}
              disabled={enrollLoading}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Unlock Internship Access</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  To access the recorded modules, live office hours, and receive your Rooted Matrix Internship Certificate, a one-time training fee of <strong className="text-white">₹500</strong> is required.
                </p>
              </div>

              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400 font-medium text-sm">Total Amount</span>
                <span className="text-2xl font-bold text-white">₹500</span>
              </div>

              <button 
                onClick={handlePayNow}
                disabled={enrollLoading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {enrollLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Secure Payment...
                  </>
                ) : (
                  "Pay Now"
                )}
              </button>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
