"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Code, 
  Zap, 
  Settings, 
  Clock, 
  Layers, 
  BadgeCheck, 
  ArrowRight,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
    { id: "all", name: "All Offerings", icon: Layers },
    { id: "it", name: "Software Systems", icon: Code },
    { id: "eee", name: "Embedded Logic", icon: Zap },
    { id: "mech", name: "Mechanical Core", icon: Settings },
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

  return (
    <div className="min-h-screen bg-[#F9F5F0] text-[#3D2B1F] font-sans overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-[64px] md:py-[112px] overflow-hidden border-b border-[#8B4513]/10">
        {/* Subtle geometric structural vector compass lines in background */}
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
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[12px] bg-[#8B4513]/5 border border-[#8B4513]/10 text-xs font-medium text-[#8B4513] mb-[24px]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              PROFESSIONAL RESIDENCY PROGRAM
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 25, delay: 0.1 }}
              className="text-4xl md:text-6xl font-normal tracking-[-0.02em] text-[#3D2B1F] leading-[1.1] mb-[24px]"
            >
              Admissions & <br />
              <span className="font-serif italic">Operational Tracks</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 25, delay: 0.2 }}
              className="text-base md:text-lg text-[#3D2B1F]/80 leading-[1.6] font-normal mb-[40px]"
            >
              Real enterprise assignments. Industrial evaluation standards. Verifiable academic credentials. Review available functional allocations below to initiate residency parameters.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring" as const, stiffness: 400, damping: 25 }} className="inline-block">
                <Button asChild size="lg" className="rounded-[12px] px-[32px] h-[48px] font-medium bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] shadow-none">
                  <Link href="#openings">Inspect Modules <ArrowRight className="ml-2 h-4 w-4 text-[#8B4513]" /></Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-[64px] border-b border-[#8B4513]/10 bg-[#F9F5F0]">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
            {[
              { icon: Clock, title: "Self-Paced Execution", desc: "Assimilate complex paradigms at customized learning velocities." },
              { icon: Layers, title: "Artifact Centric Architecture", desc: "Construct production infrastructure components directly." },
              { icon: BadgeCheck, title: "Verifiable Ledgers", desc: "Secure public lookup nodes authenticating individual credential issuance." },
            ].map((f, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring" as const, stiffness: 400, damping: 25, delay: i * 0.1 }}
                className="flex items-start gap-4 p-[24px] bg-white border border-[#8B4513]/10 rounded-[12px] hover:border-[#8B4513]/30 transition-colors group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#8B4513]/5 text-[#8B4513] group-hover:scale-110 transition-transform">
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-base tracking-[-0.02em] text-[#3D2B1F] mb-[8px]">{f.title}</h3>
                  <p className="text-xs text-[#3D2B1F]/80 leading-[1.6]">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Openings */}
      <section id="openings" className="py-[64px] md:py-[112px]">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-[32px] mb-[48px]">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-normal tracking-[-0.02em] text-[#3D2B1F]">Allocated Programs</h2>
              <p className="text-sm text-[#3D2B1F]/80 font-normal">Select an academic track to initiate identity parameters.</p>
            </div>
            <div className="flex flex-wrap gap-[8px]">
              {categories.map((cat) => (
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
                  key={cat.id} 
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-[12px] border text-xs font-medium transition-colors shadow-none ${
                    selectedCategory === cat.id 
                      ? "border-[#8B4513]/30 bg-[#8B4513]/5 text-[#8B4513] font-semibold" 
                      : "border-[#8B4513]/10 bg-white text-[#3D2B1F]/70 hover:border-[#8B4513]/20 hover:text-[#3D2B1F]"
                  }`}
                >
                  {cat.name}
                </motion.button>
              ))}
            </div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={selectedCategory}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px] min-h-[300px]"
          >
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => {
                return (
                  <motion.div 
                    variants={cardVariants}
                    key={course.id}
                    className="group relative flex flex-col bg-white border border-[#8B4513]/20 rounded-[12px] p-[32px] hover:border-[#8B4513]/40 transition-colors shadow-none overflow-hidden"
                  >
                    {/* Decorative hover graphic wire inside card */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#8B4513]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />

                    {course.video_url && (
                      <div className="h-40 w-full rounded-[8px] overflow-hidden mb-[16px] border border-[#8B4513]/10 relative bg-[#F9F5F0] shrink-0 z-10">
                        <img src={course.video_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}

                    <div className="border-b border-[#8B4513]/10 pb-[16px] mb-[16px] flex items-center justify-between relative z-10">
                      <span className="text-[10px] font-medium text-[#8B4513] uppercase tracking-wider bg-[#8B4513]/5 border border-[#8B4513]/10 px-2 py-0.5 rounded-[12px]">
                        {course.departments?.name || "Foundational"}
                      </span>
                      <Code className="w-4 h-4 text-[#8B4513]/60" />
                    </div>

                    <div className="flex-1 space-y-[16px] mb-[32px] relative z-10">
                      <h3 className="text-lg font-medium tracking-[-0.02em] text-[#3D2B1F] leading-tight group-hover:text-[#8B4513] transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-[#3D2B1F]/80 leading-[1.6] line-clamp-3">
                        {course.description || "Industry-standard professional training track for verifiable architectural residency."}
                      </p>
                      
                      <ul className="space-y-1 pt-[8px]">
                        {["Self-Paced Execution", "Artifact Focused", "Public Signature"].map((item, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 text-[10px] font-medium text-[#3D2B1F]/60 uppercase tracking-wider">
                            <ChevronRight className="h-3 w-3 text-[#8B4513]" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring" as const, stiffness: 400, damping: 25 }} className="relative z-10 mt-auto">
                      <Button 
                        asChild 
                        className="w-full h-10 rounded-[12px] font-medium text-xs bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] shadow-none"
                      >
                        <Link href={`/signup?course=${course.id}`}>
                          Initiate Application <ArrowRight className="ml-2 h-3.5 w-3.5 text-[#8B4513]" />
                        </Link>
                      </Button>
                    </motion.div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div variants={cardVariants} className="col-span-full flex flex-col items-center justify-center py-[64px] text-center bg-white border border-[#8B4513]/10 rounded-[12px]">
                <div className="w-10 h-10 bg-[#8B4513]/5 rounded-[12px] flex items-center justify-center border border-[#8B4513]/10 mb-[16px]">
                  <Layers className="h-5 w-5 text-[#8B4513]" />
                </div>
                <h3 className="text-base font-normal tracking-[-0.02em] text-[#3D2B1F]">Parameters Exhausted</h3>
                <p className="text-xs text-[#3D2B1F]/80 max-w-xs mt-1">No operational slots assigned for targeted domain query.</p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring" as const, stiffness: 400, damping: 25 }} className="mt-[24px]">
                  <Button variant="outline" size="sm" className="rounded-[12px] border-[#8B4513]/20 shadow-none text-xs" onClick={() => setSelectedCategory("all")}>
                    Reset Constraints
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
