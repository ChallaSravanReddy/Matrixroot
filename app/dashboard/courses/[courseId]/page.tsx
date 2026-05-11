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
  Clock, 
  BookOpen, 
  Award,
  Video
} from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Razorpay: any;
  }
}

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
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/login";
        return;
      }

      const [courseRes, lessonRes, enrollRes] = await Promise.all([
        supabase.from("courses").select("*, departments(name)").eq("id", courseId).single(),
        supabase.from("lessons").select("*").eq("course_id", courseId).order("order_index", { ascending: true }),
        supabase.from("enrollments").select("*").eq("student_id", session.user.id).eq("course_id", courseId).eq("payment_status", "completed").maybeSingle()
      ]);
        
      if (courseRes.data) setCourse(courseRes.data);
      if (lessonRes.data) {
        setLessons(lessonRes.data);
        setCurrentLesson(lessonRes.data[0]);
      } else {
        setLessons([
          { id: "1", title: "Module 1: Introduction & Fundamentals" },
          { id: "2", title: "Module 2: Advanced Techniques" },
          { id: "3", title: "Module 3: Hands-on Project" }
        ]);
      }
      
      if (enrollRes.data) {
        setIsEnrolled(true);
      } else {
        setShowPayment(true);
      }
      
      setLoading(false);
    };

    fetchCourseData();
  }, [courseId]);

  const handlePayNow = async () => {
    setEnrollLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", session?.user.id).single();
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      const options = {
        key: razorpayKey,
        amount: 50000,
        currency: "INR",
        name: "Matrix Root",
        description: `Enrollment: ${course?.title}`,
        retry: {
          enabled: false // Disable retries to prevent modal hanging issues
        },
        timeout: 60,
        handler: async function (response: any) {
          try {
            console.log("Starting enrollment update for student:", session?.user.id, "course:", courseId);
            
            // 1. Check if record already exists manually to avoid constraint issues
            const { data: existing } = await supabase
              .from('enrollments')
              .select('id')
              .eq('student_id', session?.user.id)
              .eq('course_id', courseId)
              .maybeSingle();

            let dbError;
            
            if (existing) {
              console.log("Updating existing enrollment:", existing.id);
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
              console.log("Inserting new enrollment");
              const { error } = await supabase
                .from('enrollments')
                .insert({
                  student_id: session?.user.id,
                  course_id: courseId,
                  payment_status: 'completed',
                  payment_id: response.razorpay_payment_id,
                  enrolled_at: new Date().toISOString()
                });
              dbError = error;
            }
            
            if (dbError) throw dbError;
            
            console.log("Enrollment update successful");
            alert("Enrollment Success!");
            window.location.reload();
          } catch (handlerErr: any) {
            console.error("Critical Enrollment Error:", handlerErr);
            alert(`PAYMENT SUCCESSFUL (ID: ${response.razorpay_payment_id}), but the database failed to update: ${handlerErr.message || "Unknown Error"}. Please screenshot this and contact support.`);
          }
        },
        prefill: {
          name: profile?.full_name || "",
          email: session?.user.email || "",
          contact: "" // Explicitly empty or provided if available
        },
        notes: {
          course_id: courseId,
          student_id: session?.user.id
        },
        theme: { 
          color: "#2563eb",
          backdrop_color: "rgba(0,0,0,0.8)"
        },
        modal: { 
          ondismiss: () => setEnrollLoading(false),
          escape: true,
          backdropclose: false
        }
      };

      if (!razorpayKey) {
        console.error("RAZORPAY_KEY_ID is missing. Check your environment variables.");
        alert("Payment initialization failed. Please try again later.");
        setEnrollLoading(false);
        return;
      }

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        console.error("Payment Failed:", response.error);
        alert(`Payment failed: ${response.error.description}`);
        setEnrollLoading(false);
      });

      rzp.open();
    } catch (err) {
      setEnrollLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const progress = Math.round((lessons.filter(l => l.is_preview).length / lessons.length) * 100);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      {/* Navbar */}
      <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.location.href = '/dashboard'} className="rounded-xl">
            <ArrowLeft size={20} />
          </Button>
          <div className="hidden sm:block h-4 w-px bg-border mx-2" />
          <h1 className="text-sm font-bold truncate max-w-[200px] md:max-w-none">
            {course?.title || "Course Player"}
          </h1>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
             <ShieldCheck size={14} className="text-primary" />
             Industrial Track
           </div>
           <Button size="sm" variant="outline" className="rounded-full px-4 h-9">
              Resources
           </Button>
        </div>
      </header>

      {/* Main Player Area */}
      <div className="flex-1 grid lg:grid-cols-[1fr_360px] h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Left: Video & Content */}
        <main className="flex flex-col overflow-y-auto">
          {/* Video Player Placeholder */}
          <div className="aspect-video w-full bg-black relative flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 opacity-20" style={{ background: "var(--gradient-primary)" }} />
             <div className="relative z-10 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center text-primary mb-4 border border-primary/30 group cursor-pointer hover:scale-110 transition-transform">
                   <Play size={40} className="fill-current ml-1" />
                </div>
                <p className="text-white/60 text-sm font-medium">Click to start Module: {currentLesson?.title}</p>
             </div>
             
             {/* Player Controls Fake */}
             <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <div className="h-1 w-full bg-white/20 rounded-full mb-4">
                   <div className="h-full bg-primary rounded-full w-1/3" />
                </div>
                <div className="flex items-center justify-between text-white/80 text-xs font-bold uppercase tracking-widest">
                   <div className="flex items-center gap-4">
                      <span>02:45 / 15:00</span>
                      <Video size={16} />
                   </div>
                   <span>HD</span>
                </div>
             </div>
          </div>

          {/* Description Section */}
          <div className="p-8 md:p-12 max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                {course?.departments?.name || "Internship"}
              </span>
              <span className="px-3 py-1 bg-accent text-accent-foreground text-[10px] font-black uppercase tracking-widest rounded-full">
                Module {currentLesson?.order_index || 1}
              </span>
            </div>
            
            <h2 className="text-3xl font-black mb-4">{currentLesson?.title}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10">
              {course?.description || "In this module, you will learn the fundamental concepts and industry standards required for this track. Our mentors have designed this to be highly practical and hands-on."}
            </p>

            <div className="grid sm:grid-cols-2 gap-8 border-t border-border pt-10">
               <div className="space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <Clock size={16} className="text-primary" />
                    Module Duration
                  </h4>
                  <p className="text-muted-foreground">Approx. 45 minutes of lessons + 2 hours of practical task.</p>
               </div>
               <div className="space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <Award size={16} className="text-primary" />
                    Outcome
                  </h4>
                  <p className="text-muted-foreground">Successful completion unlocks the next module and earns progress toward certification.</p>
               </div>
            </div>
          </div>
        </main>

        {/* Right: Syllabus Sidebar */}
        <aside className="border-l border-border bg-card/30 flex flex-col h-full overflow-hidden">
          <div className="p-6 border-b border-border shrink-0">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-sm uppercase tracking-widest">Course Syllabus</h3>
                <span className="text-[10px] font-bold text-primary">{progress}% Done</span>
             </div>
             <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }} />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto">
             <ul className="divide-y divide-border/50">
                {lessons.map((lesson, index) => {
                  const isLocked = !isEnrolled && !lesson.is_preview;
                  const isActive = currentLesson?.id === lesson.id;
                  
                  return (
                    <li 
                      key={lesson.id} 
                      onClick={() => !isLocked && setCurrentLesson(lesson)}
                      className={`p-4 flex gap-4 cursor-pointer transition-colors ${isActive ? "bg-primary/5" : "hover:bg-accent/50"} ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="shrink-0 mt-1">
                        {isLocked ? (
                          <ShieldCheck size={18} className="text-muted-foreground" />
                        ) : isActive ? (
                          <Play size={18} className="text-primary fill-current" />
                        ) : (
                          <Circle size={18} className="text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                         <h4 className={`text-sm font-bold truncate ${isActive ? "text-primary" : "text-foreground"}`}>
                           {lesson.title}
                         </h4>
                         <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-bold text-muted-foreground">Module {index + 1}</span>
                            {lesson.is_preview && (
                              <span className="text-[10px] font-black text-sky-500 uppercase tracking-tighter">Free Preview</span>
                            )}
                         </div>
                      </div>
                    </li>
                  );
                })}
             </ul>
          </div>

          {/* Bottom Action */}
          <div className="p-6 border-t border-border bg-background/50">
             {!isEnrolled ? (
               <Button className="w-full rounded-xl h-12 font-bold shadow-xl shadow-primary/20" onClick={() => setShowPayment(true)}>
                 Enroll to Unlock All
               </Button>
             ) : (
               <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest justify-center">
                  <CheckCircle2 size={14} className="text-primary" />
                  All modules unlocked
               </div>
             )}
          </div>
        </aside>
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
