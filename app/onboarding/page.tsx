"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Code2, Zap, Settings, ArrowRight, Loader2, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEPARTMENTS = [
  {
    id: "it",
    name: "Information Technology",
    icon: <Code2 className="text-[#8B4513] h-5 w-5" />,
    description: "Software engineering, web development, and AI tracks.",
  },
  {
    id: "eee",
    name: "Electrical & Electronics",
    icon: <Zap className="text-[#8B4513] h-5 w-5" />,
    description: "IoT, robotics, and embedded systems training.",
  },
  {
    id: "mech",
    name: "Mechanical Engineering",
    icon: <Settings className="text-[#8B4513] h-5 w-5" />,
    description: "Industrial design, manufacturing, and automation.",
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
    <div className="min-h-screen flex items-center justify-center bg-[#F9F5F0] p-[32px] md:p-[64px] text-[#3D2B1F] font-sans">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-[48px]">
          <div className="inline-flex items-center gap-2 rounded-[12px] border border-[#8B4513]/10 bg-[#8B4513]/5 px-4 py-1.5 text-xs font-medium text-[#8B4513] mb-[24px]">
            <Award size={14} />
            ACADEMIC INTEGRATION
          </div>
          <h1 className="text-3xl md:text-5xl font-normal tracking-[-0.02em] mb-[16px] text-[#3D2B1F]">
            Select Your Discipline
          </h1>
          <p className="text-sm md:text-base text-[#3D2B1F]/80 max-w-xl mx-auto font-normal">
            Choose your specialization to unlock foundational curriculum and assignments tailored to your domain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
          {DEPARTMENTS.map((dept) => (
            <div
              key={dept.id}
              className="flex flex-col p-[32px] bg-white border border-[#8B4513]/20 rounded-[12px] hover:border-[#8B4513]/40 transition-colors shadow-none"
            >
              <div className="w-12 h-12 rounded-[12px] bg-[#8B4513]/5 border border-[#8B4513]/10 flex items-center justify-center mb-[24px]">
                {dept.icon}
              </div>
              
              <h3 className="text-lg font-medium tracking-[-0.02em] text-[#3D2B1F] mb-[16px]">
                {dept.name}
              </h3>
              <p className="text-sm text-[#3D2B1F]/80 leading-[1.6] mb-[32px] flex-1">
                {dept.description}
              </p>
              
              <Button 
                onClick={() => handleSelectDepartment(dept.id)}
                disabled={loading}
                className="w-full h-11 rounded-[12px] font-medium bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] shadow-none"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Select Track <ArrowRight size={16} className="ml-2 text-[#8B4513]" /></>}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
