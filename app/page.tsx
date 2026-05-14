"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  Brain, 
  Globe, 
  Terminal, 
  Award,
  BookOpen,
  CheckCircle2,
  Users,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F9F5F0] text-[#3D2B1F] overflow-hidden font-sans">
      <Navbar />
      <Hero />
      <PremiumTicker />
      <Services />
      <CurriculumShowcase />
      <ExcellenceSection />
      <CTASection />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative py-[64px] md:py-[112px] bg-[#F9F5F0] border-b border-[#8B4513]/10 overflow-hidden">
      {/* Subtle foundational wireframe backdrop grid patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="edtechGrid" width="64" height="64" patternUnits="userSpaceOnUse">
              <path d="M 64 0 L 0 0 0 64" fill="none" stroke="#8B4513" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#edtechGrid)" />
        </svg>
      </div>

      <div className="container relative mx-auto max-w-6xl px-4 text-center z-10">
        {/* Trust Badge near Hero section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8B4513]/5 border border-[#8B4513]/10 text-xs font-bold text-[#8B4513] mb-[32px]"
        >
          <ShieldCheck className="h-4 w-4 text-[#8B4513]" />
          A Government Registered MSME Enterprise (UDYAM-TS-31-0053124)
        </motion.div>
        
        {/* Trust-Building Hook Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring" as const, stiffness: 400, damping: 25, delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold tracking-tight text-[#3D2B1F] leading-[1.15] mb-[24px] max-w-5xl mx-auto"
        >
          Building Scalable Digital <br />
          <span className="text-[#8B4513] relative">
            Infrastructure for the Future.
            <motion.span 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              className="absolute bottom-0 left-0 w-full h-[3px] bg-[#D2B48C] origin-left -z-10"
            />
          </span>
        </motion.h1>

        {/* Actionable Sub-headline */}
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring" as const, stiffness: 400, damping: 25, delay: 0.2 }}
          className="text-base md:text-lg text-[#3D2B1F]/80 leading-[1.6] max-w-3xl mx-auto font-medium mb-[48px]"
        >
          We provide enterprise-grade web development, AI automation, and custom software solutions designed for business growth.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring" as const, stiffness: 400, damping: 25, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-[16px]"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}>
            <Button asChild size="lg" className="bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] rounded-[8px] px-[32px] h-[48px] font-bold text-sm shadow-none">
              <Link href="/#services">Explore Services</Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}>
            <Button asChild size="lg" variant="outline" className="border-[#8B4513]/20 bg-white text-[#3D2B1F] hover:bg-[#F9F5F0] rounded-[8px] px-[32px] h-[48px] font-bold text-sm shadow-none">
              <Link href="/careers">Ecosystem & Careers</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function PremiumTicker() {
  const tickerItems = [
    "✦ ENTERPRISE WEB PORTALS",
    "✦ CUSTOM AI AGENTS",
    "✦ BACKEND SYSTEM ARCHITECTURE",
    "✦ SUPABASE & SQL SCHEMAS",
    "✦ HIGH-PERFORMANCE INFRASTRUCTURE",
    "✦ VERIFIABLE BUSINESS RESULTS"
  ];

  return (
    <div className="w-full overflow-hidden bg-white border-b border-[#8B4513]/10 py-[16px] select-none">
      <div className="flex whitespace-nowrap">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }} 
          transition={{ ease: "linear", duration: 30, repeat: Infinity }}
          className="flex gap-[64px] text-xs font-bold tracking-[0.15em] uppercase text-[#3D2B1F]/70 pr-[64px]"
        >
          {tickerItems.concat(tickerItems).map((item, idx) => (
            <span key={idx} className="hover:text-[#8B4513] transition-colors cursor-default">
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function Services() {
  // Configured perfectly to list "The Results we deliver" as instructed under point 2 ("Services Page")
  const services = [
    { 
      title: "Web & App Development", 
      icon: Globe, 
      desc: "From MVPs to high-performance enterprise portals. We use Next.js and Vercel to ensure your business is fast, secure, and globally accessible.",
      graphic: (
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#8B4513]/10 stroke-current stroke-[1.5] fill-none">
          <circle cx="50" cy="50" r="40" strokeDasharray="4 4" />
          <line x1="10" y1="50" x2="90" y2="50" />
          <line x1="50" y1="10" x2="50" y2="90" />
        </svg>
      )
    },
    { 
      title: "AI & Business Automation", 
      icon: Brain, 
      desc: "Eliminate manual grunt work. We build custom AI agents and automated workflows that help your team focus on high-value tasks.",
      graphic: (
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#8B4513]/10 stroke-current stroke-[1.5] fill-none">
          <polygon points="50,10 90,85 10,85" />
          <circle cx="50" cy="60" r="15" />
        </svg>
      )
    },
    { 
      title: "Technical Consulting", 
      icon: Terminal, 
      desc: "Architecting robust backend systems and database schemas (SQL/Supabase) to ensure your data is scalable and secure.",
      graphic: (
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#8B4513]/10 stroke-current stroke-[1.5] fill-none">
          <rect x="20" y="20" width="60" height="60" rx="8" />
          <line x1="30" y1="40" x2="50" y2="40" />
          <line x1="30" y1="60" x2="70" y2="60" />
        </svg>
      )
    }
  ];

  return (
    <section id="services" className="py-[64px] md:py-[112px] bg-[#F9F5F0] border-b border-[#8B4513]/10">
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
          className="text-center max-w-2xl mx-auto mb-[64px]"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#3D2B1F] mb-[16px]">
            The Results We Deliver
          </h2>
          <p className="text-sm md:text-base text-[#3D2B1F]/80 leading-[1.6] font-medium">
            Robust deliverables architected to accelerate throughput and securely scale core digital interfaces.
          </p>
        </motion.div>

        <div className="grid gap-[24px] md:grid-cols-3">
          {services.map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 25, delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="group relative bg-white border border-[#8B4513]/15 rounded-[12px] p-[32px] overflow-hidden hover:border-[#8B4513]/40 transition-colors shadow-none flex flex-col justify-between"
            >
              {/* Graphical animated vector background drawn on hover */}
              <div className="absolute -right-12 -bottom-12 w-48 h-48 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none transform group-hover:rotate-12 transition-transform">
                {s.graphic}
              </div>

              <div className="relative z-10 flex-1">
                <div className="h-10 w-10 rounded-[8px] bg-[#8B4513]/5 flex items-center justify-center text-[#8B4513] mb-[24px] group-hover:scale-105 transition-transform duration-300 font-bold">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-[#3D2B1F] mb-[12px] group-hover:text-[#8B4513] transition-colors leading-tight">
                  {s.title}
                </h3>
                <p className="text-xs text-[#3D2B1F]/80 leading-[1.6] font-medium">
                  {s.desc}
                </p>
              </div>
              
              <div className="relative z-10 pt-[16px]">
                {/* Micro line indicator expanding below card content */}
                <div className="w-0 h-[2px] bg-[#8B4513] transition-all duration-300 group-hover:w-12 rounded-full" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CurriculumShowcase() {
  return (
    <section className="py-[64px] md:py-[112px] bg-[#F9F5F0] border-b border-[#8B4513]/10">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid md:grid-cols-2 gap-[48px] items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
            className="space-y-[24px]"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-[#8B4513]">
              Ecosystem Integration
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#3D2B1F] leading-[1.2]">
              Join the Matrix Root Ecosystem
            </h2>
            <p className="text-xs md:text-sm text-[#3D2B1F]/80 leading-[1.6] font-medium">
              We don&apos;t just teach; we integrate. Our 8-week internship tracks are designed to turn students into production-ready developers capable of deploying real full-stack interfaces and scalable AI automation.
            </p>
            <div className="pt-[8px]">
              <Link 
                href="/careers" 
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8B4513] group py-1"
              >
                Apply for Internship Tracks 
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ type: "spring" as const, stiffness: 400, damping: 25, delay: 0.2 }}
            className="relative bg-white border border-[#8B4513]/20 rounded-[12px] p-[40px] space-y-[20px] overflow-hidden group hover:border-[#8B4513]/40 transition-colors shadow-none"
          >
            {/* Architectural accent ring graphic inside container */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B4513]/5 rounded-bl-full pointer-events-none group-hover:scale-105 transition-transform duration-500" />

            <div className="border-b border-[#8B4513]/10 pb-[12px] flex items-center justify-between relative z-10">
              <span className="text-xs font-bold text-[#3D2B1F]/60 flex items-center gap-1.5"><BookOpen size={14} /> Full-Stack Track</span>
              <span className="text-xs font-bold text-[#3D2B1F]">Modern Foundations</span>
            </div>
            <div className="border-b border-[#8B4513]/10 pb-[12px] flex items-center justify-between relative z-10">
              <span className="text-xs font-bold text-[#3D2B1F]/60 flex items-center gap-1.5"><Award size={14} /> AI Solutions Track</span>
              <span className="text-xs font-bold text-[#3D2B1F]">Applied Automation</span>
            </div>
            <div className="flex items-center justify-between pt-[4px] relative z-10">
              <span className="text-xs font-bold text-[#3D2B1F]/60 flex items-center gap-1.5"><CheckCircle2 size={14} /> Enterprise Standing</span>
              <span className="text-xs font-bold text-[#8B4513]">Govt Registered MSME</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ExcellenceSection() {
  return (
    <section className="py-[48px] md:py-[80px] bg-[#F9F5F0] border-b border-[#8B4513]/10">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[24px]">
          {[
            { label: "Government Registry", value: "MSME Certified" },
            { label: "Target Outcomes", value: "Production-Ready" },
            { label: "Architecture", value: "Next.js & Vercel" },
            { label: "Automation Layer", value: "Custom AI Agents" },
          ].map((s, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 25, delay: i * 0.1 }}
              className="text-center border-r last:border-0 border-[#8B4513]/10 px-[16px] group"
            >
              <div className="text-xl md:text-2xl font-bold text-[#3D2B1F] mb-[6px] group-hover:text-[#8B4513] transition-colors">
                {s.value}
              </div>
              <div className="text-[9px] font-bold text-[#3D2B1F]/60 uppercase tracking-wider">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-[64px] md:py-[112px] bg-[#F9F5F0]">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
          className="bg-white border border-[#8B4513]/20 rounded-[12px] p-[40px] md:p-[64px]"
        >
          <h2 className="text-2xl md:text-4xl font-bold text-[#3D2B1F] mb-[12px]">
            Kickstart Business Integration
          </h2>
          <p className="text-xs md:text-sm text-[#3D2B1F]/80 leading-[1.6] max-w-lg mx-auto mb-[32px] font-medium">
            Contact us today to deploy custom full-stack solutions or enroll talent directly into production-ready internship tracks.
          </p>
          <div className="flex flex-wrap justify-center gap-[16px]">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}>
              <Button asChild size="lg" className="bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] rounded-[8px] px-[32px] h-[44px] font-bold text-xs shadow-none">
                <Link href="/careers">Apply for Internship</Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}>
              <Button asChild size="lg" variant="outline" className="border-[#8B4513]/20 bg-white text-[#3D2B1F] hover:bg-[#F9F5F0] rounded-[8px] px-[32px] h-[44px] font-bold text-xs shadow-none">
                <Link href="/login">Access Portal</Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
