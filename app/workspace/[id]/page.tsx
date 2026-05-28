"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useNotification } from "@/components/NotificationProvider";
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
  FileText,
  Upload,
  X,
  Layers,
  Info,
  Trash2,
  Code,
  ExternalLink
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

const loadRazorpayScript = () => {
  return new Promise<boolean>((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string; // Course ID
  const { showNotification } = useNotification();

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Lesson progress tracking state
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [progressRecords, setProgressRecords] = useState<any[]>([]);
  const [assignmentUrl, setAssignmentUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);

  // View switching state (training lessons vs internship workspace)
  const [viewMode, setViewMode] = useState<"training" | "internship">("internship");

  // Custom video playback overlay state to conceal YouTube defaults
  const [isPlaying, setIsPlaying] = useState(false);

  // Project submission states
  const [projectSubmission, setProjectSubmission] = useState<any>(null);
  const [projectSubmitting, setProjectSubmitting] = useState(false);
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [projectNotes, setProjectNotes] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  // Project tasks checklist state
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [taskToggling, setTaskToggling] = useState(false);

  // Weekly screenshot submission states
  const [weeklySubmissions, setWeeklySubmissions] = useState<any[]>([]);
  const [weekNotes, setWeekNotes] = useState<Record<number, string>>({});
  const [weekFiles, setWeekFiles] = useState<Record<number, File>>({});
  const [weekPreviews, setWeekPreviews] = useState<Record<number, string>>({});

  // Document workspace modal state
  const [showDocModal, setShowDocModal] = useState(false);



  useEffect(() => {
    const fetchWorkspaceData = async () => {
      if (!id) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setSessionUser(session.user);

      const [courseRes, lessonRes, allEnrollsRes, moduleRes, progRes, profileRes] = await Promise.all([
        supabase.from("courses").select("*, departments(name)").eq("id", id).single(),
        supabase.from("lessons").select("*").eq("course_id", id).order("order_index", { ascending: true }),
        supabase.from("enrollments").select("*").eq("student_id", session.user.id),
        supabase.from("course_modules").select("*").eq("course_id", id).order("order_index", { ascending: true }),
        supabase.from("user_progress").select("*").eq("user_id", session.user.id).eq("course_id", id),
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
        loadedLessons = [
          { id: "1", title: "Module 1: Introduction & Fundamentals", is_preview: true, notes: "Welcome to the official study material notes workspace." }
        ];
        setLessons(loadedLessons);
        setCurrentLesson(loadedLessons[0]);
      }

      const activeEnroll = allEnrollsRes.data?.find(e => String(e.course_id) === String(id));
      const hasPaid = activeEnroll && (activeEnroll.payment_status === "completed" || activeEnroll.payment_status === "success");

      if (!hasPaid) {
        showNotification("Please subscribe to the curriculum track first to unlock the workspace.", "info");
        router.push(`/dashboard/courses/${id}`);
        return;
      }

      const completedIds = progRes?.data ? progRes.data.map((p: any) => p.lesson_id) : [];
      const allLessonsCompleted = loadedLessons.length > 0 && loadedLessons.every(l => completedIds.includes(l.id));

      if (!allLessonsCompleted) {
        showNotification("Your Internship Workspace is locked. Please complete all course syllabus lessons first!", "info");
        router.push(`/dashboard/courses/${id}`);
        return;
      }

      if (activeEnroll) {
        setEnrollment(activeEnroll);
        if (activeEnroll.completed_tasks && Array.isArray(activeEnroll.completed_tasks)) {
          setCompletedTasks(activeEnroll.completed_tasks);
        }
      }

      if (hasPaid) {
        setIsEnrolled(true);
        const { data: subData } = await supabase
          .from("weekly_updates")
          .select("*")
          .eq("student_id", session.user.id)
          .eq("course_id", id);
        if (subData) {
          setWeeklySubmissions(subData);
          const initialNotes: Record<number, string> = {};
          subData.forEach((sub: any) => {
            initialNotes[sub.week_number] = sub.improvement_text || "";
          });
          setWeekNotes(initialNotes);
        }
      }

      setLoading(false);
    };

    fetchWorkspaceData();
  }, [id, router]);

  useEffect(() => {
    if (!currentLesson) return;
    const rec = progressRecords.find(p => String(p.lesson_id) === String(currentLesson.id));
    setAssignmentUrl(rec?.assignment_url || "");
  }, [currentLesson, progressRecords]);

  const handleCompleteLesson = async (targetLesson?: Lesson) => {
    const lessonToComplete = targetLesson || currentLesson;
    if (!lessonToComplete || !sessionUser) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("user_progress")
        .upsert({
          user_id: sessionUser.id,
          course_id: id,
          lesson_id: lessonToComplete.id,
          status: "completed",
          assignment_url: assignmentUrl || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: "user_id,lesson_id"
        });

      if (error) throw error;

      showNotification(`Progress logged for "${lessonToComplete.title}"!`, "success");

      // Reload progress state
      const { data: updatedProg } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", sessionUser.id)
        .eq("course_id", id);
      
      if (updatedProg) {
        setProgressRecords(updatedProg);
        setCompletedLessonIds(updatedProg.map((p: any) => p.lesson_id));
      }
    } catch (err: any) {
      console.error(err);
      showNotification(`Failed to record progress: ${err.message}`, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayNow = async () => {
    setEnrollLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        showNotification("Failed to load payment gateway script. Please verify your internet connection.", "error");
        setEnrollLoading(false);
        return;
      }

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      const targetPrice = course?.price ?? 500;

      const options = {
        key: razorpayKey,
        amount: targetPrice * 100,
        currency: "INR",
        name: "Matrix Root",
        description: `Enrollment: ${course?.title}`,
        handler: async function (response: any) {
          try {
            const { error: enrollError } = await supabase
              .from("enrollments")
              .upsert({
                student_id: sessionUser.id,
                course_id: id,
                payment_status: "completed",
                payment_id: response.razorpay_payment_id,
                enrolled_at: new Date().toISOString()
              }, {
                onConflict: "student_id,course_id"
              });

            if (enrollError) throw enrollError;

            showNotification("Enrollment confirmed successfully!", "success");
            setIsEnrolled(true);
            
            // Fetch fresh enrollment state
            const { data: freshEnroll } = await supabase
              .from("enrollments")
              .select("*")
              .eq("student_id", sessionUser.id)
              .eq("course_id", id)
              .single();
            if (freshEnroll) setEnrollment(freshEnroll);

            setShowPayment(false);
          } catch (e: any) {
            console.error(e);
            showNotification(`Enrollment logic error: ${e.message}`, "error");
          }
        },
        prefill: {
          email: sessionUser?.email || "",
        },
        theme: {
          color: "#8B4513"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      showNotification(`Razorpay initiation failed: ${err.message}`, "error");
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleSelectBlueprint = async (blueprintText: string) => {
    if (!sessionUser || !id) return;
    try {
      const { error } = await supabase
        .from("enrollments")
        .update({ selected_problem_statement: blueprintText })
        .eq("student_id", sessionUser.id)
        .eq("course_id", id);

      if (error) throw error;

      showNotification("Internship blueprint activated!", "success");
      setEnrollment((prev: any) => ({ ...prev, selected_problem_statement: blueprintText }));
    } catch (e: any) {
      console.error(e);
      showNotification(`Activation failed: ${e.message}`, "error");
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleWeekFileChange = (weekNumber: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setWeekFiles(prev => ({ ...prev, [weekNumber]: file }));
      const url = URL.createObjectURL(file);
      setWeekPreviews(prev => ({ ...prev, [weekNumber]: url }));
    }
  };

  const handleSubmitWeekProof = async (e: React.FormEvent, weekNumber: number) => {
    e.preventDefault();
    if (!sessionUser || !id) return;
    
    const file = weekFiles[weekNumber];
    const notes = weekNotes[weekNumber] || "";
    const existingSubmission = weeklySubmissions.find(s => s.week_number === weekNumber);
    const existingUrl = existingSubmission?.screenshot_url || "";

    if (!file && !existingUrl) {
      showNotification(`Please upload a proof screenshot for Week ${weekNumber}.`, "error");
      return;
    }

    setProjectSubmitting(true);
    try {
      let screenshotUrl = existingUrl;

      if (file) {
        const fileExt = file.name.split(".").pop();
        const filePath = `${sessionUser.id}/${id}/week-${weekNumber}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("weekly-screenshots")
          .upload(filePath, file, { cacheControl: "3600", upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("weekly-screenshots")
          .getPublicUrl(filePath);
          
        screenshotUrl = publicUrl;
      }

      const { error: dbError } = await supabase
        .from("weekly_updates")
        .upsert({
          student_id: sessionUser.id,
          course_id: id,
          week_number: weekNumber,
          improvement_text: notes.trim(),
          screenshot_url: screenshotUrl,
          status: "submitted",
          feedback: null
        }, {
          onConflict: "student_id,course_id,week_number"
        });

      if (dbError) throw dbError;

      showNotification(`Week ${weekNumber} deliverable proof submitted!`, "success");
      
      // Refresh weekly submissions
      const { data: refreshed } = await supabase
        .from("weekly_updates")
        .select("*")
        .eq("student_id", sessionUser.id)
        .eq("course_id", id);
      if (refreshed) {
        setWeeklySubmissions(refreshed);
        const updatedNotes = { ...weekNotes };
        refreshed.forEach((sub: any) => {
          updatedNotes[sub.week_number] = sub.improvement_text || "";
        });
        setWeekNotes(updatedNotes);
        // Clear files for this week
        setWeekFiles(prev => { const n = {...prev}; delete n[weekNumber]; return n; });
        setWeekPreviews(prev => { const n = {...prev}; delete n[weekNumber]; return n; });
      }
    } catch (err: any) {
      console.error(err);
      showNotification(`Submission failed: ${err.message}`, "error");
    } finally {
      setProjectSubmitting(false);
    }
  };

  const handleToggleTask = async (task: string) => {
    if (!enrollment?.id || taskToggling) return;
    setTaskToggling(true);

    const isNowComplete = !completedTasks.includes(task);
    const updatedTasks = isNowComplete
      ? [...completedTasks, task]
      : completedTasks.filter(t => t !== task);

    setCompletedTasks(updatedTasks); // Optimistic update

    const { error } = await supabase
      .from("enrollments")
      .update({ completed_tasks: updatedTasks })
      .eq("id", enrollment.id);

    if (error) {
      console.error("Task toggle error:", error);
      setCompletedTasks(completedTasks); // Revert on error
      showNotification("Failed to update task. Please try again.", "error");
    }
    setTaskToggling(false);
  };

  const renderVideoPlayer = (url: string) => {
    if (!url) return null;
    let secureUrl = url.startsWith('http://') ? url.replace('http://', 'https://') : url;

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

    if (secureUrl.includes("youtube.com/embed/")) {
      const separator = secureUrl.includes("?") ? "&" : "?";
      secureUrl += `${separator}modestbranding=1&rel=0&showinfo=0&controls=1&disablekb=1`;
      if (isPlaying) secureUrl += `&autoplay=1`;
    }

    if (secureUrl.endsWith('.mp4')) {
      return <video src={secureUrl} controls className="w-full h-full object-cover absolute inset-0 rounded-[12px] border border-[#8B4513]/15" />;
    } else {
      return (
        <iframe
          src={secureUrl}
          className="w-full h-full border-0 absolute inset-0 rounded-[12px] border border-[#8B4513]/15"
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

  const allLessonsCompleted = lessons.length > 0 && lessons.every(l => completedLessonIds.includes(l.id));
  const showFoundational = viewMode === "training";
  const showInternship = viewMode === "internship";
  const isLocked = !isEnrolled && currentLesson && !currentLesson.is_preview;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F9F5F0] items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#8B4513] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F5F0] text-[#3D2B1F] font-sans flex flex-col">

      {/* Top Workspace Header */}
      <header className="h-16 border-b border-[#8B4513]/10 bg-white flex items-center justify-between px-6 shrink-0 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/workspace')}
            className="p-2 text-[#3D2B1F]/60 hover:text-[#3D2B1F] rounded-[8px] hover:bg-[#8B4513]/5 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold tracking-wider text-[#8B4513] uppercase">Workspace Hub</span>
            <h1 className="text-xs md:text-sm font-bold text-[#3D2B1F] line-clamp-1">{course?.title}</h1>
          </div>
        </div>

        {/* Automated Phase Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="px-3 py-1.5 rounded-[8px] text-[10px] md:text-xs font-bold border bg-emerald-500/10 text-emerald-800 border-emerald-500/20 shadow-sm transition-all">
            Internship Workspace Active
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[9px] font-bold text-[#8B4513] uppercase tracking-widest bg-white px-2.5 py-1 rounded-[6px] border border-[#8B4513]/10">
            {course?.departments?.name || "Matrix Root"}
          </span>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Scenario: Locked Screen Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-[#F9F5F0]/90 backdrop-blur-md z-30 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white border border-[#8B4513]/20 rounded-[16px] p-8 text-center space-y-6 shadow-2xl">
              <div className="w-14 h-14 bg-[#8B4513]/5 border border-[#8B4513]/25 rounded-full flex items-center justify-center mx-auto text-[#8B4513]">
                <ShieldCheck size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[#3D2B1F]">Unlock Training Workspace</h3>
                <p className="text-xs text-[#3D2B1F]/70 leading-relaxed max-w-sm mx-auto">
                  Subscribe to this curriculum track to instantly unlock premium video streams, complete tasks, and activate your production internship.
                </p>
              </div>
              <div className="pt-2">
                <Button 
                  onClick={() => setShowPayment(true)} 
                  className="w-full bg-[#D2B48C] hover:bg-[#C1A37B] text-[#3D2B1F] font-bold text-xs h-11 rounded-[10px] transition-all shadow-md"
                >
                  Start Course & Enroll Now (₹{course?.price ?? 500})
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Production Internship Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full">
            
            {/* Left/Top Panel: Project Blueprint Display & Active Goal */}
            <div className="w-full lg:w-[420px] xl:w-[460px] shrink-0 border-r border-[#8B4513]/10 bg-[#F9F5F0] p-4 flex flex-col overflow-y-auto space-y-4">
              
              <div className="border-b border-[#8B4513]/15 pb-3">
                <span className="text-[9px] font-bold text-[#8B4513] uppercase tracking-widest">PRODUCTION ALIGNMENT</span>
                <h3 className="text-xs font-bold text-[#3D2B1F] uppercase tracking-wider mt-0.5">Project Blueprint</h3>
              </div>

              {enrollment?.selected_problem_statement ? (
                <div className="bg-white border border-[#8B4513]/15 rounded-[12px] p-5 space-y-4 flex-1 flex flex-col justify-between shadow-sm">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">Active Workspace Goal</span>
                    </div>
                    <div className="bg-[#F9F5F0]/50 border border-[#8B4513]/15 rounded-[8px] p-3 text-xs leading-relaxed text-[#3D2B1F] whitespace-pre-wrap font-mono">
                      {enrollment.selected_problem_statement}
                    </div>
                    <button
                      onClick={() => setShowDocModal(true)}
                      className="flex items-center justify-center gap-2 text-xs text-white bg-[#8B4513] hover:bg-[#723910] font-bold p-2.5 rounded-[8px] mt-2 transition-colors shadow-xs w-full"
                    >
                      <FileText size={14} /> View Official Project Document
                    </button>
                  </div>
                  
                  <div className="text-[10px] text-[#3D2B1F]/60 leading-relaxed pt-4 border-t border-[#8B4513]/10 flex items-center gap-1.5">
                    <Info size={12} className="text-[#8B4513] shrink-0" />
                    <span>Your active blueprint is locked for the duration of this production cycle.</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 flex-1">
                  <div className="bg-[#FFF9E6] border border-amber-500/30 p-4 rounded-[12px] text-xs text-amber-850 leading-relaxed flex gap-2">
                    <Info size={16} className="shrink-0 mt-0.5 text-amber-700" />
                    <span>Select and activate one of the deployed problem statements below to initialize your internship project workspace. Once activated, the selection is permanent.</span>
                  </div>

                  <div className="p-4 bg-white border border-[#8B4513]/15 rounded-[12px] flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-[#8B4513] shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-[#3D2B1F]">Official Assignment Guidelines</p>
                        <p className="text-[9px] text-[#3D2B1F]/60">View official project guidelines document</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDocModal(true)}
                      className="text-[10px] font-bold text-white bg-[#8B4513] hover:bg-[#723910] px-3 py-1.5 rounded-[8px] flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <FileText size={12} /> View
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                    {course?.problem_statements && course.problem_statements.length > 0 ? (
                      course.problem_statements.map((statement: string, index: number) => (
                        <div key={index} className="bg-white border border-[#8B4513]/15 hover:border-[#8B4513]/40 rounded-[12px] p-4 space-y-3 transition-all flex flex-col justify-between shadow-sm">
                          <div className="space-y-2">
                            <span className="text-[9px] font-bold text-[#8B4513]/80 uppercase tracking-widest">Blueprint Option {index + 1}</span>
                            <p className="text-xs text-[#3D2B1F]/80 leading-relaxed font-mono whitespace-pre-wrap line-clamp-4">{statement}</p>
                          </div>
                          <Button
                            onClick={() => handleSelectBlueprint(statement)}
                            className="bg-[#D2B48C] hover:bg-[#C1A37B] text-[#3D2B1F] font-bold text-[10px] px-3.5 h-8 rounded-[8px] transition-all self-end"
                          >
                            Activate Blueprint
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-[#3D2B1F]/60 italic p-6 bg-white rounded-[12px] border border-[#8B4513]/10 text-center">
                        No internship blueprints have been deployed for this course track yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Project Tasks Checklist */}
              {course?.project_tasks && course.project_tasks.length > 0 && (
                <div className="space-y-3">
                  <div className="border-b border-[#8B4513]/15 pb-3">
                    <span className="text-[9px] font-bold text-[#8B4513] uppercase tracking-widest">EXECUTION ROADMAP</span>
                    <h3 className="text-xs font-bold text-[#3D2B1F] uppercase tracking-wider mt-0.5">Project Tasks</h3>
                  </div>

                  {/* Progress Bar */}
                  <div className="bg-white border border-[#8B4513]/15 rounded-[12px] p-4 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#3D2B1F] uppercase tracking-widest">Completion Progress</span>
                      <span className="text-[10px] font-extrabold text-[#8B4513]">
                        {completedTasks.filter(t => course.project_tasks.includes(t)).length} / {course.project_tasks.length}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#8B4513]/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#8B4513] rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.round((completedTasks.filter((t: string) => course.project_tasks.includes(t)).length / course.project_tasks.length) * 100)}%`
                        }}
                      />
                    </div>
                    {completedTasks.filter((t: string) => course.project_tasks.includes(t)).length === course.project_tasks.length && (
                      <div className="flex items-center gap-1.5 text-emerald-700 text-[10px] font-bold">
                        <CheckCircle2 size={12} />
                        All tasks completed! Ready to submit deliverables.
                      </div>
                    )}
                  </div>

                  {/* Task Items */}
                  <div className="space-y-2">
                    {course.project_tasks.map((task: string, idx: number) => {
                      const isDone = completedTasks.includes(task);
                      return (
                        <button
                          key={idx}
                          onClick={() => handleToggleTask(task)}
                          disabled={taskToggling}
                          className={`w-full flex items-start gap-3 p-3 rounded-[10px] border text-left transition-all group ${
                            isDone
                              ? "bg-emerald-50/60 border-emerald-200/70 hover:border-emerald-300"
                              : "bg-white border-[#8B4513]/15 hover:border-[#8B4513]/30 hover:bg-[#F9F5F0]/50"
                          }`}
                        >
                          <span className={`mt-0.5 shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                            isDone ? "bg-emerald-600 border-emerald-600" : "border-[#8B4513]/40 group-hover:border-[#8B4513]"
                          }`}>
                            {isDone && <CheckCircle2 size={10} className="text-white" />}
                          </span>
                          <span className={`text-xs leading-relaxed font-medium transition-colors ${
                            isDone ? "text-emerald-800 line-through decoration-emerald-400" : "text-[#3D2B1F]"
                          }`}>
                            {task}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right/Bottom Panel: Project Submission */}
            <div className="flex-1 bg-[#F9F5F0] p-6 overflow-y-auto flex flex-col space-y-6">
              
              <div className="border-b border-[#8B4513]/15 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-[#8B4513] uppercase tracking-widest">SUBMISSION WORKSPACE</span>
                  <h2 className="text-lg font-bold text-[#3D2B1F] mt-1">Weekly Screenshot Proofs</h2>
                </div>
              </div>

              {!enrollment?.selected_problem_statement ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white border border-[#8B4513]/15 rounded-[16px] space-y-3 shadow-sm">
                  <Layers size={36} className="text-[#8B4513] animate-pulse" />
                  <h4 className="text-sm font-bold text-[#3D2B1F]">Submission Workspace Locked</h4>
                  <p className="text-xs text-[#3D2B1F]/70 max-w-xs leading-relaxed">
                    You must select and activate a Production Project Blueprint in the left column to unlock the project deliverables submission portal.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Guidelines Document Card */}
                  <div className="bg-[#F9F5F0]/50 border border-[#8B4513]/15 rounded-[12px] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#8B4513]/10 rounded-[8px] text-[#8B4513]">
                        <FileText size={18} />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-[#3D2B1F]">Curriculum guidelines & resources</h5>
                        <p className="text-[10px] text-[#3D2B1F]/50">Refer to the official document for assignment specs.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDocModal(true)}
                      className="px-3 py-1.5 text-[10px] font-bold bg-[#8B4513] text-white rounded-[6px] hover:bg-[#72360f] transition-all flex items-center gap-1"
                    >
                      <FileText size={11} /> Open
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[750px] overflow-y-auto pr-1">
                    {Array.from({ length: course.timeline_weeks || 8 }, (_, i) => {
                      const weekNum = i + 1;
                      const taskPrompt = course.weekly_tasks?.[i] || "Submit weekly progress screenshot.";
                      const sub = weeklySubmissions.find(s => s.week_number === weekNum);

                      return (
                        <div key={weekNum} className="bg-white border border-[#8B4513]/15 rounded-[16px] p-6 shadow-sm space-y-4">
                          {/* Week Title & Status Badge */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#8B4513]/10 pb-3">
                            <div>
                              <h4 className="text-sm font-bold text-[#3D2B1F]">Week {weekNum} Deliverable</h4>
                              <p className="text-[11px] text-[#3D2B1F]/50 font-medium">Progress Update & Verification Screenshot</p>
                            </div>
                            {sub ? (
                              sub.status === "approved" ? (
                                <span className="px-2.5 py-1 rounded-[12px] text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  Approved & Verified
                                </span>
                              ) : sub.status === "rejected" ? (
                                <span className="px-2.5 py-1 rounded-[12px] text-[10px] font-extrabold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200">
                                  Changes Requested
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-[12px] text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200">
                                  Under Evaluation
                                </span>
                              )
                            ) : (
                              <span className="px-2.5 py-1 rounded-[12px] text-[10px] font-extrabold uppercase tracking-wider bg-gray-50 text-gray-500 border border-gray-200">
                                Not Submitted
                              </span>
                            )}
                          </div>

                          {/* Task Description Prompt */}
                          <div className="bg-[#F9F5F0]/40 border border-[#8B4513]/10 rounded-[10px] p-3 text-xs">
                            <span className="text-[9px] font-bold text-[#8B4513] uppercase tracking-widest block mb-1">Task prompt</span>
                            <p className="text-[#3D2B1F] font-medium leading-relaxed">{taskPrompt}</p>
                          </div>

                          {/* Feedback display (if exists) */}
                          {sub?.feedback && (
                            <div className={`p-3.5 rounded-[10px] border text-xs leading-relaxed space-y-1 ${
                              sub.status === "rejected"
                                ? "bg-rose-50 border-rose-100 text-rose-800"
                                : "bg-amber-50 border-amber-100 text-amber-900"
                            }`}>
                              <span className="font-extrabold text-[9px] uppercase tracking-wider block">
                                {sub.status === "rejected" ? "Revision Notes from Mentor" : "Mentor Feedback"}
                              </span>
                              <p className="font-medium">{sub.feedback}</p>
                            </div>
                          )}

                          {/* If not submitted OR under evaluation OR changes requested */}
                          {(!sub || sub.status === "rejected") ? (
                            /* Submitting / Resubmitting Form */
                            <form onSubmit={(e) => handleSubmitWeekProof(e, weekNum)} className="space-y-4 pt-2">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#8B4513] uppercase tracking-wider block">
                                  Implementation notes & updates
                                </label>
                                <textarea
                                  value={weekNotes[weekNum] || ""}
                                  onChange={(e) => setWeekNotes(prev => ({ ...prev, [weekNum]: e.target.value }))}
                                  placeholder="Describe the tasks completed, challenges faced, or features implemented this week..."
                                  className="w-full bg-[#F9F5F0]/30 border border-[#8B4513]/15 focus:border-[#8B4513] rounded-[8px] p-3 text-xs outline-none min-h-[80px] text-[#3D2B1F] font-medium transition-all resize-none"
                                />
                              </div>

                              <div className="space-y-2 border-t border-[#8B4513]/10 pt-3">
                                <label className="text-[10px] font-bold text-[#8B4513] uppercase tracking-wider block">
                                  Proof Screenshot
                                </label>
                                <div className="flex flex-wrap items-center gap-4">
                                  <label className="flex flex-col items-center justify-center w-28 h-20 bg-[#F9F5F0]/20 border border-[#8B4513]/15 border-dashed hover:border-[#8B4513]/30 rounded-[8px] cursor-pointer transition-all">
                                    <div className="text-center p-2">
                                      <Upload size={16} className="mx-auto text-[#8B4513]" />
                                      <span className="text-[8px] font-bold text-[#3D2B1F]/60 uppercase block mt-1">Upload file</span>
                                    </div>
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      onChange={(e) => handleWeekFileChange(weekNum, e)} 
                                      className="hidden" 
                                    />
                                  </label>

                                  {(weekPreviews[weekNum] || sub?.screenshot_url) && (
                                    <div className="relative h-20 aspect-video bg-white rounded-[8px] overflow-hidden border border-[#8B4513]/15">
                                      <img 
                                        src={weekPreviews[weekNum] || sub?.screenshot_url} 
                                        alt="Progress screenshot preview" 
                                        className="w-full h-full object-cover" 
                                      />
                                      {weekPreviews[weekNum] && (
                                        <button 
                                          type="button"
                                          onClick={() => {
                                            setWeekFiles(prev => { const n = {...prev}; delete n[weekNum]; return n; });
                                            setWeekPreviews(prev => { const n = {...prev}; delete n[weekNum]; return n; });
                                          }}
                                          className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-red-400 hover:text-white transition-colors"
                                        >
                                          <X size={10} />
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex justify-end pt-1">
                                <Button
                                  type="submit"
                                  disabled={projectSubmitting}
                                  className="bg-[#8B4513] hover:bg-[#72360f] text-white font-bold text-[11px] px-4 h-8 rounded-[6px] transition-all shadow-sm"
                                >
                                  {projectSubmitting ? "Submitting..." : sub ? "Resubmit Week Proof" : "Submit Week Proof"}
                                </Button>
                              </div>
                            </form>
                          ) : (
                            /* Read-only Submitted View */
                            <div className="space-y-4 pt-2">
                              {sub.improvement_text && (
                                <div className="space-y-1">
                                  <span className="text-[9px] font-bold text-[#8B4513] uppercase tracking-widest block">Submitted implementation notes</span>
                                  <div className="bg-[#F9F5F0]/30 border border-[#8B4513]/10 p-3 rounded-[8px] text-xs text-[#3D2B1F] leading-relaxed whitespace-pre-wrap font-medium">
                                    {sub.improvement_text}
                                  </div>
                                </div>
                              )}

                              {sub.screenshot_url && (
                                <div className="space-y-1">
                                  <span className="text-[9px] font-bold text-[#8B4513] uppercase tracking-widest block">Submitted Proof of Work Screenshot</span>
                                  <div className="relative aspect-video max-w-sm w-full bg-[#F9F5F0]/30 rounded-[8px] overflow-hidden border border-[#8B4513]/10">
                                    <img 
                                      src={sub.screenshot_url} 
                                      alt="Submitted proof screenshot" 
                                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={() => window.open(sub.screenshot_url, "_blank")}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
      </main>

      {/* Enrollment Checkout Drawer Modal */}
      <EnrollmentModal
        open={showPayment}
        onOpenChange={setShowPayment}
        courseTitle={course?.title || "Program Track"}
        price={course?.price ?? 500}
        onPay={handlePayNow}
        loading={enrollLoading}
      />

      {/* Document Workspace Modal */}
      {showDocModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowDocModal(false); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="w-full max-w-2xl max-h-[88vh] bg-white rounded-[20px] shadow-2xl flex flex-col overflow-hidden border border-[#8B4513]/15"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#8B4513]/10 shrink-0 bg-[#F9F5F0]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#8B4513]/10 rounded-[10px]">
                  <FileText size={18} className="text-[#8B4513]" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-[#8B4513] uppercase tracking-widest block">Official Document Workspace</span>
                  <h2 className="text-sm font-bold text-[#3D2B1F]">{course?.title}</h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {course?.problem_statement_file_url && (
                  <a
                    href={course.problem_statement_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[10px] font-bold text-[#8B4513] border border-[#8B4513]/25 px-3 py-1.5 rounded-[8px] hover:bg-[#8B4513]/5 transition-all"
                  >
                    <ExternalLink size={12} /> Download PDF
                  </a>
                )}
                <button
                  onClick={() => setShowDocModal(false)}
                  className="p-1.5 text-[#3D2B1F]/40 hover:text-[#3D2B1F] hover:bg-[#8B4513]/5 rounded-[8px] transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body — Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* Workspace Goal Section */}
              {enrollment?.selected_problem_statement && (
                <section className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Active Workspace Goal</span>
                  </div>
                  <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-[10px] p-4 text-xs leading-relaxed text-[#3D2B1F] whitespace-pre-wrap font-mono">
                    {enrollment.selected_problem_statement}
                  </div>
                </section>
              )}

              {/* Course Description / Overview */}
              {course?.description && (
                <section className="space-y-2">
                  <span className="text-[9px] font-bold text-[#8B4513] uppercase tracking-widest block">Course Overview</span>
                  <div className="bg-[#F9F5F0] border border-[#8B4513]/10 rounded-[10px] p-4 text-xs leading-relaxed text-[#3D2B1F]/80 font-medium">
                    {course.description}
                  </div>
                </section>
              )}

              {/* Curriculum Guidelines — All Problem Statements */}
              {course?.problem_statements && course.problem_statements.length > 0 && (
                <section className="space-y-2">
                  <span className="text-[9px] font-bold text-[#8B4513] uppercase tracking-widest block">Curriculum Guidelines & Project Blueprints</span>
                  <div className="space-y-3">
                    {course.problem_statements.map((stmt: string, i: number) => (
                      <div key={i} className="bg-white border border-[#8B4513]/10 rounded-[10px] p-4 space-y-1">
                        <span className="text-[8px] font-bold text-[#8B4513]/70 uppercase tracking-widest">Blueprint Option {i + 1}</span>
                        <p className="text-xs text-[#3D2B1F]/80 leading-relaxed font-mono whitespace-pre-wrap">{stmt}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Weekly Task Plan */}
              {course?.weekly_tasks && course.weekly_tasks.length > 0 && (
                <section className="space-y-2">
                  <span className="text-[9px] font-bold text-[#8B4513] uppercase tracking-widest block">Weekly Execution Plan</span>
                  <div className="space-y-2">
                    {course.weekly_tasks.map((task: string, i: number) => (
                      <div key={i} className="flex gap-3 items-start bg-[#F9F5F0] border border-[#8B4513]/10 rounded-[8px] p-3">
                        <span className="shrink-0 w-6 h-6 bg-[#8B4513]/10 rounded-full flex items-center justify-center text-[9px] font-bold text-[#8B4513]">
                          {i + 1}
                        </span>
                        <div>
                          <span className="text-[9px] font-bold text-[#8B4513] uppercase tracking-widest block mb-0.5">Week {i + 1}</span>
                          <p className="text-xs text-[#3D2B1F]/80 leading-relaxed font-medium">{task}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Project Tasks Reference */}
              {course?.project_tasks && course.project_tasks.length > 0 && (
                <section className="space-y-2">
                  <span className="text-[9px] font-bold text-[#8B4513] uppercase tracking-widest block">Project Deliverable Checklist</span>
                  <div className="space-y-1.5">
                    {course.project_tasks.map((task: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 bg-white border border-[#8B4513]/10 rounded-[8px]">
                        <div className="w-3.5 h-3.5 mt-0.5 shrink-0 rounded-full border-2 border-[#8B4513]/40" />
                        <p className="text-xs text-[#3D2B1F]/80 leading-relaxed font-medium">{task}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Fallback if nothing to show */}
              {!enrollment?.selected_problem_statement && !course?.problem_statements?.length && !course?.weekly_tasks?.length && (
                <div className="text-center py-10 text-xs text-[#3D2B1F]/50 italic">
                  No document content has been configured for this course yet. Please contact your program administrator.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="shrink-0 border-t border-[#8B4513]/10 px-6 py-4 bg-[#F9F5F0] flex items-center justify-between">
              <p className="text-[9px] text-[#3D2B1F]/40 font-medium">
                {course?.departments?.name || "Matrix Root Academy"} · Official Program Document
              </p>
              <button
                onClick={() => setShowDocModal(false)}
                className="text-xs font-bold text-[#3D2B1F]/60 hover:text-[#3D2B1F] px-4 py-1.5 rounded-[8px] hover:bg-[#8B4513]/5 transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
