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
  Calendar,
  CheckCircle2,
  Menu,
  X,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// Static reference data representation reproducing dense historical semestral performance metrics
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

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring" as const, 
      stiffness: 400, 
      damping: 25 
    } 
  },
};

export default function PerformanceReportCardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSemesterId, setActiveSemesterId] = useState("sem-5");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      <div className="flex min-h-screen bg-[#F9F5F0] items-center justify-center font-sans">
        <div className="animate-spin h-8 w-8 border-4 border-[#8B4513] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Currently active report card object binding
  const activeSemData = RCD.find(s => s.id === activeSemesterId) || RCD[0];

  // Table rendering logic engine mapping evaluation variables
  const rcRender = () => (
    <motion.div 
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      key={activeSemesterId}
      className="bg-white border border-[#8B4513]/20 rounded-[12px] overflow-hidden shadow-none font-sans"
    >
      <div className="p-[24px] md:p-[32px] border-b border-[#8B4513]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-[16px] bg-[#F9F5F0]/50">
        <div>
          <div className="flex items-center gap-[8px]">
            <h3 className="text-lg font-medium tracking-[-0.02em] text-[#3D2B1F]">{activeSemData.term} Breakdown</h3>
            <span className="text-[10px] font-medium text-[#8B4513] bg-[#8B4513]/5 px-2 py-0.5 rounded-[12px] border border-[#8B4513]/10">
              {activeSemData.academicYear}
            </span>
          </div>
          <p className="text-xs text-[#3D2B1F]/70 mt-1">Subject-wise evaluation scorecard tracking standard grading metrics</p>
        </div>
        
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] uppercase font-medium text-[#3D2B1F]/60 block tracking-wider">Term Score Status</span>
            <span className="text-xs font-semibold text-emerald-800">{activeSemData.evaluationStatus}</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#8B4513]/10 text-[10px] font-medium uppercase tracking-wider text-[#3D2B1F]/60 bg-[#F9F5F0]/20">
              <th className="p-4 pl-6">Subject Code</th>
              <th className="p-4">Course Title</th>
              <th className="p-4 text-center">Credits</th>
              <th className="p-4 text-center">Internal Evaluation</th>
              <th className="p-4 text-center">External Grade</th>
              <th className="p-4 pr-6 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#8B4513]/5 text-xs">
            {activeSemData.subjects.map((subj) => (
              <tr key={subj.code} className="hover:bg-[#F9F5F0]/30 transition-colors">
                <td className="p-4 pl-6 font-medium text-[#3D2B1F]">
                  <span className="px-2 py-0.5 rounded-[4px] bg-[#8B4513]/5 text-[#8B4513] text-[11px] font-mono border border-[#8B4513]/10">{subj.code}</span>
                </td>
                <td className="p-4 font-normal text-[#3D2B1F] max-w-xs truncate">{subj.title}</td>
                <td className="p-4 text-center font-normal text-[#3D2B1F]/70">{subj.credits}</td>
                <td className="p-4 text-center font-normal text-[#3D2B1F]/70">{subj.internalMarks}</td>
                <td className="p-4 text-center">
                  <span className="font-medium text-[#8B4513] bg-[#8B4513]/5 px-2 py-0.5 rounded-[4px] border border-[#8B4513]/10 text-xs">
                    {subj.externalGrade}
                  </span>
                </td>
                <td className="p-4 pr-6 text-right">
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-[12px] border border-emerald-200">
                    <CheckCircle2 size={10} /> Cleared
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-[#F9F5F0]/30 border-t border-[#8B4513]/10 flex flex-wrap items-center justify-between gap-4 text-xs text-[#3D2B1F]/70">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-[#8B4513]" />
          <span>All internal practical modules accredited by Matrix Root Evaluation Boards.</span>
        </div>
        <div className="font-medium text-[#3D2B1F]">
          Cleared Component Credits: <span className="text-[#8B4513]">{activeSemData.creditsCleared}</span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex h-screen bg-[#F9F5F0] text-[#3D2B1F] overflow-hidden font-sans">
      {/* Sidebar Navigation Pane */}
      <aside className="w-64 hidden lg:flex flex-col border-r border-[#8B4513]/10 bg-white shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-[#8B4513]/10">
          <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Logo" width={32} height={32} />
          <span className="font-medium text-lg text-[#3D2B1F]">Matrix Root</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard Overview" onClick={() => router.push('/dashboard')} />
          <SidebarItem icon={<BookOpen size={18} />} label="My Internships" onClick={() => router.push('/dashboard/internships')} />
          <SidebarItem icon={<TrendingUp size={18} />} label="Performance Metrics" active />
          
          <div className="pt-6">
            <SidebarItem icon={<User size={18} />} label="Member Settings" onClick={() => router.push('/profile')} />
            <SidebarItem icon={<LogOut size={18} />} label="Terminate Session" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} />
          </div>
        </nav>
      </aside>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-[#3D2B1F]/40 backdrop-blur-sm" />
          <motion.aside 
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-0 left-0 bottom-0 w-72 bg-white flex flex-col border-r border-[#8B4513]/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex items-center justify-between border-b border-[#8B4513]/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[8px] bg-[#8B4513]/10 flex items-center justify-center text-[#8B4513]">
                  <GraduationCap size={20} />
                </div>
                <span className="font-bold text-base text-[#3D2B1F]">Matrix Root</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-[#3D2B1F]/40 hover:text-[#3D2B1F]">
                <X size={20} />
              </button>
            </div>
            
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
              <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard Hub" onClick={() => router.push('/dashboard')} />
              <SidebarItem icon={<BookOpen size={18} />} label="Subscribed Tracks" onClick={() => router.push('/dashboard/internships')} />
              <SidebarItem icon={<TrendingUp size={18} />} label="Progress & Grades" active />
              <div className="pt-6">
                <SidebarItem icon={<User size={18} />} label="Profile Setup" onClick={() => router.push('/profile')} />
                <SidebarItem icon={<LogOut size={18} />} label="Sign Out" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} />
              </div>
            </nav>
          </motion.aside>
        </div>
      )}

      {/* Primary Analytics Content Dashboard */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 border-b border-[#8B4513]/10 bg-[#F9F5F0]/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-[#8B4513] hover:bg-[#8B4513]/5 rounded-[8px]"
            >
              <Menu size={20} />
            </button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
              <Button variant="outline" size="icon" onClick={() => router.push('/dashboard')} className="rounded-[12px] h-8 w-8 border-[#8B4513]/20 shadow-none">
                <ArrowLeft size={16} className="text-[#8B4513]" />
              </Button>
            </motion.div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#3D2B1F]">Performance Studio Node</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[12px] bg-[#8B4513]/5 text-[10px] font-medium text-[#8B4513] border border-[#8B4513]/10">
              <Award size={12} />
              <span>CGPA Ledger Synchronized</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-[32px] md:p-[64px] space-y-[48px] pb-20 max-w-[1600px] w-full mx-auto">
          
          {/* Top Performance Status Widget Container */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-[24px]">
            
            <motion.div variants={cardVariants} initial="hidden" animate="visible" className="bg-white border border-[#8B4513]/20 rounded-[12px] p-[24px] flex flex-col justify-between shadow-none">
              <div className="flex items-center justify-between mb-[16px]">
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#3D2B1F]/60">Cumulative Index</span>
                <span className="text-[10px] font-medium text-[#8B4513] bg-[#8B4513]/5 px-2 py-0.5 rounded-[12px] border border-[#8B4513]/10">CGPA</span>
              </div>
              <div>
                <p className="text-3xl font-normal tracking-[-0.02em] text-[#3D2B1F]">9.35</p>
                <p className="text-xs text-[#3D2B1F]/70 mt-1 leading-[1.6]">Overall academic status vector</p>
              </div>
              <div className="h-1 w-full bg-[#F9F5F0] rounded-full mt-[16px] overflow-hidden border border-[#8B4513]/10">
                <div className="h-full bg-[#8B4513]" style={{ width: '93.5%' }}></div>
              </div>
            </motion.div>

            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="bg-white border border-[#8B4513]/20 rounded-[12px] p-[24px] flex flex-col justify-between shadow-none">
              <div className="flex items-center justify-between mb-[16px]">
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#3D2B1F]/60">Active Term Index</span>
                <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-[12px] border border-emerald-200">SGPA</span>
              </div>
              <div>
                <p className="text-3xl font-normal tracking-[-0.02em] text-[#3D2B1F]">{activeSemData.sgpa}</p>
                <p className="text-xs text-[#3D2B1F]/70 mt-1 leading-[1.6]">Current target evaluation metric</p>
              </div>
              <div className="h-1 w-full bg-[#F9F5F0] rounded-full mt-[16px] overflow-hidden border border-[#8B4513]/10">
                <div className="h-full bg-emerald-700" style={{ width: `${parseFloat(activeSemData.sgpa) * 10}%` }}></div>
              </div>
            </motion.div>

            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="bg-white border border-[#8B4513]/20 rounded-[12px] p-[24px] flex flex-col justify-between shadow-none">
              <div className="flex items-center justify-between mb-[16px]">
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#3D2B1F]/60">Verified Attendance</span>
                <span className="text-[10px] font-medium text-[#8B4513] bg-[#8B4513]/5 px-2 py-0.5 rounded-[12px] border border-[#8B4513]/10">KPI</span>
              </div>
              <div>
                <p className="text-3xl font-normal tracking-[-0.02em] text-[#3D2B1F]">{activeSemData.attendance}</p>
                <p className="text-xs text-[#3D2B1F]/70 mt-1 leading-[1.6]">Workspace presence verification</p>
              </div>
              <div className="h-1 w-full bg-[#F9F5F0] rounded-full mt-[16px] overflow-hidden border border-[#8B4513]/10">
                <div className="h-full bg-[#8B4513]" style={{ width: activeSemData.attendance }}></div>
              </div>
            </motion.div>

            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="bg-white border border-[#8B4513]/20 rounded-[12px] p-[24px] flex flex-col justify-between shadow-none">
              <div className="flex items-center justify-between mb-[16px]">
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#3D2B1F]/60">Cleared Component</span>
                <span className="text-[10px] font-medium text-[#8B4513] bg-[#8B4513]/5 px-2 py-0.5 rounded-[12px] border border-[#8B4513]/10">Credits</span>
              </div>
              <div>
                <p className="text-3xl font-normal tracking-[-0.02em] text-[#3D2B1F]">{activeSemData.creditsCleared.split('/')[0].trim()}</p>
                <p className="text-xs text-[#3D2B1F]/70 mt-1 leading-[1.6]">Accredited study points confirmed</p>
              </div>
              <div className="flex items-center gap-1 mt-[16px] text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-[12px] w-fit border border-emerald-200">
                <ShieldCheck size={12} /> Fully Aligned
              </div>
            </motion.div>

          </div>

          {/* Interactive Term Switcher Navigation Header */}
          <div className="space-y-[16px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[8px]">
              <h3 className="text-xl font-normal tracking-[-0.02em] text-[#3D2B1F]">Historical Report Ledgers</h3>
              <p className="text-xs text-[#3D2B1F]/70">Select term tabs below to parse evaluation subsets</p>
            </div>

            <div className="flex items-center gap-[16px] overflow-x-auto pb-2 scrollbar-none border-b border-[#8B4513]/10">
              {RCD.map((sem) => {
                const isSelected = sem.id === activeSemesterId;
                return (
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    key={sem.id}
                    onClick={() => setActiveSemesterId(sem.id)}
                    className={`pb-3 text-xs font-medium transition-colors relative shrink-0 flex items-center gap-2 ${
                      isSelected 
                        ? "text-[#8B4513] font-semibold" 
                        : "text-[#3D2B1F]/60 hover:text-[#3D2B1F]"
                    }`}
                  >
                    <Calendar size={12} className={isSelected ? "text-[#8B4513]" : "text-[#3D2B1F]/40"} />
                    <span>{sem.term}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-[8px] border ${isSelected ? "bg-[#8B4513]/5 text-[#8B4513] border-[#8B4513]/20" : "bg-white text-[#3D2B1F]/60 border-[#8B4513]/10"}`}>
                      {sem.sgpa}
                    </span>
                    {isSelected && (
                      <motion.div 
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#8B4513]" 
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      />
                    )}
                  </motion.button>
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
    <motion.button 
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 min-h-[40px] rounded-[12px] text-xs font-medium transition-colors ${
        active 
        ? "bg-[#8B4513]/5 text-[#8B4513] border border-[#8B4513]/10 font-semibold" 
        : "text-[#3D2B1F]/70 hover:bg-[#8B4513]/5 hover:text-[#3D2B1F]"
      }`}
    >
      <span className="text-[#8B4513]">{icon}</span>
      {label}
    </motion.button>
  );
}
