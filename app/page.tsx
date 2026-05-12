"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Code2, 
  Brain, 
  Zap, 
  Database,
  Cpu,
  Globe,
  Terminal,
  Layers,
  ChevronRight
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <Hero />
      <Services />
      <BentoShowcase />
      <TrustSection />
      <CTASection />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-10 pb-10 md:pt-10 md:pb-10">
      <div className="absolute inset-0 matrix-bg -z-10 opacity-40 matrix-bg-animate" />
      <div className="container mx-auto max-w-7xl px-4 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Rule of Thirds: Content takes up 7/12 (~60%) of the grid */}
          <div className="lg:col-span-8 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md px-5 py-2.5 text-xs font-black tracking-[0.2em] text-primary shadow-sm mb-10 animate-kinetic">
              <Sparkles className="h-4 w-4" />
              BUILDING SCALABLE INFRASTRUCTURE
            </div>
            
            {/* Adjusted typography scale and leading to prevent overlap */}
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-foreground leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Building Scalable <br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
                Digital Infrastructure
              </span> <br />
              for the Future.
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl font-medium animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 mb-12">
              We provide enterprise-grade web development, AI automation, and custom software solutions that drive business growth.
            </p>

            {/* Z-Pattern: CTAs at the bottom right of the text block */}
            <div className="flex flex-wrap items-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
              <Button asChild size="lg" className="rounded-full px-10 h-16 text-lg font-black shadow-2xl shadow-primary/40 bg-primary hover:shadow-primary/60 transition-all hover:-translate-y-2">
                <Link href="/#services">View Our Services <ArrowRight className="ml-3 h-6 w-6" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-10 h-16 text-lg font-bold border-border/50 bg-card/40 backdrop-blur-xl hover:bg-card hover:-translate-y-2 transition-all">
                <Link href="/careers">Start an Internship</Link>
              </Button>
            </div>
          </div>
          
          {/* Rule of Thirds: Visual balance on the right 5/12 (~40%) */}
          <div className="lg:col-span-4 hidden lg:flex justify-center relative">
             <div className="w-full aspect-square rounded-[3rem] border border-border/30 bg-card/10 backdrop-blur-sm shadow-2xl relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 matrix-bg opacity-50" />
                <Cpu className="h-32 w-32 text-primary opacity-80 animate-float" />
             </div>
             {/* Glowing orb behind */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -z-10" />
          </div>
        </div>
      </div>

      {/* Decorative floating elements */}
      <div className="absolute top-1/4 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl animate-float delay-1000" />
    </section>
  );
}

function Services() {
  const services = [
    { 
      title: "Enterprise Web", 
      icon: Globe, 
      desc: "High-performance, scalable web architectures built with Next.js and Cloud Native technologies.",
      tags: ["Performance", "Scalability", "Security"]
    },
    { 
      title: "AI Automation", 
      icon: Brain, 
      desc: "Custom LLM integrations and business process automation using state-of-the-art AI models.",
      tags: ["LLMs", "RAG", "Automation"]
    },
    { 
      title: "Custom Systems", 
      icon: Terminal, 
      desc: "Bespoke software solutions tailored to solve complex industrial and business challenges.",
      tags: ["Custom Build", "Integration", "ERP"]
    }
  ];

  return (
    <section id="services" className="py-40 border-y border-border/30 bg-card/10 relative">
      <div className="container mx-auto max-w-7xl px-4">
        {/* F-Pattern Alignment for headers */}
        <div className="max-w-3xl mb-24 text-left">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8">Our Expertise</h2>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed">We deliver no-bluff, production-ready software solutions for the modern era.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {services.map((s, i) => (
            <div key={i} className="bento-card group">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                <s.icon className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight">{s.title}</h3>
              <p className="text-muted-foreground font-medium leading-relaxed mb-8">{s.desc}</p>
              <div className="flex flex-wrap gap-2">
                {s.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-black uppercase tracking-widest text-primary/60 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BentoShowcase() {
  return (
    <section className="py-40 overflow-hidden relative">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 md:row-span-2 bento-card bg-gradient-to-br from-primary/20 to-transparent flex flex-col justify-between min-h-[400px]">
             <div>
               <h3 className="text-3xl font-black tracking-tighter mb-4">The Matrix Architecture</h3>
               <p className="text-muted-foreground font-medium max-w-sm">Our signature approach to building digital infrastructure that scales horizontally and vertically.</p>
             </div>
             <div className="relative h-40 w-full bg-black/20 rounded-3xl border border-white/5 overflow-hidden">
                <div className="absolute inset-0 matrix-bg opacity-30" />
                <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-primary/40 leading-none truncate">
                   {`01010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101`}
                </div>
             </div>
          </div>
          
          <div className="md:col-span-2 bento-card flex flex-col justify-between">
            <h4 className="text-xl font-black tracking-tight mb-2">Cloud Optimized</h4>
            <p className="text-sm text-muted-foreground font-medium">99.9% Uptime guaranteed with serverless deployments.</p>
            <div className="mt-6 flex items-center gap-2">
               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">Active Monitoring</span>
            </div>
          </div>

          <div className="md:col-span-1 bento-card flex flex-col items-center justify-center text-center">
             <Cpu className="h-10 w-10 text-primary mb-4" />
             <div className="text-2xl font-black">AI Core</div>
             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Integration Ready</p>
          </div>

          <div className="md:col-span-1 bento-card flex flex-col items-center justify-center text-center">
             <Layers className="h-10 w-10 text-primary mb-4" />
             <div className="text-2xl font-black">Modular</div>
             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Plug & Play</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="py-32 border-y border-border/30 bg-card/5">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid gap-12 md:gap-8 md:grid-cols-4">
          {[
            { icon: ShieldCheck, label: "Government Registered", value: "MSME UDYAM" },
            { icon: Database, label: "Secure Data", value: "ISO Standards" },
            { icon: Zap, label: "Performance", value: "100ms Load" },
            { icon: Globe, label: "Presence", value: "Across India" },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 text-primary">
                <s.icon className="h-8 w-8" />
              </div>
              <div>
                <div className="text-2xl font-black tracking-tight">{s.value}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-1">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-40">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-[4rem] px-8 py-24 text-primary-foreground md:py-40 text-center" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-10 leading-[0.9]">Ready to Build the <br /> Future with Us?</h2>
            <p className="text-xl md:text-2xl opacity-90 mb-16 font-medium max-w-2xl mx-auto">Whether you need a custom software solution or want to kickstart your career with an elite internship, Matrix Root is your destination.</p>
            <div className="flex flex-wrap justify-center gap-6">
              <Button asChild size="lg" variant="secondary" className="rounded-full h-16 px-12 text-lg font-black shadow-2xl hover:-translate-y-1 transition-all">
                <Link href="/signup">Contact Agency</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full h-16 px-12 text-lg font-bold border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:-translate-y-1 transition-all">
                <Link href="/careers">Join Careers</Link>
              </Button>
            </div>
          </div>
          
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
        </div>
      </div>
    </section>
  );
}
