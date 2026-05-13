"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  TrendingUp, 
  LayoutDashboard, 
  BookOpen, 
  User, 
  LogOut, 
  ArrowLeft, 
  Award, 
  ShieldCheck, 
  Sparkles,
  BarChart3,
  Calendar,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Static reference data representation reproducing dense historical semestral performance metrics (RCD)
const RCD = [
  {
    id: "sem-5",
    term: "Semester 5",
    academicYear: "Autumn 2026",
    sgpa: "9.72",
    cgpa: "9.35",
    creditsCleared: "22 / 22",
    attendance: "96%",
    evaluationStatus: "Outstanding",
    subjects: [
      { code: "CS501", title: "Deep Generative Models & Vision", credits: 4, internalMarks: "48/50", externalGrade: "A+", points: 10 },
      { code: "CS502", title: "Reinforcement Learning Systems", credits: 4, internalMarks: "47/50", externalGrade: "A+", points: 10 },
      { code: "CS503", title: "High-Scale Microservices Cloud Ops", credits: 4, internalMarks: "46/50", externalGrade: "A", points: 9 },
      { code: "CS504", title: "Advanced Natural Language Systems", credits: 4, internalMarks: "49/50", externalGrade: "A+", points: 10 },
      { code: "CS505P", title: "Technical Master Thesis & Output Evaluation", credits: 6, internalMarks: "95/100", externalGrade: "A+", points: 10 },
    ]
  },
  {
    id: "sem-4",
    term: "Semester 4",
    academicYear: "Spring 2025",
    sgpa: "9.55",
    cgpa: "9.23",
    creditsCleared: "24 / 24",
    attendance: "95%",
    evaluationStatus: "Excellent",
    subjects: [
      { code: "CS401", title: "Applied Machine Learning Engineering", credits: 4, internalMarks: "48/50", externalGrade: "A+", points: 10 },
      { code: "CS402", title: "Cryptography & Systems Security", credits: 4, internalMarks: "45/50", externalGrade: "A", points: 9 },
      { code: "CS403", title: "Distributed Parallel Computing Core", credits: 4, internalMarks: "47/50", externalGrade: "A+", points: 10 },
      { code: "CS404", title: "Software Engineering Lifecycle Protocol", credits: 4, internalMarks: "46/50", externalGrade: "A+", points: 10 },
      { code: "CS405P", title: "Industrial Capstone Protocol II", credits: 8, internalMarks: "92/100", externalGrade: "A+", points: 10 },
    ]
  },
  {
    id: "sem-3",
    term: "Semester 3",
    academicYear: "Autumn 2025",
    sgpa: "9.40",
    cgpa: "9.12",
    creditsCleared: "25 / 25",
    attendance: "94%",
    evaluationStatus: "Excellent",
    subjects: [
      { code: "CS301", title: "Operating Systems Internals & Design", credits: 4, internalMarks: "46/50", externalGrade: "A+", points: 10 },
      { code: "CS302", title: "Theory of Automata & Computation", credits: 4, internalMarks: "44/50", externalGrade: "A", points: 9 },
      { code: "CS303", title: "Artificial Intelligence Foundations", credits: 4, internalMarks: "48/50", externalGrade: "A+", points: 10 },
      { code: "CS304", title: "Quantitative Systems Architecture", credits: 4, internalMarks: "45/50", externalGrade: "A", points: 9 },
      { code: "CS305P", title: "Industrial Capstone Protocol I", credits: 9, internalMarks: "90/100", externalGrade: "A+", points: 10 },
    ]
  },
  {
    id: "sem-2",
    term: "Semester 2",
    academicYear: "Spring 2024",
    sgpa: "9.15",
    cgpa: "8.98",
    creditsCleared: "26 / 26",
    attendance: "89%",
    evaluationStatus: "Very Good",
    subjects: [
      { code: "CS201", title: "Advanced Database Systems Internals", credits: 4, internalMarks: "45/50", externalGrade: "A", points: 9 },
      { code: "CS202", title: "Computer Networks & Topologies", credits: 4, internalMarks: "43/50", externalGrade: "A", points: 9 },
      { code: "CS203", title: "Object-Oriented Software Design Patterns", credits: 4, internalMarks: "47/50", externalGrade: "A+", points: 10 },
      { code: "CS204", title: "Engineering Statistics & Probabilities", credits: 4, internalMarks: "42/50", externalGrade: "B+", points: 8 },
      { code: "CS205", title: "Enterprise Cloud Compute Infrastructure", credits: 10, internalMarks: "91/100", externalGrade: "A+", points: 10 },
    ]
  },
  {
    id: "sem-1",
    term: "Semester 1",
    academicYear: "Autumn 2024",
    sgpa: "8.82",
    cgpa: "8.82",
    creditsCleared: "24 / 24",
    attendance: "92%",
    evaluationStatus: "Very Good",
    subjects: [
      { code: "CS101", title: "Data Structures & Core Algorithms", credits: 4, internalMarks: "44/50", externalGrade: "A", points: 9 },
      { code: "CS102", title: "Digital Logic Design & Circuits", credits: 4, internalMarks: "41/50", externalGrade: "B+", points: 8 },
      { code: "CS103", title: "Discrete Mathematical Structures", credits: 4, internalMarks: "46/50", externalGrade: "A+", points: 10 },
      { code: "CS104", title: "Matrix Analysis & Linear Systems", credits: 4, internalMarks: "42/50", externalGrade: "B+", points: 8 },
      { code: "CS105", title: "Communication Core Competency Workshop", credits: 8, internalMarks: "88/100", externalGrade: "A", points: 9 },
    ]
  }
];

export default function PerformanceReportCardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSemesterId, setActiveSemesterId] = useState("sem-5");

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: profileRes } = await supabase
        .from("profiles")
        .select("*, departments(name)")
        .eq("id", session.user.id)
        .single();

      if (profileRes) setProfile(profileRes);
      setLoading(false);
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center font-sans">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Currently active report card object binding
  const activeSemData = RCD.find(s => s.id === activeSemesterId) || RCD[0];

  // Table rendering logic engine mapping evaluation variables (rcRender)
  const rcRender = () => (
    <div className="bg-card/40 backdrop-blur-xl border border-border rounded-[2.5rem] overflow-hidden shadow-sm font-sans">
      <div className="p-6 md:p-8 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-accent/20 font-sans">
        <div className="font-sans">
          <div className="flex items-center gap-2 font-sans">
            <h3 className="text-xl font-black text-foreground font-sans">{activeSemData.term} Breakdown</h3>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 font-sans">
              {activeSemData.academicYear}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-sans">Subject-wise evaluation scorecard tracking standard grading metrics</p>
        </div>
        
        <div className="flex items-center gap-3 self-start sm:self-auto font-sans">
          <div className="text-right font-sans">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block font-sans">Term Score Status</span>
            <span className="text-xs font-black text-emerald-500 font-sans">{activeSemData.evaluationStatus}</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto font-sans">
        <table className="w-full text-left border-collapse font-sans">
          <thead>
            <tr className="border-b border-border/60 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-accent/10 font-sans">
              <th className="p-4 pl-6 font-sans">Subject Code</th>
              <th className="p-4 font-sans">Course Title</th>
              <th className="p-4 text-center font-sans">Credits</th>
              <th className="p-4 text-center font-sans">Internal Evaluation</th>
              <th className="p-4 text-center font-sans">External Grade</th>
              <th className="p-4 pr-6 text-right font-sans">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 text-xs font-sans">
            {activeSemData.subjects.map((subj) => (
              <tr key={subj.code} className="hover:bg-accent/30 transition-colors font-sans">
                <td className="p-4 pl-6 font-bold text-foreground font-sans">
                  <span className="px-2 py-1 rounded-md bg-accent text-accent-foreground text-[11px] font-mono font-sans">{subj.code}</span>
                </td>
                <td className="p-4 font-bold text-foreground max-w-xs truncate font-sans">{subj.title}</td>
                <td className="p-4 text-center font-bold text-muted-foreground font-sans">{subj.credits}</td>
                <td className="p-4 text-center font-medium text-muted-foreground font-sans">{subj.internalMarks}</td>
                <td className="p-4 text-center font-sans">
                  <span className="font-black text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10 text-xs font-sans">
                    {subj.externalGrade}
                  </span>
                </td>
                <td className="p-4 pr-6 text-right font-sans">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-sans">
                    <CheckCircle2 size={10} className="font-sans" /> Cleared
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-accent/10 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs font-sans text-muted-foreground">
        <div className="flex items-center gap-2 font-sans">
          <ShieldCheck size={14} className="text-primary font-sans" />
          <span className="font-sans">All internal practical modules accredited by Matrix Root Evaluation Boards.</span>
        </div>
        <div className="font-bold text-foreground font-sans">
          Cleared Component Credits: <span className="text-primary font-sans">{activeSemData.creditsCleared}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar Navigation Pane */}
      <aside className="w-64 hidden lg:flex flex-col border-r border-border bg-card/30 shrink-0 font-sans">
        <div className="p-6 flex items-center gap-3 border-b border-border font-sans">
          <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Logo" width={32} height={32} />
          <span className="font-bold text-lg font-sans">Matrix Root</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto font-sans">
          <SidebarItem icon={<LayoutDashboard size={18} className="font-sans" />} label="Dashboard" onClick={() => router.push('/dashboard')} />
          <SidebarItem icon={<BookOpen size={18} className="font-sans" />} label="My Internships" onClick={() => router.push('/dashboard/internships')} />
          <SidebarItem icon={<TrendingUp size={18} className="font-sans" />} label="Performance" active />
          
          <div className="pt-6 font-sans">
            <SidebarItem icon={<User size={18} className="font-sans" />} label="Profile Settings" onClick={() => router.push('/profile')} />
            <SidebarItem icon={<LogOut size={18} className="font-sans" />} label="Sign Out" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} />
          </div>
        </nav>
      </aside>

      {/* Primary Analytics Content Dashboard */}
      <main className="flex-1 flex flex-col h-full overflow-hidden font-sans">
        <header className="h-20 border-b border-border bg-background/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 font-sans">
          <div className="flex items-center gap-4 font-sans">
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="rounded-xl font-sans">
              <ArrowLeft size={20} className="font-sans" />
            </Button>
            <div className="font-sans">
              <h2 className="text-xl font-bold font-sans">Performance Studio</h2>
              <p className="text-[11px] text-muted-foreground hidden sm:block font-sans">Historical metrics framework scaling 2024–2026 track analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-sans">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-[11px] font-bold text-foreground border border-border font-sans">
              <Award size={14} className="text-amber-500 font-sans" />
              <span>CGPA Tracker Active</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 pb-20 max-w-[1600px] w-full mx-auto font-sans">
          
          {/* Top Performance Status Widget Container */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-sans">
            
            <div className="bg-card border border-border rounded-[2rem] p-6 flex flex-col justify-between shadow-xs font-sans">
              <div className="flex items-center justify-between mb-4 font-sans">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-sans">Cumulative Index</span>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded font-sans">CGPA</span>
              </div>
              <div className="font-sans">
                <p className="text-4xl font-black text-foreground font-sans">9.35</p>
                <p className="text-xs text-muted-foreground mt-1 font-sans">Overall academic status vector</p>
              </div>
              <div className="h-1.5 w-full bg-accent rounded-full mt-4 overflow-hidden font-sans">
                <div className="h-full bg-primary font-sans" style={{ width: '93.5%' }}></div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-[2rem] p-6 flex flex-col justify-between shadow-xs font-sans">
              <div className="flex items-center justify-between mb-4 font-sans">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-sans">Active Term Index</span>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded font-sans">SGPA</span>
              </div>
              <div className="font-sans">
                <p className="text-4xl font-black text-foreground font-sans">{activeSemData.sgpa}</p>
                <p className="text-xs text-muted-foreground mt-1 font-sans">Current target evaluation metric</p>
              </div>
              <div className="h-1.5 w-full bg-accent rounded-full mt-4 overflow-hidden font-sans">
                <div className="h-full bg-emerald-500 font-sans" style={{ width: `${parseFloat(activeSemData.sgpa) * 10}%` }}></div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-[2rem] p-6 flex flex-col justify-between shadow-xs font-sans">
              <div className="flex items-center justify-between mb-4 font-sans">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-sans">Verified Attendance</span>
                <span className="text-[10px] font-bold text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded font-sans">KPI</span>
              </div>
              <div className="font-sans">
                <p className="text-4xl font-black text-foreground font-sans">{activeSemData.attendance}</p>
                <p className="text-xs text-muted-foreground mt-1 font-sans">Industrial workspace presence verification</p>
              </div>
              <div className="h-1.5 w-full bg-accent rounded-full mt-4 overflow-hidden font-sans">
                <div className="h-full bg-sky-500 font-sans" style={{ width: activeSemData.attendance }}></div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-[2rem] p-6 flex flex-col justify-between shadow-xs font-sans">
              <div className="flex items-center justify-between mb-4 font-sans">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-sans">Cleared Component</span>
                <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded font-sans">Credits</span>
              </div>
              <div className="font-sans">
                <p className="text-4xl font-black text-foreground font-sans">{activeSemData.creditsCleared.split('/')[0].trim()}</p>
                <p className="text-xs text-muted-foreground mt-1 font-sans">Accredited study points confirmed</p>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-[11px] font-bold text-emerald-500 font-sans">
                <ShieldCheck size={14} className="font-sans" /> Fully Aligned
              </div>
            </div>

          </div>

          {/* Interactive Term Switcher Navigation Header */}
          <div className="space-y-4 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
              <h3 className="text-lg font-black tracking-tight font-sans">Historical Report Cards (2024–2026)</h3>
              <p className="text-xs text-muted-foreground font-sans">Select term tabs below to parse evaluation data subsets</p>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-sans">
              {RCD.map((sem) => {
                const isSelected = sem.id === activeSemesterId;
                return (
                  <button
                    key={sem.id}
                    onClick={() => setActiveSemesterId(sem.id)}
                    className={`px-5 py-3 rounded-2xl font-bold text-xs shrink-0 transition-all font-sans flex items-center gap-2 ${
                      isSelected 
                        ? "bg-primary text-primary-foreground shadow-md font-black scale-105" 
                        : "bg-card border border-border hover:bg-accent text-foreground"
                    }`}
                  >
                    <Calendar size={14} className={isSelected ? "text-primary-foreground font-sans" : "text-muted-foreground font-sans"} />
                    <span className="font-sans">{sem.term}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-sans ${isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-accent text-muted-foreground"}`}>
                      {sem.sgpa}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Render Subject Evaluation View Table Logic Widget */}
          {rcRender()}

        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all font-sans ${
        active 
        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
        : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
