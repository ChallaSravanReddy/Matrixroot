"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content_url: string;
  is_preview: boolean;
  order_index: number;
}

export default function LessonPage() {
  const params = useParams();
  const courseId = params?.courseId as string;
  const lessonId = params?.lessonId as string;
  
  const [course, setCourse] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Assignment and Progress state
  const [assignmentUrl, setAssignmentUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchLessonData = async () => {
      if (!courseId || !lessonId) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/login";
        return;
      }
      setUserId(session.user.id);

      // 1. Fetch Course Info
      const { data: courseData } = await supabase
        .from("courses")
        .select("title")
        .eq("id", courseId)
        .single();
      
      if (courseData) setCourse(courseData);

      // 2. Fetch All Lessons for Sidebar
      const { data: lessonsData } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });
        
      if (lessonsData) {
        setAllLessons(lessonsData);
        const active = lessonsData.find(l => l.id === lessonId);
        if (active) setCurrentLesson(active);
      }

      // 3. Fetch user progress for this specific lesson
      // Assuming a table named 'user_progress' exists. 
      // We gracefully handle if it doesn't by wrapping in try-catch/ignoring error.
      const { data: progressData, error: progressError } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();
        
      if (progressError) {
        console.error("Progress Fetch Error:", progressError);
      }
        
      if (progressData) {
        setIsCompleted(true);
        if (progressData.assignment_url) {
          setAssignmentUrl(progressData.assignment_url);
        }
      }

      // 4. Check Enrollment Status
      const { data: enrollData } = await supabase
        .from("enrollments")
        .select("*")
        .eq("student_id", session.user.id)
        .eq("course_id", courseId)
        .eq("payment_status", "completed")
        .maybeSingle();
      
      if (enrollData) {
        setIsEnrolled(true);
      }

      setLoading(false);
    };

    fetchLessonData();
  }, [courseId, lessonId]);

  const handleCompleteLesson = async () => {
    if (!userId || !currentLesson) return;
    setSubmitting(true);

    try {
      // Upsert into user_progress table
      const { error } = await supabase
        .from("user_progress")
        .upsert({
          user_id: userId,
          lesson_id: currentLesson.id,
          course_id: courseId,
          assignment_url: assignmentUrl || null,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id, lesson_id' // Assuming composite unique key if they exist, else standard upsert relies on primary key
        });

      if (error) {
        // If the table doesn't exist yet, we catch it here.
        console.error("Progress table error:", error);
        alert("Make sure you have created the 'user_progress' table in Supabase!");
      } else {
        setIsCompleted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-zinc-950 items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Helper to render video player based on URL type
  const renderVideoPlayer = (url: string) => {
    if (!url) {
      return (
        <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-500">
          No video URL provided
        </div>
      );
    }
    
    // Simple check for MP4 vs embed (YouTube/Vimeo/Cloudinary)
    if (url.endsWith('.mp4')) {
      return <video src={url} controls className="w-full h-full object-cover" />;
    } else {
      // Assuming it's an embeddable iframe URL (like YouTube embed)
      return (
        <iframe 
          src={url} 
          className="w-full h-full" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
        ></iframe>
      );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white font-sans overflow-hidden">
      
      {/* Top Navigation Bar */}
      <header className="flex-shrink-0 h-16 border-b border-zinc-800 bg-zinc-950 flex items-center px-6 justify-between z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.location.href = `/courses/${courseId}`} 
            className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Course
          </button>
          <div className="h-4 w-px bg-zinc-800"></div>
          <span className="font-semibold text-zinc-300 truncate max-w-sm">{course?.title}</span>
        </div>
      </header>

      {/* Main Layout (70/30 Split) */}
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        
        {/* LEFT COLUMN: 70% Video & Assignment */}
        <div className="w-full lg:w-[70%] h-full overflow-y-auto flex flex-col border-r border-zinc-800 scrollbar-hide">
          
          {/* Video Player Area */}
          <div className="w-full aspect-video bg-black relative shadow-2xl">
            {currentLesson ? (
              (!currentLesson.is_preview && !isEnrolled) ? (
                <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center p-8 text-center space-y-6">
                  <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-indigo-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Enrollment Required</h2>
                    <p className="text-zinc-400 max-w-md mx-auto">
                      This lesson is part of the premium internship track. Please enroll in the course to unlock full access to all modules and assignments.
                    </p>
                  </div>
                  <button 
                    onClick={() => window.location.href = `/courses/${courseId}`}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
                  >
                    Enroll Now to Unlock
                  </button>
                </div>
              ) : (
                renderVideoPlayer(currentLesson.content_url)
              )
            ) : (
               <div className="w-full h-full flex items-center justify-center text-zinc-500">Lesson not found</div>
            )}
          </div>

          {/* Lesson Content & Assignment Area */}
          <div className="p-8 lg:p-12 max-w-4xl mx-auto w-full space-y-10">
            
            {/* Title Section */}
            <div className="space-y-4 border-b border-zinc-800/60 pb-8">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  {currentLesson?.title}
                </h1>
                {isCompleted && (
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    Completed
                  </span>
                )}
              </div>
            </div>

            {/* Assignment Section */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-3xl p-8 shadow-xl">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12" />
                </svg>
                Lesson Assignment
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Submission Link (GitHub / Google Drive)</label>
                  <textarea 
                    value={assignmentUrl}
                    onChange={(e) => setAssignmentUrl(e.target.value)}
                    placeholder="https://github.com/yourusername/project"
                    className="w-full bg-zinc-950 border border-zinc-700 hover:border-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-4 text-white placeholder:text-zinc-600 transition-all min-h-[100px] resize-y"
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <p className="text-xs text-zinc-500 max-w-[250px]">
                    By marking this as complete, you verify that you have finished watching the lesson and submitted any required work.
                  </p>
                  
                  <button 
                    onClick={handleCompleteLesson}
                    disabled={submitting || (isCompleted && !assignmentUrl)} // Disable if already completed unless they are updating the URL
                    className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 ${
                      isCompleted 
                        ? "bg-zinc-800 text-white hover:bg-zinc-700" 
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 active:scale-[0.98]"
                    }`}
                  >
                    {submitting ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : isCompleted ? (
                      "Update Submission"
                    ) : (
                      "Complete Lesson"
                    )}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: 30% Syllabus Sidebar */}
        <div className="w-full lg:w-[30%] h-full bg-zinc-900/30 overflow-y-auto flex flex-col">
          <div className="p-6 border-b border-zinc-800/60 sticky top-0 bg-zinc-900/80 backdrop-blur-xl z-10">
            <h2 className="text-xl font-bold text-white">Course Syllabus</h2>
            <p className="text-sm text-zinc-400 mt-1">{allLessons.length} Modules</p>
          </div>
          
          <div className="p-4 space-y-2">
            {allLessons.map((lesson, index) => {
              const isActive = lesson.id === lessonId;
              
              return (
                <button
                  key={lesson.id}
                  onClick={() => window.location.href = `/dashboard/courses/${courseId}/lessons/${lesson.id}`}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-200 group ${
                    isActive 
                      ? "bg-indigo-500/10 border border-indigo-500/50 shadow-inner" 
                      : "hover:bg-zinc-800/50 border border-transparent hover:border-zinc-700/50"
                  }`}
                >
                  <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700"
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium mb-1 line-clamp-2 ${isActive ? "text-indigo-100" : "text-zinc-300 group-hover:text-white"}`}>
                      {lesson.title}
                    </h4>
                    {lesson.is_preview && !isActive && (
                      <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">Free Preview</span>
                    )}
                  </div>
                  
                  {/* If we loaded all progress, we could show a checkmark here. For now, just show active indicator */}
                  {isActive && (
                     <div className="w-2 h-2 rounded-full bg-indigo-400 self-center shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
