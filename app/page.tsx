"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  Brain, 
  Globe, 
  Terminal, 
  Award,
  Compass,
  Layers,
  Cpu
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
      {/* Absolute decorative graphical wireframe mesh lines in the background */}
      <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="premiumGrid" width="64" height="64" patternUnits="userSpaceOnUse">
              <path d="M 64 0 L 0 0 0 64" fill="none" stroke="#8B4513" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#premiumGrid)" />
        </svg>
      </div>

      <div className="container relative mx-auto max-w-6xl px-4 text-center z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[12px] bg-[#8B4513]/5 border border-[#8B4513]/10 text-xs font-medium text-[#8B4513] mb-[32px]"
        >
          <Award className="h-3.5 w-3.5 animate-pulse" />
          FOUNDATIONAL EXCELLENCE & MASTERY
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring" as const, stiffness: 400, damping: 25, delay: 0.1 }}
          className="text-4xl md:text-7xl font-normal tracking-[-0.02em] text-[#3D2B1F] leading-[1.1] mb-[24px] max-w-5xl mx-auto"
        >
          Timeless Craftsmanship in <br />
          <span className="font-serif italic relative">
            Digital Engineering
            <motion.span 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              className="absolute bottom-1 left-0 w-full h-[1.5px] bg-[#8B4513]/30 origin-left"
            />
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring" as const, stiffness: 400, damping: 25, delay: 0.2 }}
          className="text-base md:text-lg text-[#3D2B1F]/80 leading-[1.6] max-w-2xl mx-auto font-normal mb-[48px]"
        >
          An elite institution dedicated to uncompromising software architecture, rigorous deep-learning methodologies, and verified professional mastery.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring" as const, stiffness: 400, damping: 25, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-[16px]"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}>
            <Button asChild size="lg" className="bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] rounded-[12px] px-[32px] h-[48px] font-medium shadow-none">
              <Link href="/#services">Explore Curriculum</Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}>
            <Button asChild size="lg" variant="outline" className="border-[#8B4513]/20 bg-white text-[#3D2B1F] hover:bg-[#F9F5F0] rounded-[12px] px-[32px] h-[48px] font-medium shadow-none">
              <Link href="/careers">Admissions</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function PremiumTicker() {
  const tickerItems = [
    "✦ DIGITAL CRAFTSMANSHIP",
    "✦ ABSOLUTE ARTIFACT MASTERY",
    "✦ CLOUD NATIVE KERNELS",
    "✦ MISSION-CRITICAL SCALABILITY",
    "✦ DISTRIBUTED LEDGER MECHANICS",
    "✦ PRECISE SYSTEMIC ARCHITECTURE"
  ];

  return (
    <div className="w-full overflow-hidden bg-white border-b border-[#8B4513]/10 py-[16px] select-none">
      <div className="flex whitespace-nowrap">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }} 
          transition={{ ease: "linear", duration: 30, repeat: Infinity }}
          className="flex gap-[64px] text-xs font-medium tracking-[0.2em] uppercase text-[#3D2B1F]/60 pr-[64px]"
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
  const services = [
    { 
      title: "Enterprise Architecture", 
      icon: Globe, 
      desc: "High-integrity distributed systems designed for mission-critical reliability and horizontal scalability.",
      graphic: (
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#8B4513]/10 stroke-current stroke-[1.5] fill-none">
          <circle cx="50" cy="50" r="40" strokeDasharray="4 4" />
          <line x1="10" y1="50" x2="90" y2="50" />
          <line x1="50" y1="10" x2="50" y2="90" />
        </svg>
      )
    },
    { 
      title: "Artificial Intelligence", 
      icon: Brain, 
      desc: "Advanced neural optimization and foundational automation guided by peerless scientific rigour.",
      graphic: (
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#8B4513]/10 stroke-current stroke-[1.5] fill-none">
          <polygon points="50,10 90,85 10,85" />
          <circle cx="50" cy="60" r="15" />
        </svg>
      )
    },
    { 
      title: "Foundational Systems", 
      icon: Terminal, 
      desc: "Bespoke kernel-level logic and high-performance computation structures built with timeless clarity.",
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
          <h2 className="text-3xl md:text-4xl font-normal tracking-[-0.02em] text-[#3D2B1F] mb-[16px]">
            Areas of Expertise
          </h2>
          <p className="text-sm md:text-base text-[#3D2B1F]/80 leading-[1.6]">
            Uncompromising depth across three core disciplines of computing.
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
              className="group relative bg-white border border-[#8B4513]/20 rounded-[12px] p-[40px] overflow-hidden hover:border-[#8B4513]/40 transition-colors"
            >
              {/* Graphical animated vector background drawn on hover */}
              <div className="absolute -right-12 -bottom-12 w-48 h-48 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none transform group-hover:rotate-12 transition-transform">
                {s.graphic}
              </div>

              <div className="relative z-10">
                <div className="h-10 w-10 rounded-[12px] bg-[#8B4513]/5 flex items-center justify-center text-[#8B4513] mb-[32px] group-hover:scale-110 transition-transform duration-300">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-medium tracking-[-0.02em] text-[#3D2B1F] mb-[16px] group-hover:text-[#8B4513] transition-colors">
                  {s.title}
                </h3>
                <p className="text-sm text-[#3D2B1F]/80 leading-[1.6]">
                  {s.desc}
                </p>
                
                {/* Micro line indicator expanding below card title */}
                <div className="w-0 h-[1.5px] bg-[#8B4513] mt-[24px] transition-all duration-300 group-hover:w-12" />
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
            <div className="text-xs font-medium uppercase tracking-wider text-[#8B4513]">
              The Matrix Pedagogy
            </div>
            <h2 className="text-3xl md:text-5xl font-normal tracking-[-0.02em] text-[#3D2B1F] leading-[1.2]">
              Clarity over Complexity
            </h2>
            <p className="text-sm md:text-base text-[#3D2B1F]/80 leading-[1.6]">
              We believe true premium engineering is quiet. It functions flawlessly without requiring loud interfaces or convoluted abstractions. Every syllabus module is designed to foster profound mechanical understanding.
            </p>
            <div className="pt-[8px]">
              <Link 
                href="/careers" 
                className="inline-flex items-center gap-2 text-xs font-medium text-[#8B4513] group py-1"
              >
                Review Program Directives 
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ type: "spring" as const, stiffness: 400, damping: 25, delay: 0.2 }}
            className="relative bg-white border border-[#8B4513]/20 rounded-[12px] p-[48px] space-y-[24px] overflow-hidden group hover:border-[#8B4513]/40 transition-colors"
          >
            {/* Architectural accent ring graphic inside container */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B4513]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />

            <div className="border-b border-[#8B4513]/10 pb-[16px] flex items-center justify-between relative z-10">
              <span className="text-xs font-medium text-[#3D2B1F]/60">Standard Duration</span>
              <span className="text-xs font-medium text-[#3D2B1F]">24 Immersive Weeks</span>
            </div>
            <div className="border-b border-[#8B4513]/10 pb-[16px] flex items-center justify-between relative z-10">
              <span className="text-xs font-medium text-[#3D2B1F]/60">Evaluation Metric</span>
              <span className="text-xs font-medium text-[#3D2B1F]">Absolute Artifact Mastery</span>
            </div>
            <div className="flex items-center justify-between pt-[8px] relative z-10">
              <span className="text-xs font-medium text-[#3D2B1F]/60">Intake Selectivity</span>
              <span className="text-xs font-medium text-[#8B4513]">Highly Restrictive</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ExcellenceSection() {
  return (
    <section className="py-[64px] md:py-[96px] bg-[#F9F5F0] border-b border-[#8B4513]/10">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[32px]">
          {[
            { label: "Accreditation", value: "MSME Govt." },
            { label: "Architecture", value: "Cloud Native" },
            { label: "Selectivity", value: "Top Decile" },
            { label: "Outcomes", value: "Verifiable" },
          ].map((s, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 25, delay: i * 0.1 }}
              className="text-center border-r last:border-0 border-[#8B4513]/10 px-[16px] group"
            >
              <div className="text-2xl md:text-3xl font-normal tracking-[-0.02em] text-[#3D2B1F] mb-[8px] group-hover:text-[#8B4513] transition-colors">
                {s.value}
              </div>
              <div className="text-[10px] font-medium text-[#3D2B1F]/60 uppercase tracking-wider">
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
          className="bg-white border border-[#8B4513]/20 rounded-[12px] p-[48px] md:p-[80px]"
        >
          <h2 className="text-3xl md:text-5xl font-normal tracking-[-0.02em] text-[#3D2B1F] mb-[16px]">
            Begin the Journey
          </h2>
          <p className="text-sm md:text-base text-[#3D2B1F]/80 leading-[1.6] max-w-lg mx-auto mb-[32px]">
            Admissions for the winter architectural tier are presently evaluated on an artifact portfolio basis.
          </p>
          <div className="flex flex-wrap justify-center gap-[16px]">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}>
              <Button asChild size="lg" className="bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] rounded-[12px] px-[32px] h-[48px] font-medium shadow-none">
                <Link href="/signup">Submit Application</Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}>
              <Button asChild size="lg" variant="outline" className="border-[#8B4513]/20 bg-white text-[#3D2B1F] hover:bg-[#F9F5F0] rounded-[12px] px-[32px] h-[48px] font-medium shadow-none">
                <Link href="/login">Member Portal</Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
