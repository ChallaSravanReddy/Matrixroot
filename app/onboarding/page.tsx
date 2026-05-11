"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Code2, Zap, Settings, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEPARTMENTS = [
  {
    id: "it",
    name: "Information Technology",
    icon: <Code2 className="text-blue-500" />,
    description: "Software engineering, web development, and AI tracks.",
    color: "from-blue-500/20 to-sky-500/10"
  },
  {
    id: "eee",
    name: "Electrical & Electronics",
    icon: <Zap className="text-amber-500" />,
    description: "IoT, robotics, and embedded systems training.",
    color: "from-amber-500/20 to-orange-500/10"
  },
  {
    id: "mech",
    name: "Mechanical Engineering",
    icon: <Settings className="text-emerald-500" />,
    description: "Industrial design, manufacturing, and automation.",
    color: "from-emerald-500/20 to-teal-500/10"
  },
];

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/login";
        return;
      }
      setUserId(session.user.id);
    };
    fetchUser();
  }, []);

  const handleSelectDepartment = async (slug: string) => {
    if (!userId) return;
    setLoading(true);
    try {
      await supabase.from("profiles").upsert({ 
        id: userId, 
        department_slug: slug,
        has_accepted_terms: true,
        role: 'student'
      }, { onConflict: 'id' });
      window.location.href = "/dashboard";
    } catch (err) {
      setLoading(false);
      alert("Selection failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 selection:bg-primary/20">
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
      
      <div className="w-full max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-bold text-primary shadow-sm mb-6">
            <Sparkles size={14} className="animate-pulse" />
            CUSTOMIZE YOUR CAREER TRACK
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
            Select Your <br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>Academic Discipline</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
            Choose your specialization to unlock mentor-reviewed curriculum and industrial assignments tailored to your branch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {DEPARTMENTS.map((dept) => (
            <div
              key={dept.id}
              className="group relative flex flex-col p-8 bg-card/40 backdrop-blur-md border border-border rounded-[2.5rem] hover:border-primary/40 hover:-translate-y-2 transition-all duration-300 shadow-card"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${dept.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                {dept.icon}
              </div>
              
              <h3 className="text-2xl font-black mb-4 group-hover:text-primary transition-colors">{dept.name}</h3>
              <p className="text-muted-foreground font-medium leading-relaxed mb-10 flex-1">{dept.description}</p>
              
              <Button 
                onClick={() => handleSelectDepartment(dept.id)}
                disabled={loading}
                className="w-full h-12 rounded-2xl font-bold group-hover:shadow-lg transition-all"
                variant="secondary"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Select Track <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" /></>}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
