"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const DEPARTMENTS = [
  {
    id: "it",
    name: "Information Technology",
    icon: "💻",
    description: "Software engineering, data structures, and algorithms.",
  },
  {
    id: "eee",
    name: "Electrical & Electronics",
    icon: "⚡",
    description: "Circuit design, power systems, and embedded computing.",
  },
  {
    id: "mech",
    name: "Mechanical Engineering",
    icon: "⚙️",
    description: "Thermodynamics, robotics, and fluid mechanics.",
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
      const { error } = await supabase
        .from("profiles")
        .upsert({ 
          id: userId, 
          department_slug: slug,
          has_accepted_terms: true,
          role: 'student'
        }, { onConflict: 'id' });

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      // Successfully updated, redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Error updating department:", err);
      setLoading(false);
      alert(`Failed to update department: ${err.message || "Unknown error"}. Please check your database connection.`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 text-slate-900 font-sans">
      <div className="w-full max-w-5xl space-y-12">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-sky-400 to-sky-600 bg-clip-text text-transparent">
            Select Your Department
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Choose your academic branch to customize your Matrix Root experience and curriculum.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept.id}
              onClick={() => handleSelectDepartment(dept.id)}
              disabled={loading}
              className="flex flex-col items-start p-8 text-left bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl hover:bg-slate-200/80 hover:border-blue-500/50 hover:-translate-y-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-black/50"
            >
              <div className="text-5xl mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                {dept.icon}
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">{dept.name}</h3>
              <p className="text-base text-slate-600 leading-relaxed">{dept.description}</p>
              
              <div className="mt-8 w-full flex items-center justify-between text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-sm font-medium">Select Branch</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
