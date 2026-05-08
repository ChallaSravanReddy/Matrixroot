"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-500/30">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-50/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = '/'}>
            <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Matrix Root Logo" width={32} height={32} className="object-contain drop-shadow-md" priority />
            <span className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent hidden sm:block">
              Matrix Root
            </span>
          </div>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-200 transition-all font-medium text-sm flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <span className="hidden sm:inline">Go to Dashboard</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full -z-10"></div>
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
            Elevate Your Career with <br />
            <span className="bg-gradient-to-r from-blue-600 via-sky-400 to-blue-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Industry Internships
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-xl text-slate-600 leading-relaxed">
            Bridge the gap between academic learning and professional excellence. 
            Matrix Root provides specialized internship tracks designed by industry leaders.
          </p>
        </div>
      </section>

      {/* Why Internships? Section */}
      <section className="py-24 px-6 bg-white/30">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Why join an Internship?</h2>
            <p className="text-slate-400">Accelerate your professional growth with a structured path.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, i) => (
              <div 
                key={i} 
                className="p-8 bg-white/80 border border-slate-200 rounded-3xl hover:border-blue-500/50 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{benefit.description}</p>
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
              <p className="text-slate-400">Choose a specialization that aligns with your career goals.</p>
            </div>
            <div className="flex justify-center">
              <span className="px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 uppercase tracking-widest">
                {courses.length} Open Programs
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div 
                key={course.id}
                className="group flex flex-col bg-white/40 border border-slate-200 rounded-3xl overflow-hidden hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500"
              >
                <div className="h-48 bg-slate-200 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-sky-500/20 group-hover:scale-105 transition-transform duration-700"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-slate-700 group-hover:text-blue-600/30 transition-colors">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                    </svg>
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-sky-400 uppercase tracking-widest">
                    {course.departments?.name || "General"}
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold group-hover:text-blue-700 transition-colors line-clamp-1">{course.title}</h3>
                    <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
                      {course.description || "Take the next step in your career with our specialized industrial training program."}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-200 flex items-center justify-between mt-auto">
                    <div>
                      
                    </div>
                    <button 
                      onClick={() => window.location.href = `/courses/${course.id}`}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
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
      <footer className="py-20 px-6 border-t border-slate-900 bg-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center font-bold text-slate-900">
              R
            </div>
            <span className="font-bold text-slate-600">© 2024 Matrix Root Engineering</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-400">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Contact Support</a>
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
