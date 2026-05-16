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

      // 4. Check Enrollment Status robustly using client-side String matching
      const { data: allEnrolls } = await supabase
        .from("enrollments")
        .select("*")
        .eq("student_id", session.user.id);

      if (allEnrolls && allEnrolls.some(e => String(e.course_id) === String(courseId) && (e.payment_status === "completed" || e.payment_status === "success"))) {
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
    let secureUrl = url.startsWith('http://') ? url.replace('http://', 'https://') : url;

    // Automatically convert standard YouTube URLs to Embed format
    if (secureUrl.includes("youtube.com/") || secureUrl.includes("youtu.be/")) {
      let videoId = "";
      if (secureUrl.includes("youtu.be/")) {
        videoId = secureUrl.split("youtu.be/")[1]?.split(/[?#]/)[0]?.split("/")[0];
      } else if (secureUrl.includes("youtube.com/watch")) {
        const match = secureUrl.match(/[?&]v=([^&#]+)/);
        if (match) videoId = match[1];
      } else if (secureUrl.includes("youtube.com/shorts/")) {
        videoId = secureUrl.split("youtube.com/shorts/")[1]?.split(/[?#]/)[0]?.split("/")[0];
      }
      if (videoId) {
        secureUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    }

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

  // Reusable component block for the Syllabus/Modules outline
  const renderSyllabus = () => (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 font-sans">
      <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Curriculum Structure</h2>
          <p className="text-xs text-slate-500 mt-0.5">{allLessons.length} Planned Sessions</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Group lessons by module */}
        {modules.map((mod) => {
          const modLessons = allLessons.filter(l => String(l.module_id) === String(mod.id)).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

          return (
            <div key={mod.id} className="space-y-2">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-100 rounded-xl">
                <span className="text-xs font-bold text-slate-700 truncate">{mod.title}</span>
                {mod.has_assessment && <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Assessment</span>}
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
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all group ${isActive
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold"
                            : "hover:bg-slate-50 text-slate-700"
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
          const unassigned = allLessons.filter(l => !l.module_id || !modules.some(m => String(m.id) === String(l.module_id))).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
          if (unassigned.length === 0) return null;

          return (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="px-3 py-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">General Curriculum</span>
              </div>
              <div className="space-y-1 pl-1">
                {unassigned.map((lesson) => {
                  const isActive = lesson.id === lessonId;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => window.location.href = `/dashboard/courses/${courseId}/lessons/${lesson.id}`}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all group ${isActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold"
                          : "hover:bg-slate-50 text-slate-700"
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

        {allLessons.length === 0 && (
          <div className="text-xs text-slate-400 italic text-center py-6">No session entries mapped.</div>
        )}
      </div>
    </div>
  );

  // Reusable component block for Lesson Notes & Assessment Submission
  const renderNotesAndAssessment = () => {
    // Find neighbors for next/previous navigation buttons
    const sortedLessons = [...allLessons].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    const currentIndex = sortedLessons.findIndex(l => l.id === lessonId);
    const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;

    return (
      <div className="space-y-8 font-sans">
        {/* Title & Metadata Section */}
        <div className="space-y-3 border-b border-slate-200 pb-5 font-sans">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              {currentLesson?.title}
            </h1>
            {isCompleted && (
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 self-start">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                Completed
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {currentLesson?.notes && <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">📝 Text Notes Included</span>}
            {requiresAssessment && <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">⚠️ Mandatory Assessment Link Required</span>}
          </div>
        </div>

        {/* Comprehensive Text Notes Rendering */}
        {currentLesson?.notes ? (
          <div className="space-y-4 border border-slate-300 rounded-none p-8 md:p-12 shadow-md max-w-none" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b border-slate-200 pb-3 font-sans" style={{ color: '#64748b' }}>
              <span>📄 Official Document & Lecture Notes</span>
            </h3>
            <div className="font-serif text-base md:text-lg leading-relaxed whitespace-pre-wrap selection:bg-blue-100 block font-normal" style={{ color: '#000000' }}>
              {currentLesson.notes}
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-400 italic py-4">No companion text notes provided for this lesson.</div>
        )}

        {/* Assignment / Assessment Submission Section (Exclusively rendered if required) */}
        {requiresAssessment && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 font-sans">
            <h2 className="text-lg font-bold flex items-center gap-2.5 text-slate-900 border-b border-slate-100 pb-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-blue-600 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12" />
              </svg>
              Required Assessment Submission
            </h2>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Task Submission Link {parentModule?.has_assessment ? "(Module Assessment)" : "(Lesson Assessment)"}
                </label>
                <textarea
                  value={assignmentUrl}
                  onChange={(e) => setAssignmentUrl(e.target.value)}
                  placeholder="Paste your accessible project output link (GitHub repository, deployed link, or Google Drive document)..."
                  className="w-full bg-slate-50 border border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl p-3.5 text-slate-900 placeholder:text-slate-400 text-sm transition-all min-h-[90px] resize-y outline-none font-medium"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Submitting your project link saves your output for mentor evaluation and credit validation.
                </p>

                <button
                  onClick={handleCompleteLesson}
                  disabled={submitting || !assignmentUrl.trim()}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 self-end sm:self-auto shrink-0 ${isCompleted
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 active:scale-[0.98]"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {submitting ? (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : isCompleted ? (
                    "Update Submitted Task"
                  ) : (
                    "Submit Assessment"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dedicated Lesson Cycling & Navigation Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-slate-200 font-sans">
          {prevLesson ? (
            <button
              onClick={() => window.location.href = `/dashboard/courses/${courseId}/lessons/${prevLesson.id}`}
              className="px-5 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              <span className="truncate max-w-[180px]">Prev: {prevLesson.title}</span>
            </button>
          ) : <div />}

          {nextLesson ? (
            <button
              onClick={async () => {
                // Automatically register lesson background completion if no manual task assessment is bound
                if (!requiresAssessment && !isCompleted) {
                  await handleCompleteLesson();
                }
                window.location.href = `/dashboard/courses/${courseId}/lessons/${nextLesson.id}`;
              }}
              className="px-8 py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
            >
              <span className="truncate max-w-[180px]">Next: {nextLesson.title}</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => window.location.href = `/dashboard/courses/${courseId}`}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
            >
              Finish Course Track
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  };

  const hasVideo = !!currentLesson?.content_url;

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">

      {/* Top Navigation Bar */}
      <header className="flex-shrink-0 h-16 border-b border-slate-200 bg-white flex items-center px-6 justify-between z-10 shadow-xs">
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

      {/* Main Content Area */}
      <div className="flex-1 lg:overflow-hidden p-6 md:p-10 max-w-[1600px] w-full mx-auto overflow-y-auto">
        {!currentLesson ? (
          <div className="py-20 text-center text-slate-400">Lesson not found</div>
        ) : hasVideo ? (
          /* SCENARIO A: Has Video */
          /* Video on Left (Reduced size), Course Modules below Video, Notes on Right side */
          <div className="grid lg:grid-cols-12 gap-8 items-start lg:h-full">

            {/* Left Side: Video + Modules Below */}
            <div className="lg:col-span-5 xl:col-span-5 flex flex-col lg:h-full space-y-6 min-h-0">
              {/* Reduced size Video Container */}
              <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-md border border-slate-200/80">
                {(!currentLesson.is_preview && !isEnrolled) ? (
                  <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-blue-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Enrollment Required</h3>
                      <p className="text-xs text-slate-600 max-w-xs mx-auto mt-1">Unlock premium course content to watch.</p>
                    </div>
                    <button
                      onClick={() => window.location.href = `/dashboard/courses/${courseId}`}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all shadow-sm"
                    >
                      Enroll Now
                    </button>
                  </div>
                ) : (
                  renderVideoPlayer(currentLesson.content_url)
                )}
              </div>

              {/* Course Modules and Lessons below Video */}
              <div className="lg:flex-1 lg:overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {renderSyllabus()}
              </div>
            </div>

            {/* Right Side: Lesson Notes */}
            <div className="lg:col-span-7 xl:col-span-7 lg:h-full lg:overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pb-20 min-h-0">
              {renderNotesAndAssessment()}
            </div>

          </div>
        ) : (
          /* SCENARIO B: No Video */
          /* Only Document/Notes on Top, under that Modules and Lessons */
          <div className="max-w-4xl mx-auto space-y-10 lg:h-full lg:overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pb-20">
            {/* Notes & Submission Block on Top */}
            {renderNotesAndAssessment()}

            {/* Modules and Lessons Below */}
            <div className="pt-2 border-t border-slate-200">
              {renderSyllabus()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
