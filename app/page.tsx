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
  Sparkles,
  ShieldCheck
} from "@/components/icons";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black overflow-hidden font-sans">
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
    <section className="relative py-[64px] md:py-[112px] bg-white border-b border-black/10 overflow-hidden">
      {/* Subtle background grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="edtechGrid" width="64" height="64" patternUnits="userSpaceOnUse">
              <path d="M 64 0 L 0 0 0 64" fill="none" stroke="#8B5A2B" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#edtechGrid)" />
        </svg>
      </div>

      <div className="container relative mx-auto max-w-6xl px-4 text-center z-10">
        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8B5A2B]/10 border border-[#8B5A2B]/20 text-xs font-bold text-[#8B5A2B] mb-[32px]"
        >
          <ShieldCheck className="h-4 w-4 text-[#8B5A2B]" />
          A Government Registered MSME Enterprise (UDYAM-TS-31-0053124)
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold tracking-tight text-black leading-[1.15] mb-[24px] max-w-5xl mx-auto"
        >
          Matrix Root | Custom Software & <br />
          <span className="text-[#8B5A2B] relative">
            AI Development.
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              className="absolute bottom-0 left-0 w-full h-[3px] bg-[#8B5A2B] origin-left -z-10"
            />
          </span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.2 }}
          className="text-base md:text-lg text-black/80 leading-[1.6] max-w-3xl mx-auto font-medium mb-[48px]"
        >
          We build web applications, custom AI automations, and backend infrastructure.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-[16px]"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
            <Button asChild size="lg" className="bg-black text-white hover:bg-neutral-900 rounded-[8px] px-[32px] h-[48px] font-bold text-sm shadow-none border-0">
              <Link href="/#services">Explore Services</Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
            <Button asChild size="lg" variant="outline" className="border-black/15 bg-white text-black hover:bg-black/5 rounded-[8px] px-[32px] h-[48px] font-bold text-sm shadow-none">
              <Link href="/careers">Internships</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function PremiumTicker() {
  const tickerItems = [
    "✦ WEB PORTALS",
    "✦ CUSTOM AI AGENTS",
    "✦ BACKEND SYSTEM ARCHITECTURE",
    "✦ SUPABASE & SQL DATABASE DESIGN",
    "✦ HIGH-PERFORMANCE INFRASTRUCTURE",
    "✦ PRACTICAL DEVELOPMENT OUTCOMES"
  ];

  return (
    <div className="w-full overflow-hidden bg-white border-b border-black/10 py-[16px] select-none">
      <div className="flex whitespace-nowrap">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 30, repeat: Infinity }}
          className="flex gap-[64px] text-xs font-bold tracking-[0.15em] uppercase text-black/70 pr-[64px]"
        >
          {tickerItems.concat(tickerItems).map((item, idx) => (
            <span key={idx} className="hover:text-[#8B5A2B] transition-colors cursor-default">
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
      title: "Web & App Development",
      icon: Globe,
      desc: "Fast, secure, and responsive web applications built using React, Next.js, and modern tools.",
      graphic: (
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#8B5A2B]/10 stroke-current stroke-[1.5] fill-none">
          <circle cx="50" cy="50" r="40" strokeDasharray="4 4" />
          <line x1="10" y1="50" x2="90" y2="50" />
          <line x1="50" y1="10" x2="50" y2="90" />
        </svg>
      )
    },
    {
      title: "AI & Business Automation",
      icon: Brain,
      desc: "Streamline operations with custom AI workflows, integrations, and automation layers.",
      graphic: (
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#8B5A2B]/10 stroke-current stroke-[1.5] fill-none">
          <polygon points="50,10 90,85 10,85" />
          <circle cx="50" cy="60" r="15" />
        </svg>
      )
    },
    {
      title: "Technical Consulting",
      icon: Terminal,
      desc: "Database optimization, database setup (SQL/Supabase), and clean backend architecture design.",
      graphic: (
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#8B5A2B]/10 stroke-current stroke-[1.5] fill-none">
          <rect x="20" y="20" width="60" height="60" rx="8" />
          <line x1="30" y1="40" x2="50" y2="40" />
          <line x1="30" y1="60" x2="70" y2="60" />
        </svg>
      )
    }
  ];

  return (
    <section id="services" className="py-[64px] md:py-[112px] bg-white border-b border-black/10">
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="text-center max-w-2xl mx-auto mb-[64px]"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-[16px]">
            The Results We Deliver
          </h2>
          <p className="text-sm md:text-base text-black/80 leading-[1.6] font-medium">
            Robust deliverables designed to automate workflows and securely scale digital interfaces.
          </p>
        </motion.div>

        <div className="grid gap-[24px] md:grid-cols-3">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25, delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="group relative bg-white border border-black/10 rounded-[12px] p-[32px] overflow-hidden hover:border-black/20 transition-colors shadow-none flex flex-col justify-between"
            >
              {/* Graphical background */}
              <div className="absolute -right-12 -bottom-12 w-48 h-48 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none transform group-hover:rotate-12 transition-transform">
                {s.graphic}
              </div>

              <div className="relative z-10 flex-1">
                <div className="h-10 w-10 rounded-[8px] bg-[#8B5A2B]/10 flex items-center justify-center text-[#8B5A2B] mb-[24px] group-hover:scale-105 transition-transform duration-300 font-bold">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-black mb-[12px] group-hover:text-[#8B5A2B] transition-colors leading-tight">
                  {s.title}
                </h3>
                <p className="text-xs text-black/80 leading-[1.6] font-medium">
                  {s.desc}
                </p>
              </div>

              <div className="relative z-10 pt-[16px]">
                <div className="w-0 h-[2px] bg-[#8B5A2B] transition-all duration-300 group-hover:w-12 rounded-full" />
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
    <section className="py-[64px] md:py-[112px] bg-white border-b border-black/10">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid md:grid-cols-2 gap-[48px] items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="space-y-[24px]"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-[#8B5A2B]">
              Internships
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black leading-[1.2]">
              Join our internship program
            </h2>
            <p className="text-xs md:text-sm text-black/80 leading-[1.6] font-medium">
              We offer structured 8-week internship tracks designed to build production-ready developer skills in full-stack web applications and AI engineering.
            </p>
            <div className="pt-[8px]">
              <Link
                href="/careers"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8B5A2B] group py-1"
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
            transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.2 }}
            className="relative bg-white border border-black/10 rounded-[12px] p-[40px] space-y-[20px] overflow-hidden group hover:border-black/20 transition-colors shadow-none"
          >
            {/* Architectural accent ring graphic */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5A2B]/5 rounded-bl-full pointer-events-none group-hover:scale-105 transition-transform duration-500" />

            <div className="border-b border-black/10 pb-[12px] flex items-center justify-between relative z-10">
              <span className="text-xs font-bold text-black/60 flex items-center gap-1.5"><BookOpen size={14} className="text-[#8B5A2B]" /> Full-Stack Track</span>
              <span className="text-xs font-bold text-black">Modern Foundations</span>
            </div>
            <div className="border-b border-black/10 pb-[12px] flex items-center justify-between relative z-10">
              <span className="text-xs font-bold text-black/60 flex items-center gap-1.5"><Award size={14} className="text-[#8B5A2B]" /> AI Solutions Track</span>
              <span className="text-xs font-bold text-black">Applied Automation</span>
            </div>
            <div className="flex items-center justify-between pt-[4px] relative z-10">
              <span className="text-xs font-bold text-black/60 flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#8B5A2B]" /> Enterprise Standing</span>
              <span className="text-xs font-bold text-[#8B5A2B]">Govt Registered MSME</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ExcellenceSection() {
  return (
    <section className="py-[48px] md:py-[80px] bg-white border-b border-black/10">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
          {[
            { label: "Government Registry", value: "MSME Certified" },
            { label: "Target Outcomes", value: "Production-Ready" },
            { label: "Automation Layer", value: "Custom AI Agents" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 400, damping: 25, delay: i * 0.1 }}
              className="text-center border-r last:border-0 border-black/10 px-[16px] group"
            >
              <div className="text-xl md:text-2xl font-bold text-black mb-[6px] group-hover:text-[#8B5A2B] transition-colors">
                {s.value}
              </div>
              <div className="text-[9px] font-bold text-black/60 uppercase tracking-wider">
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
    <section className="py-[64px] md:py-[112px] bg-white">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="bg-white border border-black/10 rounded-[12px] p-[40px] md:p-[64px]"
        >
          <h2 className="text-2xl md:text-4xl font-bold text-black mb-[12px]">
            Start your internship today
          </h2>
          <p className="text-xs md:text-sm text-black/80 leading-[1.6] max-w-lg mx-auto mb-[32px] font-medium">
            Sign up for our 8-week tracks to learn practical skills, submit assignments, and earn certification.
          </p>
          <div className="flex flex-wrap justify-center gap-[16px]">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
              <Button asChild size="lg" className="bg-black text-white hover:bg-neutral-900 rounded-[8px] px-[32px] h-[44px] font-bold text-xs shadow-none border-0">
                <Link href="/careers">Apply for Internship</Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
              <Button asChild size="lg" variant="outline" className="border-black/15 bg-white text-black hover:bg-black/5 rounded-[8px] px-[32px] h-[44px] font-bold text-xs shadow-none">
                <Link href="/login">Student Login</Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
