"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
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

export default function CareersPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    { id: "it", name: "IT & Software", icon: Code, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "eee", name: "EEE & Electronics", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
    { id: "mech", name: "Mechanical & Core", icon: Settings, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 matrix-bg -z-10 opacity-30 matrix-bg-animate" />
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 backdrop-blur-sm text-xs font-black uppercase tracking-widest text-primary mb-8 animate-kinetic">
            <Sparkles className="h-4 w-4" />
            Training-cum-Internships 2024
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
            Shape the Future of <br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
              Infrastructure.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
            Real projects. Industry standards. Verifiable certificates. 
            Join our specialized internship tracks designed for the next generation of engineers.
          </p>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-12 border-y border-border/50 bg-card/20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Clock, title: "Self-Paced Training", desc: "Learn at your own speed with high-quality industry curriculum." },
              { icon: Layers, title: "Project-Based Learning", desc: "Build enterprise-grade software and systems from day one." },
              { icon: BadgeCheck, title: "QR-Verified Certification", desc: "Secure, tamper-proof credentials to boost your LinkedIn profile." },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-4 p-6 rounded-3xl border border-transparent hover:border-border hover:bg-card transition-all group">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <f.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Openings */}
      <section className="py-32">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Current Openings</h2>
              <p className="text-lg text-muted-foreground font-medium">Select your track and start your professional journey.</p>
            </div>
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button key={cat.id} className="px-6 py-2 rounded-full border border-border bg-card/50 text-xs font-bold hover:border-primary transition-all">
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => {
              const deptSlug = course.departments?.slug || "general";
              const category = categories.find(c => deptSlug.includes(c.id)) || categories[0];

              return (
                <div 
                  key={course.id}
                  className="bento-card group flex flex-col h-full"
                >
                  <div className="relative h-48 rounded-[2rem] overflow-hidden mb-8">
                    <div className={`absolute inset-0 ${category.bg} opacity-20 group-hover:scale-110 transition-transform duration-700`} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <category.icon className={`w-16 h-16 ${category.color} opacity-40 group-hover:opacity-80 transition-all duration-500`} />
                    </div>
                    <div className="absolute top-4 right-4 px-4 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/10">
                      {course.departments?.name || "General"}
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 mb-8">
                    <h3 className="text-2xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors">{course.title}</h3>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed line-clamp-3">
                      {course.description || "Industry-standard professional training track for aspiring engineers."}
                    </p>
                    
                    <ul className="space-y-2 pt-4">
                      {["Self-Paced Training", "Project-Based Learning", "QR-Verified"].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground/80 uppercase tracking-widest">
                          <ChevronRight className="h-3 w-3 text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    asChild 
                    className="w-full h-12 rounded-2xl font-black tracking-tight shadow-lg shadow-primary/10 group-hover:shadow-primary/30 group-hover:-translate-y-1 transition-all"
                  >
                    <Link href={`/signup?course=${course.id}`}>
                      Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

import Link from "next/link";
