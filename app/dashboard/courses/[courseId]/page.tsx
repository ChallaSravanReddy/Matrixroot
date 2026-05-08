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
  const courseId = params?.courseId as string;
  
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/login";
        return;
      }

      // Fetch course details
      const { data: courseData } = await supabase
        .from("courses")
        .select("*, departments(name)")
        .eq("id", courseId)
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
        .eq("course_id", courseId)
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
        .eq("course_id", courseId)
        .eq("payment_status", "completed")
        .maybeSingle();
      
      if (enrollment) {
        setIsEnrolled(true);
      } else {
        setShowPayment(true);
      }
      
      setLoading(false);
    };

    fetchCourseData();
  }, [courseId]);

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
          course_id: courseId,
          payment_status: 'completed'
        });
        
      if (error) {
        console.error("Payment insert error:", error);
        // We'll proceed anyway for the demo if table doesn't exist
      }
      
      // Redirect to first lesson
      const firstLessonId = lessons.length > 0 ? lessons[0].id : '';
      if (firstLessonId) {
        window.location.href = `/dashboard/courses/${courseId}/lessons/${firstLessonId}`;
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
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 p-6 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <button 
          onClick={() => window.location.href = '/dashboard'} 
          className="p-2 bg-slate-100 hover:bg-slate-700 rounded-lg transition-colors border border-slate-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent truncate max-w-[250px] md:max-w-none">
            {course?.title || "Course Details"}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-4xl mx-auto space-y-10">
          
          {/* Course Info & Syllabus */}
          <div className="space-y-10">
            {/* Hero Image / Placeholder */}
            <div className="w-full h-64 md:h-80 bg-white border border-slate-200 rounded-3xl overflow-hidden relative shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-slate-900 to-sky-600/30"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24 text-slate-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                </svg>
              </div>
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-xs font-medium text-sky-300 uppercase tracking-wider">
                  {course?.departments?.name || "General"} Track
                </span>
                <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-xs font-medium text-sky-300 uppercase tracking-wider">
                  Internship
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">{course?.title}</h2>
              <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap">
                {course?.description || "A comprehensive training program designed to equip you with the skills necessary for modern industry demands. This course blends theoretical knowledge with intense, practical application."}
              </p>
            </div>

            {/* Syllabus */}
            <div className="space-y-6 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-slate-900">Course Syllabus</h3>
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-600 font-medium">
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
                          window.location.href = `/dashboard/courses/${courseId}/lessons/${lesson.id}`;
                        }
                      }}
                      className={`w-full flex gap-6 p-6 bg-white/80 backdrop-blur-sm border rounded-2xl transition-all text-left group ${
                        isLocked ? "border-slate-200 opacity-75 cursor-default" : "border-slate-200 hover:bg-slate-100 hover:border-blue-500/30 cursor-pointer"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border transition-colors ${
                          isLocked 
                          ? "bg-slate-200 border-slate-300 text-slate-400" 
                          : "bg-blue-500/10 border-blue-500/20 text-blue-600"
                        }`}>
                          {isLocked ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                          ) : index + 1}
                        </div>
                        {index !== lessons.length - 1 && (
                          <div className="w-px h-full bg-slate-200 mt-4"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-2 flex flex-col justify-center">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <h4 className={`text-lg font-semibold transition-colors ${isLocked ? "text-slate-400" : "text-slate-900"}`}>
                              {lesson.title}
                            </h4>
                            {lesson.is_preview && (
                              <span className="px-2 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded text-[10px] font-bold uppercase tracking-wider">
                                Free Preview
                              </span>
                            )}
                          </div>
                          {isLocked && (
                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Locked</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Modal / Guidelines */}
      {showPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4 flex-shrink-0">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                Internship Enrollment & Guidelines
              </h3>
              <button 
                onClick={() => !enrollLoading && setShowPayment(false)}
                disabled={enrollLoading}
                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              
              {/* Syllabus Preview */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-600">
                    <path fillRule="evenodd" d="M6 3.75A2.75 2.75 0 018.75 1h2.5A2.75 2.75 0 0114 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.191-1.83 2.665l-.618.257a.75.75 0 00-.45.698v1.091A2.75 2.75 0 0112.352 18h-4.704A2.75 2.75 0 014.896 15.25v-1.091a.75.75 0 00-.45-.698l-.618-.257C2.694 12.73 2 11.665 2 10.539V7.07c0-1.321.947-2.489 2.294-2.676A41.047 41.047 0 016 4.193V3.75zm6.5 0v.328a41.623 41.623 0 00-5 0V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25z" clipRule="evenodd" />
                  </svg>
                  Syllabus Preview ({lessons.length} Modules)
                </h4>
                <div className="bg-white border border-slate-200 rounded-xl max-h-[160px] overflow-y-auto divide-y divide-slate-100">
                  {lessons.map((l, i) => (
                    <div key={l.id} className="p-3 text-sm flex items-start gap-3">
                      <span className="text-slate-400 font-medium">{i + 1}.</span>
                      <span className="text-slate-700 font-medium">{l.title}</span>
                    </div>
                  ))}
                  {lessons.length === 0 && <div className="p-4 text-sm text-slate-500 text-center">Syllabus loading...</div>}
                </div>
              </div>

              {/* Guidelines Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Type</span>
                    <span className="text-sm font-medium text-slate-800">Self-Paced Industrial Training + Internship</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Stipend</span>
                    <span className="text-sm font-medium text-slate-800">Non-stipendiary training program</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cost</span>
                    <span className="text-sm font-medium text-slate-800">One-time Training & Infrastructure fee of <strong className="text-blue-600">₹500</strong></span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Refund Policy</span>
                    <span className="text-sm font-medium text-slate-800">Strictly <strong className="text-red-500">No Refunds</strong> once materials are accessed</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Process</span>
                  <span className="text-sm font-medium text-slate-800">Internship Certificate is awarded <strong>ONLY</strong> after successfully completing all modules and submitting all required assignments.</span>
                </div>
              </div>

            </div>

            {/* Footer / Actions */}
            <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col gap-4 flex-shrink-0">

              <button 
                onClick={handlePayNow}
                disabled={enrollLoading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98] flex justify-center items-center gap-2"
              >
                {enrollLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Initializing Secure Checkout...
                  </>
                ) : (
                  "Start training"
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
