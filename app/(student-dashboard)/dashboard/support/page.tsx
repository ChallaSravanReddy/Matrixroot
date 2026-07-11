"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSidebarContext } from "@/components/SidebarContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  LogOut, 
  User, 
  ArrowLeft,
  TrendingUp,
  Sparkles,
  Layers,
  Clock,
  Menu,
  X,
  ExternalLink,
  HelpCircle,
  Video,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SupportPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { setIsSidebarOpen } = useSidebarContext();
  const [sessionUser, setSessionUser] = useState<any>(null);

  // Time calculations for the Live Session (6 PM - 8 PM IST, Link reveal at 5:50 PM IST)
  const [timeState, setTimeState] = useState({
    isLive: false,
    linkRevealed: false,
    istHours: 0,
    istMinutes: 0,
    timeString: "",
    timeToNextSession: ""
  });

  useEffect(() => {
    const fetchSupportPageData = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          router.push("/login");
          return;
        }
        setSessionUser(session.user);

        const { data: profileRes } = await supabase
          .from("profiles")
          .select("*, departments(name)")
          .eq("id", session.user.id)
          .single();

        if (profileRes) setProfile(profileRes);
      } catch (error) {
        console.error("Support Page Profile Fetch Error:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchSupportPageData();
  }, [router]);

  useEffect(() => {
    const checkSessionTime = () => {
      const now = new Date();
      
      // Convert current time to IST (UTC+5:30)
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      const istTime = new Date(utcTime + (3600000 * 5.5));
      
      const hours = istTime.getHours();
      const minutes = istTime.getMinutes();
      const seconds = istTime.getSeconds();
      
      const currentMinutes = hours * 60 + minutes;
      
      const revealStart = 17 * 60 + 50; // 5:50 PM IST
      const sessionStart = 18 * 60;      // 6:00 PM IST
      const sessionEnd = 20 * 60;        // 8:00 PM IST
      
      const linkRevealed = currentMinutes >= revealStart && currentMinutes < sessionEnd;
      const isLive = currentMinutes >= sessionStart && currentMinutes < sessionEnd;
      
      // Digital clock string
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes.toString().padStart(2, '0');
      const formattedSeconds = seconds.toString().padStart(2, '0');
      const timeString = `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm} (IST)`;
      
      // Calculate countdown to next session
      let countdownStr = "";
      if (currentMinutes < revealStart) {
        // Next is today's reveal at 17:50
        const diff = revealStart - currentMinutes;
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        countdownStr = `${h > 0 ? `${h}h ` : ""}${m}m remaining`;
      } else if (currentMinutes >= sessionEnd) {
        // Next is tomorrow's reveal at 17:50
        const diff = (24 * 60 - currentMinutes) + revealStart;
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        countdownStr = `Next session in ${h}h ${m}m`;
      } else if (currentMinutes >= revealStart && currentMinutes < sessionStart) {
        const diff = sessionStart - currentMinutes;
        countdownStr = `Starts in ${diff}m`;
      } else {
        countdownStr = "Session in progress";
      }

      setTimeState({
        isLive,
        linkRevealed,
        istHours: hours,
        istMinutes: minutes,
        timeString,
        timeToNextSession: countdownStr
      });
    };

    checkSessionTime();
    const interval = setInterval(checkSessionTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#FAF6F0] items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#FDBF84] border-t-[#8B5A2B] rounded-full"></div>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAF6F0]">
        {/* Header Navigation */}
        <header className="h-16 border-b border-black/10 bg-white flex items-center justify-between px-6 shrink-0 shadow-none">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 lg:hidden text-black hover:bg-black/5 rounded-[8px]"
            >
              <Menu size={20} className="text-[#8B5A2B]" />
            </button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
              <Button variant="outline" size="icon" onClick={() => router.push('/dashboard')} className="rounded-[8px] h-8 w-8 border-black/10 shadow-none">
                <ArrowLeft size={16} className="text-[#8B5A2B]" />
              </Button>
            </motion.div>
            <span className="hidden sm:block h-3 w-px bg-black/10 mx-1" />
            <h2 className="text-xs font-bold text-black">Live Doubt Resolution Studio</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold bg-[#FDBF84]/25 border border-[#FDBF84]/40 px-3.5 py-1.5 rounded-[8px] text-[#8B5A2B]">
              <span className="relative flex h-2 w-2">
                {timeState.isLive && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${timeState.isLive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
              <span>{timeState.isLive ? "Session Live" : "Session Offline"}</span>
            </div>
          </div>
        </header>

        {/* Content Scroll View */}
        <div className="flex-1 overflow-y-auto p-[24px] md:p-[48px] space-y-[32px] pb-24 max-w-5xl mx-auto w-full bg-[#FAF6F0]">
          
          {/* Main Status Callout */}
          <div className="bg-white border border-black/10 rounded-[16px] p-[24px] md:p-[40px] space-y-[24px] relative overflow-hidden shadow-none">
            {/* Background design elements */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-black/5 rounded-bl-[100px] pointer-events-none" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-[16px] border-b border-black/10 pb-[20px]">
              <div className="space-y-[6px]">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#8B5A2B] uppercase tracking-wider bg-[#FDBF84]/25 px-2.5 py-1 rounded-[4px] border border-[#FDBF84]/40">
                  <Sparkles size={11} className="text-[#8B5A2B]" /> Interactive Doubt Clearing
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-black">Live Video Support Portal</h1>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-black/50 uppercase tracking-wider">Current Time</p>
                <p className="text-xs font-mono font-bold text-[#8B5A2B]">{timeState.timeString || "Syncing clock..."}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[32px] pt-[8px]">
              
              {/* Left Column: Timing details */}
              <div className="space-y-[16px]">
                <h3 className="text-sm font-bold text-black flex items-center gap-2">
                  <Clock size={16} className="text-[#8B5A2B]" /> Saturday Session Schedule
                </h3>
                <div className="bg-neutral-50 border border-black/10 rounded-[12px] p-[16px] space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-black">Every Saturday Evening</p>
                      <p className="text-lg font-black text-[#8B5A2B] tracking-tight">6:00 PM – 8:00 PM</p>
                      <p className="text-[9px] text-black/60 font-medium">Indian Standard Time (IST)</p>
                    </div>
                    <div className="w-12 h-12 rounded-[10px] bg-white border border-black/10 flex items-center justify-center text-2xl">
                      ⏰
                    </div>
                  </div>
                  <div className="h-px bg-black/10" />
                  <div className="flex items-start gap-2.5 text-xs text-black/80 font-medium leading-[1.6]">
                    <AlertCircle size={14} className="text-[#8B5A2B] shrink-0 mt-0.5" />
                    <p>
                      The live doubts resolution session runs daily. Our senior tech evaluation instructors join live to review your custom code, debug deployment problems, and solve errors.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Meet link and actions */}
              <div className="space-y-[16px]">
                <h3 className="text-sm font-bold text-black flex items-center gap-2">
                  <Video size={16} className="text-[#8B5A2B]" /> Google Meet Stream Link
                </h3>
                
                <div className="border border-black/10 rounded-[12px] p-[20px] bg-white flex flex-col justify-between h-[155px] relative overflow-hidden group">
                  {timeState.linkRevealed ? (
                    <>
                      <div className="space-y-[4px]">
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded-[4px] w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                          Link Available
                        </div>
                        <p className="text-xs font-semibold text-black">
                          The live classroom room is open. Click the join link below.
                        </p>
                      </div>
                      <Button asChild className="w-full bg-[#FDBF84] hover:bg-[#FCAE68] text-neutral-900 font-extrabold text-xs h-10 rounded-[8px] shadow-none flex items-center justify-center gap-1.5 mt-4 transition-colors cursor-pointer border border-[#FDBF84]/25">
                        <a href="https://meet.google.com/lookup/matrixroot-support" target="_blank" rel="noopener noreferrer">
                          Join Live Meet Section <ExternalLink size={14} className="text-neutral-900" />
                        </a>
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="space-y-[4px]">
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-amber-700 uppercase tracking-wider bg-amber-50 border border-amber-250 px-2 py-0.5 rounded-[4px] w-fit">
                          🔒 Room Locked
                        </div>
                        <p className="text-xs font-semibold text-black leading-[1.5]">
                          The Google Meet classroom link is shared exactly <span className="font-bold text-[#8B5A2B]">10 minutes earlier</span> (at 5:50 PM IST) before the session begins.
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between bg-neutral-50 border border-black/10 p-2.5 rounded-[8px]">
                        <span className="text-[10px] font-bold text-black/60 uppercase tracking-wider">Countdown</span>
                        <span className="text-[11px] font-mono font-bold text-[#8B5A2B]">{timeState.timeToNextSession}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Section: doubt clearing checklist */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
            
            <div className="md:col-span-3 space-y-[16px]">
              <h2 className="text-sm font-bold uppercase tracking-wider text-black/60">How to Prepare for Doubts Sessions</h2>
              <div className="bg-white border border-black/10 rounded-[12px] p-[24px] space-y-[16px] text-xs font-medium text-black/80 leading-[1.6]">
                <p>
                  To ensure that all students get their doubts resolved effectively, please adhere to the following setup instructions before joining the Google Meet call:
                </p>
                <ul className="space-y-3 list-disc pl-5">
                  <li>
                    <strong className="text-black">Have Your Code Ready:</strong> Make sure your development workspace is open, the project is compiling locally, and the code snippet causing the error is located.
                  </li>
                  <li>
                    <strong className="text-black">Log Files & Console Outputs:</strong> Open the terminal window, error logs, or browser console tabs showing the stack traces.
                  </li>
                  <li>
                    <strong className="text-black">Screenshare Ready:</strong> Test your browser permissions for screensharing to avoid delays when the instructor asks to see your setup.
                  </li>
                  <li>
                    <strong className="text-black">Respect Peer Students:</strong> Instructors handle questions sequentially. Keep your mic muted unless speaking to support a clean learning environment.
                  </li>
                </ul>
              </div>
            </div>

          </div>

          {/* Section: Frequently Asked Questions */}
          <div className="space-y-[16px]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black/60 flex items-center gap-1.5">
              <HelpCircle size={16} className="text-[#8B5A2B]" /> FAQ about Doubt Solving
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
              <FaqItem 
                question="What if I miss the doubt clearing session?" 
                answer="No worries! You can join the session the next day. Alternatively, write down your questions clearly and submit them alongside your weekly screenshots log to request admin feedback."
              />
              <FaqItem 
                question="Why is the meet link locked?" 
                answer="To prevent unauthorized entries and maintain classroom safety, the meet code is generated and revealed here exactly at 5:50 PM IST. Please refresh this page at that time to fetch it."
              />
              <FaqItem 
                question="Can I show my project design and UI work?" 
                answer="Yes! Our coaches evaluate technical architecture, responsive styles, database configurations, and UI design systems. Feel free to present any part of your course projects."
              />
              <FaqItem 
                question="Who is eligible to join this session?" 
                answer="All active students and interns subscribed to Matrix Root courses and tracking blueprints are fully eligible to join the doubt solving session."
              />
            </div>
          </div>

        </div>
    </main>
  );
}



function FaqItem({ question, answer }: { question: string, answer: string }) {
  return (
    <div className="bg-white border border-black/10 rounded-[12px] p-[20px] space-y-[8px]">
      <h4 className="text-xs font-bold text-black">{question}</h4>
      <p className="text-[11px] text-black/70 font-medium leading-[1.6]">{answer}</p>
    </div>
  );
}
