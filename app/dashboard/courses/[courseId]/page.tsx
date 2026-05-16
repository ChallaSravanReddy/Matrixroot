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
  Award,
  ChevronRight,
  BookOpen,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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

  // Custom video playback overlay state to conceal YouTube defaults
  const [isPlaying, setIsPlaying] = useState(false);

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
    // Reset custom video overlay layer for target lesson stream
    setIsPlaying(false);
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

  const cleanPhone = (p: string) => {
    if (!p) return "";
    return p.replace(/\D/g, '').slice(-10);
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
        timeout: 600,
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

            alert("Enrollment Successful! Access Unlocked.");
            setIsEnrolled(true);
            setShowPayment(false);
            setEnrollLoading(false);
          } catch (handlerErr: any) {
            console.error("Enrollment status confirmation error:", handlerErr);
            alert(`Payment database sync failed: ${handlerErr.message || "Unknown Error"}. Please contact administrators.`);
            setEnrollLoading(false);
          }
        },
        prefill: {
          name: profile?.full_name || "",
          email: sessionUser?.email || "",
          contact: cleanPhone(profile?.phone || "")
        },
        notes: {
          course_id: courseId,
          student_id: sessionUser?.id
        },
        config: {
          display: {
            preferences: {
              show_default_blocks: true
            }
          }
        },
        theme: { color: "#8B4513" },
        modal: {
          ondismiss: () => setEnrollLoading(false),
          escape: true
        }
      };

      if (!razorpayKey || !(window as any).Razorpay) {
        alert("Payment gateway offline. Retrying secure communication setup.");
        setEnrollLoading(false);
        return;
      }

      const rzp = new (window as any).Razorpay(options);
      setShowPayment(false);
      rzp.open();
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

    // Embed URL parsing to attach custom layout parameters hiding distractions
    if (secureUrl.includes("youtube.com/embed/")) {
      const separator = secureUrl.includes("?") ? "&" : "?";
      secureUrl += `${separator}modestbranding=1&rel=0&showinfo=0&controls=1&disablekb=1`;
      if (isPlaying) {
        secureUrl += `&autoplay=1`;
      }
    }

    if (secureUrl.endsWith('.mp4')) {
      return <video src={secureUrl} controls className="w-full h-full object-cover absolute inset-0" />;
    } else {
      return (
        <iframe
          src={secureUrl}
          className="w-full h-full border-0 absolute inset-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        ></iframe>
      );
    }
  };

  const sortedLessons = [...lessons].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  const currentIndex = sortedLessons.findIndex(l => l.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;

  const parentModule = modules.find(m => currentLesson?.module_id ? String(m.id) === String(currentLesson.module_id) : false);
  const requiresAssessment = currentLesson?.has_assignment || parentModule?.has_assessment;
  const isCurrentLessonCompleted = currentLesson ? completedLessonIds.includes(currentLesson.id) : false;

  const renderSyllabus = () => (
    <div className="bg-white border border-[#8B4513]/20 rounded-[12px] p-[24px] shadow-none space-y-[24px]">
      <div className="border-b border-[#8B4513]/10 pb-[16px] flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#3D2B1F]">Course Modules & Syllabus</h2>
          <p className="text-xs text-[#3D2B1F]/60 mt-0.5 font-medium">{lessons.length} Learning Sessions</p>
        </div>
        {!isEnrolled && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
            <Button size="sm" onClick={() => setShowPayment(true)} className="bg-[#D2B48C] hover:bg-[#C1A37B] text-[#3D2B1F] text-xs font-bold rounded-[8px] h-8 shadow-none">
              Enroll Track
            </Button>
          </motion.div>
        )}
      </div>

      <div className="space-y-[16px]">
        {modules.map((mod) => {
          const modLessons = sortedLessons.filter(l => String(l.module_id) === String(mod.id));
          const isOpen = String(openModuleId) === String(mod.id);

          return (
            <div key={mod.id} className="space-y-[8px] border-b border-[#8B4513]/5 pb-3 last:border-0">
              {/* Module Dropdown Trigger Header */}
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-[#F9F5F0]/60 hover:bg-[#F9F5F0] text-[#3D2B1F] rounded-[8px] transition-colors text-left group border border-[#8B4513]/5"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="text-xs font-bold text-[#3D2B1F] truncate">{mod.title}</span>
                  {mod.has_assessment && <span className="text-[9px] font-bold text-[#8B4513] bg-[#8B4513]/5 px-2 py-0.2 rounded-[4px] border border-[#8B4513]/10 shrink-0">Assignment</span>}
                </div>
                <div className="shrink-0 transition-transform duration-200 text-[#8B4513]" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                  <ChevronRight size={14} />
                </div>
              </button>

              {/* Collapsible Dropdown Lessons Container */}
              {isOpen && (
                <div className="space-y-1 pl-2 pt-1 border-l border-[#8B4513]/10 ml-2 animate-in fade-in-50 duration-200">
                  {modLessons.length === 0 ? (
                    <div className="text-[10px] text-[#3D2B1F]/40 italic px-2 py-1">Lessons pending upload.</div>
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
                          className={`w-full flex items-center gap-2.5 p-2 rounded-[6px] text-left transition-colors group ${isActive
                              ? "bg-[#8B4513]/5 text-[#8B4513] font-bold border border-[#8B4513]/10"
                              : isLocked
                                ? "opacity-40 cursor-not-allowed text-[#3D2B1F]/50"
                                : "hover:bg-white text-[#3D2B1F]/80 font-medium"
                            }`}
                        >
                          <div className="shrink-0">
                            {isLocked ? (
                              <ShieldCheck size={12} className={isActive ? "text-[#8B4513]" : "text-[#3D2B1F]/40"} />
                            ) : isDone ? (
                              <CheckCircle2 size={12} className={isActive ? "text-[#8B4513]" : "text-emerald-800"} />
                            ) : isActive ? (
                              <Play size={12} className="text-[#8B4513] fill-current" />
                            ) : (
                              <Circle size={12} className="text-[#3D2B1F]/30" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 pr-2">
                            <h4 className={`text-xs truncate ${isActive ? "text-[#8B4513] font-bold" : "text-[#3D2B1F]"}`}>
                              {lesson.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              {lesson.notes && <span className="text-[9px] font-medium text-[#3D2B1F]/40">📝 Notes</span>}
                              {lesson.content_url && <span className="text-[9px] font-medium text-[#3D2B1F]/40">🎥 Video</span>}
                              {lesson.is_preview && <span className="text-[9px] font-bold text-[#8B4513]">Free Preview</span>}
                              {(lesson.has_assignment || mod.has_assessment) && <span className="text-[9px] font-bold text-[#8B4513]">Task</span>}
                            </div>
                          </div>
                          {isActive && <div className="w-1 h-1 rounded-full bg-[#8B4513] shrink-0"></div>}
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
            <div className="space-y-[8px] pt-2 border-t border-[#8B4513]/10">
              <button
                onClick={() => setOpenModuleId(prev => prev === "general" ? null : "general")}
                className="w-full flex items-center justify-between px-3 py-2 bg-[#F9F5F0]/30 hover:bg-[#F9F5F0]/60 text-[#3D2B1F]/80 font-bold rounded-[8px] transition-colors text-left"
              >
                <span className="text-[10px] uppercase tracking-wider">General Course Classes</span>
                <div className="shrink-0 transition-transform duration-200 text-[#8B4513]" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                  <ChevronRight size={14} />
                </div>
              </button>

              {isOpen && (
                <div className="space-y-1 pl-2 pt-1 border-l border-[#8B4513]/10 ml-2 animate-in fade-in-50 duration-200">
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
                        className={`w-full flex items-center gap-2.5 p-2 rounded-[6px] text-left transition-colors group ${isActive
                            ? "bg-[#8B4513]/5 text-[#8B4513] font-bold border border-[#8B4513]/10"
                            : isLocked
                              ? "opacity-40 cursor-not-allowed text-[#3D2B1F]/50"
                              : "hover:bg-white text-[#3D2B1F]/80 font-medium"
                          }`}
                      >
                        <div className="shrink-0">
                          {isLocked ? (
                            <ShieldCheck size={12} className={isActive ? "text-[#8B4513]" : "text-[#3D2B1F]/40"} />
                          ) : isDone ? (
                            <CheckCircle2 size={12} className={isActive ? "text-[#8B4513]" : "text-emerald-800"} />
                          ) : isActive ? (
                            <Play size={12} className="text-[#8B4513] fill-current" />
                          ) : (
                            <Circle size={12} className="text-[#3D2B1F]/30" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 pr-2">
                          <h4 className={`text-xs truncate ${isActive ? "text-[#8B4513] font-bold" : "text-[#3D2B1F]"}`}>
                            {lesson.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            {lesson.notes && <span className="text-[9px] text-[#3D2B1F]/40">📝 Docs</span>}
                            {lesson.content_url && <span className="text-[9px] text-[#3D2B1F]/40">🎥 Stream</span>}
                            {lesson.is_preview && <span className="text-[9px] font-bold text-[#8B4513]">Free Preview</span>}
                            {lesson.has_assignment && <span className="text-[9px] font-bold text-[#8B4513]">Task</span>}
                          </div>
                        </div>
                        {isActive && <div className="w-1 h-1 rounded-full bg-[#8B4513] shrink-0"></div>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {lessons.length === 0 && (
          <div className="text-xs text-[#3D2B1F]/40 italic text-center py-4 font-medium">No learning curriculum configured yet.</div>
        )}
      </div>
    </div>
  );

  const renderNotesAndAssessment = () => (
    <div className="space-y-[32px]">
      {/* Title & Metadata Section */}
      <div className="space-y-[16px] border-b border-[#8B4513]/10 pb-[16px]">
        <div className="flex flex-wrap items-center justify-between gap-[16px]">
          <h1 className="text-xl md:text-2xl font-bold text-[#3D2B1F] leading-tight">
            {currentLesson?.title}
          </h1>
          {isCurrentLessonCompleted && (
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-[8px] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 self-start">
              <CheckCircle2 size={12} />
              Completed Lesson
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-[8px]">
          {currentLesson?.notes && <span className="text-[10px] font-bold bg-[#8B4513]/5 text-[#8B4513] px-2.5 py-0.5 rounded-[6px] border border-[#8B4513]/10 flex items-center gap-1"><FileText size={10} /> Reading Notes Available</span>}
          {requiresAssessment && <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-[6px] border border-amber-200 flex items-center gap-1">⚠️ Required Project Assignment</span>}
        </div>
      </div>

      {/* Comprehensive Text Notes Rendering */}
      {currentLesson?.notes ? (
        <div className="space-y-[16px] bg-white border border-[#8B4513]/20 rounded-[12px] p-[24px] md:p-[32px] shadow-none max-w-none">
          <h3 className="text-xs font-bold text-[#8B4513] uppercase tracking-wider flex items-center gap-2 border-b border-[#8B4513]/10 pb-2">
            <BookOpen size={14} />
            <span>Lecture Notes & Class References</span>
          </h3>
          <div className="text-xs md:text-sm leading-[1.6] whitespace-pre-wrap text-[#3D2B1F]/90 font-medium">
            {currentLesson.notes}
          </div>
        </div>
      ) : (
        <div className="text-xs text-[#3D2B1F]/50 italic py-2 font-medium">No accompanying text study guides loaded for this video stream.</div>
      )}

      {/* Assignment / Assessment Submission Section */}
      {requiresAssessment && (
        <div className="bg-white border border-[#8B4513]/20 rounded-[12px] p-[24px] md:p-[32px] shadow-none space-y-[24px]">
          <h2 className="text-base font-bold flex items-center gap-2 text-[#3D2B1F] border-b border-[#8B4513]/10 pb-2">
            <Award className="w-4 h-4 text-[#8B4513] shrink-0" />
            Project Assignment Submission
          </h2>

          <div className="space-y-[16px]">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#3D2B1F]/70 block">
                Deliverable Link URL {parentModule?.has_assessment ? "(Module Task)" : "(Lesson Task)"}
              </label>
              <textarea
                value={assignmentUrl}
                onChange={(e) => setAssignmentUrl(e.target.value)}
                placeholder="Paste your active solution link (GitHub repo, live deployed site, or code sandbox)..."
                className="w-full bg-[#F9F5F0] border border-[#8B4513]/20 focus:border-[#8B4513] rounded-[8px] p-3 text-[#3D2B1F] text-xs transition-all min-h-[80px] resize-y outline-none font-medium"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[16px] pt-1">
              <p className="text-xs text-[#3D2B1F]/60 max-w-xs leading-[1.6] font-medium">
                Submitting your output commits variables to the active study tracker to update course grading markers.
              </p>

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="self-end sm:self-auto shrink-0">
                <Button
                  onClick={() => handleCompleteLesson()}
                  disabled={submitting || !assignmentUrl.trim()}
                  className="px-5 h-10 rounded-[8px] font-bold text-xs bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] shadow-none"
                >
                  {submitting ? (
                    <span>Saving Grade...</span>
                  ) : isCurrentLessonCompleted ? (
                    <span>Update Deliverable</span>
                  ) : (
                    <span>Submit Project Task</span>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Lesson Cycling & Navigation Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-[16px] pt-[16px] border-t border-[#8B4513]/10">
        {prevLesson ? (
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
            <Button
              variant="outline"
              onClick={() => {
                setCurrentLesson(prevLesson);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-4 h-9 border-[#8B4513]/20 font-bold text-xs rounded-[8px] shadow-none text-[#3D2B1F]/80"
            >
              <ArrowLeft size={12} className="mr-2 text-[#8B4513]" />
              <span className="truncate max-w-[150px]">Previous: {prevLesson.title}</span>
            </Button>
          </motion.div>
        ) : <div />}

        {nextLesson ? (
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
            <Button
              onClick={async () => {
                if (!requiresAssessment && !isCurrentLessonCompleted) {
                  await handleCompleteLesson(currentLesson);
                }
                setCurrentLesson(nextLesson);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 h-9 bg-[#D2B48C] hover:bg-[#C1A37B] text-[#3D2B1F] font-bold text-xs rounded-[8px] shadow-none"
            >
              <span className="truncate max-w-[150px] mr-2">Next Lesson: {nextLesson.title}</span>
              <Play size={10} className="fill-current text-[#3D2B1F]" />
            </Button>
          </motion.div>
        ) : (
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
            <Button
              onClick={() => window.location.href = '/dashboard'}
              className="px-6 h-9 bg-[#8B4513]/10 hover:bg-[#8B4513]/20 text-[#8B4513] font-bold text-xs rounded-[8px] shadow-none border border-[#8B4513]/20"
            >
              <CheckCircle2 size={12} className="mr-2" />
              Complete Course Program
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );

  const hasVideo = !!currentLesson?.content_url;
  const isLocked = !isEnrolled && !currentLesson?.is_preview;

  return (
    <div className="flex flex-col h-screen bg-[#F9F5F0] text-[#3D2B1F] font-sans overflow-hidden">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      {/* Top Navigation Bar */}
      <header className="flex-shrink-0 h-16 border-b border-[#8B4513]/10 bg-white flex items-center px-6 justify-between z-10 shadow-none">
        <div className="flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
            <Button variant="outline" size="icon" onClick={() => window.location.href = '/dashboard'} className="rounded-[8px] h-8 w-8 border-[#8B4513]/20 shadow-none">
              <ArrowLeft size={16} className="text-[#8B4513]" />
            </Button>
          </motion.div>
          <div className="hidden sm:block h-3 w-px bg-[#8B4513]/10 mx-1" />
          <h1 className="text-xs font-bold text-[#3D2B1F] truncate max-w-[250px] md:max-w-none">
            {course?.title || "Learning Studio Player"}
          </h1>
          {parentModule && (
            <>
              <div className="hidden sm:block h-3 w-px bg-[#8B4513]/10 mx-1" />
              <span className="hidden md:inline-flex text-[10px] font-bold bg-[#8B4513]/5 text-[#8B4513] px-2.5 py-0.5 rounded-[6px] border border-[#8B4513]/10 truncate max-w-xs">
                {parentModule.title}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8B4513] bg-[#8B4513]/5 border border-[#8B4513]/10 px-2.5 py-0.5 rounded-[6px]">
            <ShieldCheck size={12} />
            Verified Academy Course
          </div>
        </div>
      </header>

      {/* Main Studio Area */}
      <div className="flex-1 lg:overflow-hidden p-[24px] md:p-[40px] md:pt-[24px] max-w-[1600px] w-full mx-auto overflow-y-auto">
        {!currentLesson ? (
          <div className="py-20 text-center text-xs text-[#3D2B1F]/60 font-bold">Resolving active syllabus coordinates...</div>
        ) : hasVideo ? (
          /* SCENARIO A: Has Video */
          <div className="grid lg:grid-cols-12 gap-[32px] items-start lg:h-full">

            {/* Left Side: Video + Syllabus Below */}
            <div className="lg:col-span-5 xl:col-span-5 flex flex-col lg:h-full space-y-[24px] min-h-0">
              {/* Wraps YouTube iframe in overflow: hidden container using absolute absolute inset layout */}
              <div className="w-full aspect-video bg-[#F9F5F0] rounded-[12px] overflow-hidden border border-[#8B4513]/20 relative shadow-none shrink-0">
                {isLocked ? (
                  <div className="w-full h-full bg-white flex flex-col items-center justify-center p-6 text-center space-y-4 absolute inset-0 z-10">
                    <div className="w-12 h-12 bg-[#8B4513]/5 rounded-full flex items-center justify-center border border-[#8B4513]/10">
                      <ShieldCheck size={24} className="text-[#8B4513]" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#3D2B1F]">Course Access Locked</h3>
                      <p className="text-xs text-[#3D2B1F]/70 max-w-xs mx-auto mt-1 leading-[1.6] font-medium">Unlock full lecture recordings and study projects instantly.</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setShowPayment(true)}
                      className="px-5 py-2 bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] font-bold text-xs rounded-[8px] shadow-none"
                    >
                      Enroll to Access Lessons
                    </Button>
                  </div>
                ) : (
                  <>
                    {!isPlaying && (
                      <div
                        onClick={() => setIsPlaying(true)}
                        className="absolute inset-0 bg-[#3D2B1F] flex flex-col items-center justify-center p-6 text-center cursor-pointer group z-20 transition-all duration-300"
                      >
                        {/* Custom decorative inner stroke to match Quiet Luxury */}
                        <div className="absolute inset-3 border border-[#8B4513]/20 rounded-[8px] pointer-events-none" />

                        <div className="w-16 h-16 rounded-full bg-[#D2B48C] flex items-center justify-center text-[#3D2B1F] shadow-none group-hover:scale-105 transition-transform duration-300 mb-4">
                          <Play size={28} className="fill-current ml-1 text-[#3D2B1F]" />
                        </div>

                        <h3 className="text-base font-bold text-[#F9F5F0] max-w-md px-4 leading-tight group-hover:text-[#D2B48C] transition-colors line-clamp-2">
                          {currentLesson?.title || "Lesson Stream"}
                        </h3>
                        <p className="text-[10px] font-bold tracking-wider uppercase text-[#D2B48C]/90 mt-2">
                          Click to Start Video Lecture
                        </p>
                      </div>
                    )}
                    {renderVideoPlayer(currentLesson.content_url || "")}
                  </>
                )}
              </div>

              <div className="lg:flex-1 lg:overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent">
                {renderSyllabus()}
              </div>
            </div>

            {/* Right Side: Lesson Notes & Tasks */}
            <div className="lg:col-span-7 xl:col-span-7 lg:h-full lg:overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent min-h-0 pb-20">
              {isLocked ? (
                <div className="bg-white border border-[#8B4513]/20 rounded-[12px] p-[32px] md:p-[48px] text-center space-y-[16px] shadow-none">
                  <h3 className="text-base font-bold text-[#3D2B1F]">{currentLesson.title}</h3>
                  <p className="text-xs text-[#3D2B1F]/70 max-w-sm mx-auto leading-[1.6] font-medium">
                    This module provides specialized masterclass video streaming, institutional lesson summaries, and assignment verifications.
                  </p>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="pt-2">
                    <Button onClick={() => setShowPayment(true)} className="bg-[#D2B48C] hover:bg-[#C1A37B] text-[#3D2B1F] font-bold text-xs rounded-[8px] h-10 px-6 shadow-none">
                      Unlock Full Access Now
                    </Button>
                  </motion.div>
                </div>
              ) : (
                renderNotesAndAssessment()
              )}
            </div>

          </div>
        ) : (
          /* SCENARIO B: No Video */
          <div className="max-w-4xl mx-auto space-y-[32px] lg:h-full lg:overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent pb-20">
            {isLocked ? (
              <div className="bg-white border border-[#8B4513]/20 rounded-[12px] p-[48px] text-center space-y-[16px] shadow-none">
                <div className="w-12 h-12 bg-[#8B4513]/5 rounded-full flex items-center justify-center border border-[#8B4513]/10 mx-auto">
                  <ShieldCheck size={24} className="text-[#8B4513]" />
                </div>
                <h3 className="text-base font-bold text-[#3D2B1F]">Premium Study Guide Locked</h3>
                <p className="text-xs text-[#3D2B1F]/70 max-w-sm mx-auto leading-[1.6] font-medium">
                  Enroll in this academic program track to instantly unseal expert learning references and submission slots.
                </p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="pt-2">
                  <Button onClick={() => setShowPayment(true)} className="bg-[#D2B48C] hover:bg-[#C1A37B] text-[#3D2B1F] font-bold text-xs rounded-[8px] h-10 px-6 shadow-none">
                    Start Course Program
                  </Button>
                </motion.div>
              </div>
            ) : (
              renderNotesAndAssessment()
            )}

            <div className="pt-2 border-t border-[#8B4513]/10">
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
