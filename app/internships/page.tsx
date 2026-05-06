"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function InternshipsPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase
        .from("courses")
        .select("*, departments(name)");
      
      if (data) {
        setCourses(data);
      }
      setLoading(false);
    };

    fetchCourses();
  }, []);

  const benefits = [
    {
      title: "Real-World Experience",
      description: "Apply your classroom knowledge to actual industry projects and challenges.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875A1.125 1.125 0 013.75 18.4V14.15m16.5 0c0-1.221-1.209-2.205-2.7-2.205H6.45c-1.491 0-2.7.984-2.7 2.205m16.5 0V6.375c0-.621-.504-1.125-1.125-1.125H4.875a1.125 1.125 0 00-1.125 1.125v7.775" />
        </svg>
      )
    },
    {
      title: "Skill Validation",
      description: "Get certified in specific technical tracks that are recognized by top tech firms.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      )
    },
    {
      title: "Networking",
      description: "Connect with mentors and industry experts during live office hours.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a5.971 5.971 0 00-.941 3.197m12 0a5.971 5.971 0 00-.941-3.197M6 18.72a5.971 5.971 0 00.941-3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      )
    },
    {
      title: "Portfolio Building",
      description: "Build a strong portfolio of completed assignments and verified projects.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
        </svg>
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-indigo-500/30">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              R
            </div>
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Rooted Matrix
            </span>
          </div>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all font-medium text-sm"
          >
            Go to Dashboard
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full -z-10"></div>
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
            Elevate Your Career with <br />
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Industry Internships
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-xl text-zinc-400 leading-relaxed">
            Bridge the gap between academic learning and professional excellence. 
            Rooted Matrix provides specialized internship tracks designed by industry leaders.
          </p>
        </div>
      </section>

      {/* Why Internships? Section */}
      <section className="py-24 px-6 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Why join an Internship?</h2>
            <p className="text-zinc-500">Accelerate your professional growth with a structured path.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, i) => (
              <div 
                key={i} 
                className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl hover:border-indigo-500/50 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Available Internships Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 text-center md:text-left">
              <h2 className="text-4xl font-bold">Available Internship Tracks</h2>
              <p className="text-zinc-500">Choose a specialization that aligns with your career goals.</p>
            </div>
            <div className="flex justify-center">
              <span className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-bold text-zinc-400 uppercase tracking-widest">
                {courses.length} Open Programs
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div 
                key={course.id}
                className="group flex flex-col bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500"
              >
                <div className="h-48 bg-zinc-800 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 group-hover:scale-105 transition-transform duration-700"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-zinc-700 group-hover:text-indigo-400/30 transition-colors">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                    </svg>
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                    {course.departments?.name || "General"}
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold group-hover:text-indigo-300 transition-colors line-clamp-1">{course.title}</h3>
                    <p className="text-zinc-400 text-sm line-clamp-3 leading-relaxed">
                      {course.description || "Take the next step in your career with our specialized industrial training program."}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-zinc-800/50 flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Fee</span>
                      <span className="text-lg font-bold">₹4,999</span>
                    </div>
                    <button 
                      onClick={() => window.location.href = `/courses/${course.id}`}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                    >
                      View Program
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-white">
              R
            </div>
            <span className="font-bold text-zinc-400">© 2024 Rooted Matrix Engineering</span>
          </div>
          <div className="flex gap-8 text-sm text-zinc-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
