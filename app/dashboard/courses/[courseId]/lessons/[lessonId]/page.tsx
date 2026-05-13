"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content_url: string;
  notes?: string;
  module_id?: string;
  is_preview: boolean;
  order_index: number;
  has_assignment?: boolean;
}

export default function LessonPage() {
  const params = useParams();
  const courseId = params?.courseId as string;
  const lessonId = params?.lessonId as string;
  
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
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

      // 1.5 Fetch Course Modules
      const { data: modsData } = await supabase
        .from("course_modules")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });
      if (modsData) setModules(modsData);

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
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Helper to render video player based on URL type
  const renderVideoPlayer = (url: string) => {
    if (!url) {
      return (
        <div className="w-full h-full bg-white flex items-center justify-center text-slate-400">
          No video URL provided
        </div>
      );
    }
    
    // Simple check for MP4 vs embed (YouTube/Vimeo/Cloudinary)
    const secureUrl = url.startsWith('http://') ? url.replace('http://', 'https://') : url;

    if (secureUrl.endsWith('.mp4')) {
      return <video src={secureUrl} controls className="w-full h-full object-cover" />;
    } else {
      // Assuming it's an embeddable iframe URL (like YouTube embed)
      return (
        <iframe 
          src={secureUrl} 
          className="w-full h-full" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowFullScreen
          loading="lazy"
        ></iframe>
      );
    }
  };

  const parentModule = modules.find(m => currentLesson?.module_id ? String(m.id) === String(currentLesson.module_id) : false);
  const requiresAssessment = currentLesson?.has_assignment || parentModule?.has_assessment;

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* Top Navigation Bar */}
      <header className="flex-shrink-0 h-16 border-b border-slate-200 bg-slate-50 flex items-center px-6 justify-between z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.location.href = `/dashboard/courses/${courseId}`} 
            className="text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Course
          </button>
          <div className="h-4 w-px bg-slate-200"></div>
          <span className="font-semibold text-slate-700 truncate max-w-sm">{course?.title}</span>
          {parentModule && (
            <>
              <div className="h-4 w-px bg-slate-200"></div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 truncate max-w-xs">
                {parentModule.title}
              </span>
            </>
          )}
        </div>
      </header>

      {/* Main Layout (70/30 Split) */}
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        
        {/* LEFT COLUMN: 70% Video, Notes & Assignment */}
        <div className="w-full lg:w-[70%] h-full overflow-y-auto flex flex-col border-r border-slate-200 scrollbar-hide bg-white">
          
          {/* Media / Study Banner Area */}
          <div className="w-full bg-slate-900 relative shadow-xl">
            {currentLesson ? (
              (!currentLesson.is_preview && !isEnrolled) ? (
                <div className="w-full aspect-video bg-slate-50 flex flex-col items-center justify-center p-8 text-center space-y-6 border-b border-slate-200">
                  <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-blue-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900">Enrollment Required</h2>
                    <p className="text-slate-600 max-w-md mx-auto">
                      This lesson is part of the premium curriculum track. Please enroll in the course to unlock full access to all materials, notes, and tasks.
                    </p>
                  </div>
                  <button 
                    onClick={() => window.location.href = `/dashboard/courses/${courseId}`}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                  >
                    Enroll Now to Unlock
                  </button>
                </div>
              ) : currentLesson.content_url ? (
                <div className="aspect-video w-full">
                  {renderVideoPlayer(currentLesson.content_url)}
                </div>
              ) : (
                <div className="py-12 px-8 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col items-center justify-center text-center space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white/10 rounded-full border border-white/20">
                    Interactive Text Module
                  </span>
                  <h3 className="text-2xl font-bold max-w-xl">{currentLesson.title}</h3>
                  <p className="text-xs text-white/70 max-w-md">Review the essential reading material and notes documented below for this session.</p>
                </div>
              )
            ) : (
               <div className="aspect-video w-full flex items-center justify-center text-slate-400">Lesson not found</div>
            )}
          </div>

          {/* Lesson Content, Text Notes & Assignment Area */}
          <div className="p-8 lg:p-12 max-w-4xl mx-auto w-full space-y-10 flex-1">
            
            {/* Title & Metadata Section */}
            <div className="space-y-4 border-b border-slate-100 pb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                  {currentLesson?.title}
                </h1>
                {isCompleted && (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 self-start">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    Completed
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {currentLesson?.notes && <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">📝 Contains Text Notes</span>}
                {requiresAssessment && <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">⚠️ Mandatory Assessment</span>}
              </div>
            </div>

            {/* Comprehensive Text Notes Rendering */}
            {currentLesson?.notes && (
              <div className="space-y-4 bg-slate-50/50 border border-slate-200/80 rounded-3xl p-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <span>📖 Session Study Material & Lecture Notes</span>
                </h3>
                <div className="prose prose-slate max-w-none text-slate-700 text-base leading-relaxed whitespace-pre-wrap font-normal">
                  {currentLesson.notes}
                </div>
              </div>
            )}

            {/* Assignment / Completion Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-900">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-blue-600">
                  {requiresAssessment ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                {requiresAssessment ? "Required Assessment Link" : "Confirm Completion"}
              </h2>
              
              <div className="space-y-6">
                {requiresAssessment && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Task Submission Link {parentModule?.has_assessment ? "(Module Assessment)" : "(Lesson Assessment)"}
                    </label>
                    <textarea 
                      value={assignmentUrl}
                      onChange={(e) => setAssignmentUrl(e.target.value)}
                      placeholder="Paste your accessible project output link (GitHub repository, deployed link, or Google Drive document)..."
                      className="w-full bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl p-4 text-slate-900 placeholder:text-slate-400 text-sm transition-all min-h-[100px] resize-y outline-none font-medium"
                    />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-200/60">
                  <p className="text-xs text-slate-500 max-w-xs leading-normal">
                    {requiresAssessment 
                      ? "Submitting your project link saves your output for mentor evaluation and credit validation."
                      : "Acknowledge that you have finished reading the text notes and watching the material."}
                  </p>
                  
                  <button 
                    onClick={handleCompleteLesson}
                    disabled={submitting || (requiresAssessment ? !assignmentUrl.trim() : false)} 
                    className={`px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 self-end sm:self-auto shrink-0 ${
                      isCompleted 
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20" 
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {submitting ? (
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : isCompleted ? (
                      requiresAssessment ? "Update Submitted Task" : "✓ Marked Completed"
                    ) : (
                      "Submit & Complete"
                    )}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: 30% Nested Syllabus Sidebar */}
        <div className="w-full lg:w-[30%] h-full bg-slate-50 border-t lg:border-t-0 overflow-y-auto flex flex-col">
          <div className="p-6 border-b border-slate-200 sticky top-0 bg-slate-50/95 backdrop-blur-md z-10 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Curriculum Structure</h2>
              <p className="text-xs text-slate-500 mt-0.5">{allLessons.length} Planned Sessions</p>
            </div>
          </div>
          
          <div className="p-4 space-y-6">
            {/* Group lessons by module */}
            {modules.map((mod) => {
              const modLessons = allLessons.filter(l => String(l.module_id) === String(mod.id)).sort((a,b) => (a.order_index || 0) - (b.order_index || 0));
              
              return (
                <div key={mod.id} className="space-y-2 font-sans">
                  <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-200/60 rounded-xl">
                    <span className="text-xs font-bold text-slate-700 truncate">{mod.title}</span>
                    {mod.has_assessment && <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Assessment</span>}
                  </div>
                  
                  <div className="space-y-1 pl-1">
                    {modLessons.length === 0 ? (
                      <div className="text-[11px] text-slate-400 italic px-2 py-1">No lessons added.</div>
                    ) : (
                      modLessons.map((lesson) => {
                        const isActive = lesson.id === lessonId;
                        
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => window.location.href = `/dashboard/courses/${courseId}/lessons/${lesson.id}`}
                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all group ${
                              isActive 
                                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold" 
                                : "hover:bg-slate-200/50 text-slate-700"
                            }`}
                          >
                            <div className="flex-1 min-w-0 pr-2">
                              <h4 className={`text-xs truncate ${isActive ? "text-white font-bold" : "text-slate-800 font-medium"}`}>
                                {lesson.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                {lesson.notes && <span className={`text-[9px] ${isActive ? "text-blue-100" : "text-slate-500"}`}>📝 Notes</span>}
                                {lesson.content_url && <span className={`text-[9px] ${isActive ? "text-blue-100" : "text-slate-500"}`}>🎥 Video</span>}
                                {lesson.has_assignment && <span className={`text-[9px] ${isActive ? "text-amber-200" : "text-amber-600 font-semibold"}`}>Task</span>}
                              </div>
                            </div>
                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0"></div>}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}

            {/* Legacy/Unassigned lessons */}
            {(() => {
              const unassigned = allLessons.filter(l => !l.module_id).sort((a,b) => (a.order_index || 0) - (b.order_index || 0));
              if (unassigned.length === 0) return null;
              
              return (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="px-2.5 py-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">General Curriculum</span>
                  </div>
                  <div className="space-y-1 pl-1">
                    {unassigned.map((lesson) => {
                      const isActive = lesson.id === lessonId;
                      
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => window.location.href = `/dashboard/courses/${courseId}/lessons/${lesson.id}`}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all group ${
                            isActive 
                              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold" 
                              : "hover:bg-slate-200/50 text-slate-700"
                          }`}
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <h4 className={`text-xs truncate ${isActive ? "text-white font-bold" : "text-slate-800 font-medium"}`}>
                              {lesson.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              {lesson.notes && <span className={`text-[9px] ${isActive ? "text-blue-100" : "text-slate-500"}`}>📝 Notes</span>}
                              {lesson.content_url && <span className={`text-[9px] ${isActive ? "text-blue-100" : "text-slate-500"}`}>🎥 Video</span>}
                              {lesson.has_assignment && <span className={`text-[9px] ${isActive ? "text-amber-200" : "text-amber-600 font-semibold"}`}>Task</span>}
                            </div>
                          </div>
                          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0"></div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {modules.length === 0 && allLessons.filter(l => !l.module_id).length === 0 && (
              <div className="text-xs text-slate-400 italic text-center py-6">No session entries mapped.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
