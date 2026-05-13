"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Script from "next/script";
import { EnrollmentModal } from "@/components/EnrollmentModal";
import { 
  Play, 
  CheckCircle2, 
  Circle, 
  ArrowLeft, 
  ShieldCheck, 
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Lesson {
  id: string;
  title: string;
  content_url?: string;
  notes?: string;
  module_id?: string;
  is_preview?: boolean;
  order_index?: number;
  has_assignment?: boolean;
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params?.courseId as string;
  
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Lesson progress tracking state
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [progressRecords, setProgressRecords] = useState<any[]>([]);
  const [assignmentUrl, setAssignmentUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/login";
        return;
      }
      setSessionUser(session.user);

      const [courseRes, lessonRes, allEnrollsRes, moduleRes, progRes, profileRes] = await Promise.all([
        supabase.from("courses").select("*, departments(name)").eq("id", courseId).single(),
        supabase.from("lessons").select("*").eq("course_id", courseId).order("order_index", { ascending: true }),
        supabase.from("enrollments").select("*").eq("student_id", session.user.id),
        supabase.from("course_modules").select("*").eq("course_id", courseId).order("order_index", { ascending: true }),
        supabase.from("user_progress").select("*").eq("user_id", session.user.id).eq("course_id", courseId),
        supabase.from("profiles").select("full_name").eq("id", session.user.id).maybeSingle()
      ]);
        
      if (courseRes.data) setCourse(courseRes.data);
      if (moduleRes?.data) setModules(moduleRes.data);
      if (profileRes?.data) setProfile(profileRes.data);

      if (progRes?.data) {
        setProgressRecords(progRes.data);
        setCompletedLessonIds(progRes.data.map((p: any) => p.lesson_id));
      }

      let loadedLessons: Lesson[] = [];
      if (lessonRes.data && lessonRes.data.length > 0) {
        loadedLessons = lessonRes.data;
        setLessons(loadedLessons);
        setCurrentLesson(loadedLessons[0]);
      } else {
        // Fallback placeholder lesson data if empty
        loadedLessons = [
          { id: "1", title: "Module 1: Introduction & Fundamentals", is_preview: true, notes: "Welcome to the official study material notes workspace." }
        ];
        setLessons(loadedLessons);
        setCurrentLesson(loadedLessons[0]);
      }
      
      const hasPaid = allEnrollsRes.data?.some(e => String(e.course_id) === String(courseId) && (e.payment_status === "completed" || e.payment_status === "success"));
      
      if (hasPaid) {
        setIsEnrolled(true);
      }
      
      setLoading(false);
    };

    fetchCourseData();
  }, [courseId]);

  // Synchronize assignment submission input state whenever currentLesson or loaded progression records swap
  useEffect(() => {
    if (!currentLesson) return;
    const rec = progressRecords.find(p => String(p.lesson_id) === String(currentLesson.id));
    setAssignmentUrl(rec?.assignment_url || "");
  }, [currentLesson, progressRecords]);

  // Automatically sequence open module accordion state based on current lesson progression
  useEffect(() => {
    if (currentLesson?.module_id) {
      setOpenModuleId(currentLesson.module_id);
    } else if (currentLesson && !currentLesson.module_id) {
      setOpenModuleId("general");
    }
  }, [currentLesson]);

  const toggleModule = (modId: string) => {
    setOpenModuleId(prev => prev === modId ? null : modId);
  };

  const handleCompleteLesson = async (lessonToComplete?: Lesson | null) => {
    const targetLesson = lessonToComplete || currentLesson;
    if (!sessionUser || !targetLesson) return;
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("user_progress")
        .upsert({
          user_id: sessionUser.id,
          lesson_id: targetLesson.id,
          course_id: courseId,
          assignment_url: assignmentUrl || null,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id, lesson_id'
        });

      if (error) {
        console.error("Progress upsert error:", error);
      } else {
        if (!completedLessonIds.includes(targetLesson.id)) {
          setCompletedLessonIds(prev => [...prev, targetLesson.id]);
        }
        setProgressRecords(prev => {
          const filtered = prev.filter(p => String(p.lesson_id) !== String(targetLesson.id));
          return [...filtered, { lesson_id: targetLesson.id, assignment_url: assignmentUrl || null }];
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayNow = async () => {
    setEnrollLoading(true);
    try {
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      const options = {
        key: razorpayKey,
        amount: 50000,
        currency: "INR",
        name: "Matrix Root",
        description: `Enrollment: ${course?.title}`,
        retry: { enabled: false },
        timeout: 60,
        handler: async function (response: any) {
          try {
            const { data: existing } = await supabase
              .from('enrollments')
              .select('id')
              .eq('student_id', sessionUser?.id)
              .eq('course_id', courseId)
              .maybeSingle();

            let dbError;
            if (existing) {
              const { error } = await supabase
                .from('enrollments')
                .update({
                  payment_status: 'completed',
                  payment_id: response.razorpay_payment_id,
                  enrolled_at: new Date().toISOString()
                })
                .eq('id', existing.id);
              dbError = error;
            } else {
              const { error } = await supabase
                .from('enrollments')
                .insert({
                  student_id: sessionUser?.id,
                  course_id: courseId,
                  payment_status: 'completed',
                  payment_id: response.razorpay_payment_id,
                  enrolled_at: new Date().toISOString()
                });
              dbError = error;
            }
            
            if (dbError) throw dbError;
            
            alert("Enrollment Success!");
            setIsEnrolled(true);
            setShowPayment(false);
            setEnrollLoading(false);
          } catch (handlerErr: any) {
            console.error("Enrollment status confirmation error:", handlerErr);
            alert(`Payment database mapping sync failed: ${handlerErr.message || "Unknown Error"}. Please contact administrators.`);
            setEnrollLoading(false);
          }
        },
        prefill: {
          name: profile?.full_name || "",
          email: sessionUser?.email || "",
          contact: ""
        },
        notes: {
          course_id: courseId,
          student_id: sessionUser?.id
        },
        theme: { color: "#2563eb" },
        modal: { 
          ondismiss: () => setEnrollLoading(false),
          escape: true
        }
      };

      if (!razorpayKey || !window.Razorpay) {
        alert("Payment gateway communication link offline. Try re-opening momentarily.");
        setEnrollLoading(false);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert(`Transaction declined: ${response.error.description}`);
        setEnrollLoading(false);
      });
      rzp.open();
    } catch (err) {
      setEnrollLoading(false);
    }
  };

  const renderVideoPlayer = (url: string) => {
    if (!url) return null;
    const secureUrl = url.startsWith('http://') ? url.replace('http://', 'https://') : url;
    if (secureUrl.endsWith('.mp4')) {
      return <video src={secureUrl} controls className="w-full h-full object-cover rounded-2xl" />;
    } else {
      return (
        <iframe 
          src={secureUrl} 
          className="w-full h-full rounded-2xl border-0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
          loading="lazy"
        ></iframe>
      );
    }
  };

  const sortedLessons = [...lessons].sort((a,b) => (a.order_index || 0) - (b.order_index || 0));
  const currentIndex = sortedLessons.findIndex(l => l.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;

  const parentModule = modules.find(m => currentLesson?.module_id ? String(m.id) === String(currentLesson.module_id) : false);
  const requiresAssessment = currentLesson?.has_assignment || parentModule?.has_assessment;
  const isCurrentLessonCompleted = currentLesson ? completedLessonIds.includes(currentLesson.id) : false;

  const renderSyllabus = () => (
    <div className="bg-card text-card-foreground border border-border rounded-3xl p-6 shadow-sm space-y-6 font-sans">
      <div className="border-b border-border pb-4 flex items-center justify-between font-sans">
        <div className="font-sans">
          <h2 className="text-base font-bold text-foreground font-sans">Curriculum Structure</h2>
          <p className="text-xs text-muted-foreground mt-0.5 font-sans">{lessons.length} Planned Sessions</p>
        </div>
        {!isEnrolled && (
          <Button size="sm" onClick={() => setShowPayment(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl h-8 font-sans">
            Enroll Track
          </Button>
        )}
      </div>
      
      <div className="space-y-4 font-sans">
        {modules.map((mod) => {
          const modLessons = sortedLessons.filter(l => String(l.module_id) === String(mod.id));
          const isOpen = String(openModuleId) === String(mod.id);
          
          return (
            <div key={mod.id} className="space-y-1.5 font-sans border-b border-border/40 pb-3 last:border-0">
              {/* Module Dropdown Trigger Header */}
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-accent hover:bg-accent/80 text-accent-foreground rounded-xl transition-all font-sans text-left group"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2 font-sans">
                  <span className="text-xs font-bold truncate font-sans">{mod.title}</span>
                  {mod.has_assessment && <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 shrink-0 font-sans">Assessment</span>}
                </div>
                <div className="shrink-0 transition-transform duration-200 font-sans" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </button>
              
              {/* Collapsible Dropdown Lessons Container */}
              {isOpen && (
                <div className="space-y-1 pl-1.5 pt-1 font-sans animate-in fade-in-50 duration-200">
                  {modLessons.length === 0 ? (
                    <div className="text-[11px] text-muted-foreground italic px-2 py-1 font-sans">No lessons added.</div>
                  ) : (
                    modLessons.map((lesson) => {
                      const isActive = currentLesson?.id === lesson.id;
                      const isLocked = !isEnrolled && !lesson.is_preview;
                      const isDone = completedLessonIds.includes(lesson.id);
                      
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            if (!isLocked) {
                              setCurrentLesson(lesson);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          }}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all group font-sans ${
                            isActive 
                              ? "bg-primary text-primary-foreground shadow-md font-semibold" 
                              : isLocked 
                              ? "opacity-50 cursor-not-allowed hover:bg-transparent text-muted-foreground" 
                              : "hover:bg-accent/50 text-foreground font-medium"
                          }`}
                        >
                          <div className="shrink-0 font-sans">
                            {isLocked ? (
                              <ShieldCheck size={14} className={isActive ? "text-primary-foreground font-sans" : "text-muted-foreground font-sans"} />
                            ) : isDone ? (
                              <CheckCircle2 size={14} className={isActive ? "text-primary-foreground font-sans" : "text-emerald-500 font-sans"} />
                            ) : isActive ? (
                              <Play size={14} className="text-primary-foreground fill-current font-sans" />
                            ) : (
                              <Circle size={14} className="text-muted-foreground/50 font-sans" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 pr-2 font-sans">
                            <h4 className={`text-xs truncate font-sans ${isActive ? "text-primary-foreground font-bold" : "text-foreground"}`}>
                              {lesson.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5 font-sans">
                              {lesson.notes && <span className={`text-[9px] font-sans ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>📝 Notes</span>}
                              {lesson.content_url && <span className={`text-[9px] font-sans ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>🎥 Video</span>}
                              {lesson.is_preview && <span className={`text-[9px] font-black font-sans ${isActive ? "text-primary-foreground" : "text-sky-400"}`}>Preview</span>}
                              {(lesson.has_assignment || mod.has_assessment) && <span className={`text-[9px] font-sans ${isActive ? "text-primary-foreground font-bold" : "text-amber-500 font-semibold"}`}>Task</span>}
                            </div>
                          </div>
                          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground shrink-0 font-sans"></div>}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Unassigned lessons fallback accordion visibility container */}
        {(() => {
          const unassigned = sortedLessons.filter(l => !l.module_id || !modules.some(m => String(m.id) === String(l.module_id)));
          if (unassigned.length === 0) return null;
          const isOpen = openModuleId === "general";
          
          return (
            <div className="space-y-1.5 pt-2 border-t border-border font-sans">
              <button
                onClick={() => setOpenModuleId(prev => prev === "general" ? null : "general")}
                className="w-full flex items-center justify-between px-3 py-2 bg-accent/40 hover:bg-accent/60 text-muted-foreground rounded-xl transition-all font-sans text-left"
              >
                <span className="text-[10px] font-black uppercase tracking-wider font-sans">General Curriculum</span>
                <div className="shrink-0 transition-transform duration-200 font-sans" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </button>

              {isOpen && (
                <div className="space-y-1 pl-1.5 pt-1 font-sans animate-in fade-in-50 duration-200">
                  {unassigned.map((lesson) => {
                    const isActive = currentLesson?.id === lesson.id;
                    const isLocked = !isEnrolled && !lesson.is_preview;
                    const isDone = completedLessonIds.includes(lesson.id);
                    
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          if (!isLocked) {
                            setCurrentLesson(lesson);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all group font-sans ${
                          isActive 
                            ? "bg-primary text-primary-foreground shadow-md font-semibold" 
                            : isLocked 
                            ? "opacity-50 cursor-not-allowed hover:bg-transparent text-muted-foreground" 
                            : "hover:bg-accent/50 text-foreground font-medium"
                        }`}
                      >
                        <div className="shrink-0 font-sans">
                          {isLocked ? (
                            <ShieldCheck size={14} className={isActive ? "text-primary-foreground font-sans" : "text-muted-foreground font-sans"} />
                          ) : isDone ? (
                            <CheckCircle2 size={14} className={isActive ? "text-primary-foreground font-sans" : "text-emerald-500 font-sans"} />
                          ) : isActive ? (
                            <Play size={14} className="text-primary-foreground fill-current font-sans" />
                          ) : (
                            <Circle size={14} className="text-muted-foreground/50 font-sans" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 pr-2 font-sans">
                          <h4 className={`text-xs truncate font-sans ${isActive ? "text-primary-foreground font-bold" : "text-foreground"}`}>
                            {lesson.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 font-sans">
                            {lesson.notes && <span className={`text-[9px] font-sans ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>📝 Notes</span>}
                            {lesson.content_url && <span className={`text-[9px] font-sans ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>🎥 Video</span>}
                            {lesson.is_preview && <span className={`text-[9px] font-black font-sans ${isActive ? "text-primary-foreground" : "text-sky-400"}`}>Preview</span>}
                            {lesson.has_assignment && <span className={`text-[9px] font-sans ${isActive ? "text-primary-foreground font-bold" : "text-amber-500 font-semibold"}`}>Task</span>}
                          </div>
                        </div>
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground shrink-0 font-sans"></div>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {lessons.length === 0 && (
          <div className="text-xs text-muted-foreground italic text-center py-6 font-sans">No session entries mapped.</div>
        )}
      </div>
    </div>
  );

  const renderNotesAndAssessment = () => (
    <div className="space-y-8 font-sans">
      {/* Title & Metadata Section */}
      <div className="space-y-3 border-b border-border pb-5 font-sans">
        <div className="flex flex-wrap items-center justify-between gap-4 font-sans">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight font-sans">
            {currentLesson?.title}
          </h1>
          {isCurrentLessonCompleted && (
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 self-start font-sans">
              <CheckCircle2 size={14} className="font-sans" />
              Completed
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5 font-sans">
          {currentLesson?.notes && <span className="text-xs font-semibold bg-accent text-accent-foreground px-2.5 py-0.5 rounded font-sans">📝 Text Notes Included</span>}
          {requiresAssessment && <span className="text-xs font-semibold bg-amber-500/10 text-amber-500 px-2.5 py-0.5 rounded border border-amber-500/20 font-sans">⚠️ Mandatory Assessment Link Required</span>}
        </div>
      </div>

      {/* Comprehensive Text Notes Rendering with Absolute Document Hardcoded Inline Overrides */}
      {currentLesson?.notes ? (
        <div className="space-y-4 border border-border rounded-none p-8 md:p-12 shadow-md max-w-none font-sans" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
          <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b border-slate-200 pb-3 font-sans" style={{ color: '#64748b' }}>
            <span>📄 Official Document & Lecture Notes</span>
          </h3>
          <div className="font-serif text-base md:text-lg leading-relaxed whitespace-pre-wrap selection:bg-blue-100 block font-normal font-serif" style={{ color: '#000000' }}>
            {currentLesson.notes}
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground italic py-4 font-sans">No companion text notes provided for this lesson.</div>
      )}

      {/* Assignment / Assessment Submission Section */}
      {requiresAssessment && (
        <div className="bg-card text-card-foreground border border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-6 font-sans">
          <h2 className="text-lg font-bold flex items-center gap-2.5 text-foreground border-b border-border pb-3 font-sans">
            <Award className="w-5 h-5 text-primary shrink-0 font-sans" />
            Required Assessment Submission
          </h2>
          
          <div className="space-y-5 font-sans">
            <div className="space-y-2 font-sans">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block font-sans">
                Task Submission Link {parentModule?.has_assessment ? "(Module Assessment)" : "(Lesson Assessment)"}
              </label>
              <textarea 
                value={assignmentUrl}
                onChange={(e) => setAssignmentUrl(e.target.value)}
                placeholder="Paste your accessible project output link (GitHub repository, deployed link, or Google Drive document)..."
                className="w-full bg-background border border-border hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-3.5 text-foreground placeholder:text-muted-foreground text-sm transition-all min-h-[90px] resize-y outline-none font-medium font-sans"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 font-sans">
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed font-sans">
                Submitting your project link saves your output for mentor evaluation and credit validation.
              </p>
              
              <button 
                onClick={() => handleCompleteLesson()}
                disabled={submitting || !assignmentUrl.trim()} 
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 self-end sm:self-auto shrink-0 font-sans ${
                  isCurrentLessonCompleted 
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md" 
                    : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md active:scale-[0.98]"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {submitting ? (
                  <span className="font-sans">Saving...</span>
                ) : isCurrentLessonCompleted ? (
                  <span className="font-sans">Update Submitted Task</span>
                ) : (
                  <span className="font-sans">Submit Assessment</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Lesson Cycling & Navigation Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-border font-sans">
        {prevLesson ? (
          <button
            onClick={() => {
              setCurrentLesson(prevLesson);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-5 py-3 bg-card hover:bg-accent text-foreground border border-border font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs font-sans"
          >
            <ArrowLeft size={14} className="font-sans" />
            <span className="truncate max-w-[180px] font-sans">Prev: {prevLesson.title}</span>
          </button>
        ) : <div />}

        {nextLesson ? (
          <button
            onClick={async () => {
              if (!requiresAssessment && !isCurrentLessonCompleted) {
                await handleCompleteLesson(currentLesson);
              }
              setCurrentLesson(nextLesson);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98] font-sans"
          >
            <span className="truncate max-w-[180px] font-sans">Next: {nextLesson.title}</span>
            <Play size={10} className="fill-current font-sans" />
          </button>
        ) : (
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md font-sans"
          >
            <CheckCircle2 size={14} className="font-sans" />
            Finish Course Track
          </button>
        )}
      </div>
    </div>
  );

  const hasVideo = !!currentLesson?.content_url;
  const isLocked = !isEnrolled && !currentLesson?.is_preview;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans overflow-hidden font-sans">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      
      {/* Top Navigation Bar */}
      <header className="flex-shrink-0 h-16 border-b border-border bg-card flex items-center px-6 justify-between z-10 shadow-xs font-sans">
        <div className="flex items-center gap-4 font-sans">
          <Button variant="ghost" size="icon" onClick={() => window.location.href = '/dashboard'} className="rounded-xl hover:bg-accent text-foreground font-sans">
            <ArrowLeft size={20} className="font-sans" />
          </Button>
          <div className="hidden sm:block h-4 w-px bg-border mx-2 font-sans" />
          <h1 className="text-sm font-bold text-foreground truncate max-w-[250px] md:max-w-none font-sans">
            {course?.title || "Course Player Studio"}
          </h1>
          {parentModule && (
            <>
              <div className="hidden sm:block h-4 w-px bg-border mx-2 font-sans" />
              <span className="hidden md:inline-flex text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20 truncate max-w-xs font-sans">
                {parentModule.title}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4 font-sans">
           <div className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-sans">
             <ShieldCheck size={14} className="text-primary font-sans" />
             Industrial Track
           </div>
           <Button size="sm" variant="outline" className="rounded-full px-4 h-9 border-border text-foreground font-bold text-xs font-sans">
              Resources
           </Button>
        </div>
      </header>

      {/* Main Studio Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-[1600px] w-full mx-auto font-sans">
        {!currentLesson ? (
          <div className="py-20 text-center text-muted-foreground font-sans">Loading lesson studio workspace...</div>
        ) : hasVideo ? (
          /* SCENARIO A: Has Video */
          <div className="grid lg:grid-cols-12 gap-8 items-start font-sans">
            
            {/* Left Side: Video + Syllabus Below */}
            <div className="lg:col-span-5 xl:col-span-5 space-y-6 font-sans">
              <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-md border border-border font-sans">
                {isLocked ? (
                  <div className="w-full h-full bg-card flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 font-sans">
                      <ShieldCheck size={24} className="text-primary font-sans" />
                    </div>
                    <div className="font-sans">
                      <h3 className="text-base font-bold text-foreground font-sans">Enrollment Required</h3>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1 font-sans">Unlock all modules and study tasks instantly.</p>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => setShowPayment(true)}
                      className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-xs font-sans"
                    >
                      Enroll to Unlock
                    </Button>
                  </div>
                ) : (
                  renderVideoPlayer(currentLesson.content_url || "")
                )}
              </div>

              {renderSyllabus()}
            </div>

            {/* Right Side: Lesson Notes & Tasks */}
            <div className="lg:col-span-7 xl:col-span-7 font-sans">
              {isLocked ? (
                <div className="bg-card text-card-foreground border border-border rounded-3xl p-12 text-center space-y-4 font-sans">
                  <h3 className="text-lg font-bold text-foreground font-sans">{currentLesson.title}</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto font-sans">
                    This lesson contains comprehensive material, practical code notes, and evaluated assessments available to enrolled interns.
                  </p>
                  <Button onClick={() => setShowPayment(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl font-sans">
                    Unlock Course Track
                  </Button>
                </div>
              ) : (
                renderNotesAndAssessment()
              )}
            </div>

          </div>
        ) : (
          /* SCENARIO B: No Video */
          <div className="max-w-4xl mx-auto space-y-10 font-sans">
            {isLocked ? (
              <div className="bg-card text-card-foreground border border-border rounded-3xl p-12 text-center space-y-4 font-sans">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 mx-auto font-sans">
                  <ShieldCheck size={24} className="text-primary font-sans" />
                </div>
                <h3 className="text-lg font-bold text-foreground font-sans">Premium Lesson Content Locked</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto font-sans">
                  Complete your program enrollment to access official lecture notes and task evaluations.
                </p>
                <Button onClick={() => setShowPayment(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl font-sans">
                  Enroll Now
                </Button>
              </div>
            ) : (
              renderNotesAndAssessment()
            )}

            <div className="pt-2 border-t border-border font-sans">
              {renderSyllabus()}
            </div>
          </div>
        )}
      </div>

      {/* Enrollment Modal Integration */}
      <EnrollmentModal 
        open={showPayment} 
        onOpenChange={setShowPayment}
        courseTitle={course?.title || "Program"}
        onPay={handlePayNow}
        loading={enrollLoading}
      />
    </div>
  );
}
