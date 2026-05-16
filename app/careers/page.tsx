"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Code, 
  Brain, 
  Settings, 
  Clock, 
  Layers, 
  BadgeCheck, 
  ArrowRight,
  Sparkles,
  ChevronRight,
  Globe,
  Terminal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { getYouTubeThumbnail } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

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

export default function CareersPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase
        .from("courses")
        .select("*, departments(name, slug)");
      
      if (data) {
        setCourses(data);
      }
      setLoading(false);
    };

    fetchCourses();
  }, []);

  const categories = [
    { id: "all", name: "All Internship Tracks", icon: Layers },
    { id: "it", name: "Web & Software", icon: Code },
    { id: "eee", name: "AI Automation", icon: Brain },
    { id: "mech", name: "Core Systems", icon: Settings },
  ];

  const filteredCourses = selectedCategory === "all" 
    ? courses 
    : courses.filter(c => c.departments?.slug?.includes(selectedCategory));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F5F0] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#8B4513] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Pre-configured structured tracks exactly as instructed under point 3 ("Careers Page")
  const featuredTracks = [
    {
      id: "featured-fullstack",
      title: "Full-Stack Developer Intern (Human-First)",
      department: "Web Development",
      description: "Master the foundations of the modern web before moving to AI-assisted workflows.",
      icon: Globe,
      duration: "8-Week Internship Track"
    },
    {
      id: "featured-ai",
      title: "AI Solutions Engineer Intern",
      department: "Artificial Intelligence",
      description: "Learn to build and deploy AI agents for real-world business automation.",
      icon: Brain,
      duration: "8-Week Internship Track"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F9F5F0] text-[#3D2B1F] font-sans overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-[64px] md:py-[112px] overflow-hidden border-b border-[#8B4513]/10">
        {/* Subtle geometric structural patterns */}
        <div className="absolute top-0 right-0 w-96 h-96 opacity-5 pointer-events-none transform translate-x-1/3 -translate-y-1/3">
          <svg viewBox="0 0 100 100" className="w-full h-full text-[#8B4513] stroke-current stroke-1 fill-none animate-spin-slow">
            <circle cx="50" cy="50" r="45" />
            <circle cx="50" cy="50" r="25" />
            <line x1="50" y1="0" x2="50" y2="100" />
            <line x1="0" y1="50" x2="100" y2="50" />
          </svg>
        </div>

        <div className="container mx-auto max-w-6xl px-4 relative z-10">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8B4513]/5 border border-[#8B4513]/10 text-xs font-bold text-[#8B4513] mb-[24px]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              PRODUCTION-READY ECOSYSTEM
            </motion.div>
            
            {/* Header mapped precisely as instructed */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 25, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold tracking-tight text-[#3D2B1F] leading-[1.15] mb-[24px]"
            >
              Join the Matrix Root <br />
              <span className="text-[#8B4513]">Ecosystem.</span>
            </motion.h1>
            
            {/* Section 1 Description mapped precisely as instructed */}
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 25, delay: 0.2 }}
              className="text-base md:text-lg text-[#3D2B1F]/80 leading-[1.6] font-medium mb-[40px]"
            >
              We don&apos;t just teach; we integrate. Our 8-week internship tracks are designed to turn students into production-ready developers.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring" as const, stiffness: 400, damping: 25 }} className="inline-block">
                <Button asChild size="lg" className="rounded-[8px] px-[32px] h-[48px] font-bold text-sm bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] shadow-none">
                  <Link href="#listings">Explore Internship Listings <ArrowRight className="ml-2 h-4 w-4 text-[#8B4513]" /></Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Key Integration Features */}
      <section className="py-[64px] border-b border-[#8B4513]/10 bg-[#F9F5F0]">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
            {[
              { icon: Clock, title: "8-Week Structured Tracks", desc: "Gain direct exposure to highly structured enterprise production setups." },
              { icon: Layers, title: "Deliverable Integration", desc: "Push code directly to verified solution endpoints and live deployments." },
              { icon: BadgeCheck, title: "MSME Recognition", desc: "Acquire certified performance statements from a recognized corporate entity." },
            ].map((f, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring" as const, stiffness: 400, damping: 25, delay: i * 0.1 }}
                className="flex items-start gap-4 p-[24px] bg-white border border-[#8B4513]/15 rounded-[12px] hover:border-[#8B4513]/40 transition-colors group shadow-none"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#8B4513]/5 text-[#8B4513] group-hover:scale-105 transition-transform font-bold">
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#3D2B1F] mb-[6px]">{f.title}</h3>
                  <p className="text-xs text-[#3D2B1F]/80 leading-[1.6] font-medium">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Internship Listings Section */}
      <section id="listings" className="py-[64px] md:py-[112px]">
        <div className="container mx-auto max-w-6xl px-4 space-y-[64px]">
          
          {/* Section Header */}
          <div className="space-y-2 border-b border-[#8B4513]/10 pb-[16px]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8B4513]">Training-cum-Internships</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#3D2B1F]">Core Internship Tracks</h2>
            <p className="text-xs md:text-sm text-[#3D2B1F]/80 font-medium">Select your specialization to initiate application parameters and launch integration workflows.</p>
          </div>

          {/* Explicitly instructed listings showcase */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-[32px]"
          >
            {featuredTracks.map((track) => {
              const IconComp = track.icon;
              return (
                <motion.div 
                  variants={cardVariants}
                  key={track.id}
                  className="group relative flex flex-col bg-white border border-[#8B4513]/20 rounded-[12px] p-[32px] hover:border-[#8B4513]/40 transition-colors shadow-none overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B4513]/5 rounded-bl-full pointer-events-none group-hover:scale-105 transition-transform duration-500" />

                  <div className="border-b border-[#8B4513]/10 pb-[12px] mb-[16px] flex items-center justify-between relative z-10">
                    <span className="text-[10px] font-bold text-[#8B4513] uppercase tracking-wider bg-[#8B4513]/5 border border-[#8B4513]/10 px-2.5 py-0.5 rounded-[6px]">
                      {track.department}
                    </span>
                    <span className="text-[10px] font-bold text-[#3D2B1F]/60 flex items-center gap-1">
                      <Clock size={12} className="text-[#8B4513]" /> {track.duration}
                    </span>
                  </div>

                  <div className="flex-1 space-y-[12px] mb-[32px] relative z-10">
                    <div className="flex items-center gap-2">
                      <IconComp className="h-5 w-5 text-[#8B4513] shrink-0" />
                      <h3 className="text-xl font-bold text-[#3D2B1F] leading-tight group-hover:text-[#8B4513] transition-colors">
                        {track.title}
                      </h3>
                    </div>
                    
                    <p className="text-xs md:text-sm text-[#3D2B1F]/90 leading-[1.6] font-medium pt-1">
                      {track.description}
                    </p>
                    
                    <div className="pt-[12px] space-y-1.5 border-t border-[#8B4513]/5 mt-4">
                      {["Human-First Coding Logic", "Production Deployment Access", "Senior Engineering Verification"].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[10px] font-bold text-[#3D2B1F]/60 uppercase tracking-wider">
                          <ChevronRight className="h-3 w-3 text-[#8B4513]" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring" as const, stiffness: 400, damping: 25 }} className="relative z-10 mt-auto pt-2">
                    <Button 
                      asChild 
                      className="w-full h-11 rounded-[8px] font-bold text-xs bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] shadow-none flex items-center justify-center gap-1.5"
                    >
                      <Link href={`/signup?internship=${track.id}`}>
                        Apply for Internship <ArrowRight size={14} className="text-[#8B4513]" />
                      </Link>
                    </Button>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Dynamically Loaded Program Offerings section */}
          {courses.length > 0 && (
            <div className="pt-[32px] border-t border-[#8B4513]/10 space-y-[32px]">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-[16px]">
                <div>
                  <h3 className="text-xl font-bold text-[#3D2B1F]">Additional Stream Integrations</h3>
                  <p className="text-xs text-[#3D2B1F]/70 font-medium">Parallel technological execution modules mapped to local database parameters.</p>
                </div>
                <div className="flex flex-wrap gap-[8px]">
                  {categories.map((cat) => (
                    <button 
                      key={cat.id} 
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-[8px] border text-xs font-bold transition-colors shadow-none ${
                        selectedCategory === cat.id 
                          ? "border-[#8B4513]/30 bg-[#8B4513]/5 text-[#8B4513]" 
                          : "border-[#8B4513]/10 bg-white text-[#3D2B1F]/70 hover:border-[#8B4513]/20 hover:text-[#3D2B1F]"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                key={selectedCategory}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]"
              >
                {filteredCourses.map((course) => (
                  <motion.div 
                    variants={cardVariants}
                    key={course.id}
                    className="group relative flex flex-col bg-white border border-[#8B4513]/20 rounded-[12px] p-[24px] hover:border-[#8B4513]/40 transition-colors shadow-none overflow-hidden"
                  >
                    {course.video_url && (
                      <div className="h-32 w-full rounded-[8px] overflow-hidden mb-[16px] border border-[#8B4513]/10 relative bg-[#F9F5F0] shrink-0">
                        <img src={getYouTubeThumbnail(course.video_url)} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}

                    <div className="border-b border-[#8B4513]/10 pb-[12px] mb-[12px] flex items-center justify-between">
                      <span className="text-[9px] font-bold text-[#8B4513] uppercase tracking-wider bg-[#8B4513]/5 border border-[#8B4513]/10 px-2 py-0.5 rounded-[4px]">
                        {course.departments?.name || "Ecosystem"}
                      </span>
                      <Terminal className="w-3.5 h-3.5 text-[#8B4513]/60" />
                    </div>

                    <div className="flex-1 space-y-[8px] mb-[24px]">
                      <h4 className="text-base font-bold text-[#3D2B1F] leading-tight group-hover:text-[#8B4513] transition-colors line-clamp-2">
                        {course.title}
                      </h4>
                      <p className="text-xs text-[#3D2B1F]/80 leading-[1.6] line-clamp-2 font-medium">
                        {course.description}
                      </p>
                    </div>

                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring" as const, stiffness: 400, damping: 25 }} className="mt-auto">
                      <Button 
                        asChild 
                        className="w-full h-9 rounded-[8px] font-bold text-xs bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] shadow-none"
                      >
                        <Link href={`/signup?course=${course.id}`}>
                          Apply for Internship
                        </Link>
                      </Button>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

        </div>
      </section>

      <Footer />
    </div>
  );
}
