"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

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

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    department_slug: "",
    github_url: "",
    linkedin_url: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/login";
        return;
      }
      setUserId(session.user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      
      if (data) {
        setFormData({
          full_name: data.full_name || "",
          email: session.user.email || "",
          department_slug: data.department_slug || "",
          github_url: data.github_url || "",
          linkedin_url: data.linkedin_url || "",
        });
      }
      setFetching(false);
    };
    fetchUser();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    setLoading(true);
    setSuccessMsg(null);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          full_name: formData.full_name,
          department_slug: formData.department_slug,
          github_url: formData.github_url,
          linkedin_url: formData.linkedin_url
        })
        .eq("id", userId);

      if (error) throw error;

      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-72 hidden md:flex flex-col border-r border-slate-200/60 bg-white/20 backdrop-blur-md">
        <div className="p-6 border-b border-slate-200/60 flex items-center gap-3">
          <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Matrix Root Logo" width={32} height={32} className="object-contain drop-shadow-md" priority />
          <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Matrix Root
          </h2>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-2">
            <button onClick={() => window.location.href = '/dashboard'} className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              Back to Dashboard
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-blue-600 bg-blue-500/10 rounded-lg transition-colors border border-blue-500/20 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              My Profile
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Matrix Root Logo" width={32} height={32} className="object-contain drop-shadow-md" priority />
            <span className="font-bold text-slate-900">Profile</span>
          </div>
          <button onClick={() => window.location.href = '/dashboard'} className="p-2 text-slate-600 hover:text-slate-900">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </button>
        </header>

        {/* Profile Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Profile Settings</h1>
                <p className="text-slate-600 text-lg">Manage your personal information and track selection.</p>
              </div>
              
              {successMsg && (
                <div className="flex px-4 py-2 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-lg items-center gap-2 animate-in fade-in slide-in-from-top-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {successMsg}
                </div>
              )}
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-8">
              {/* Basic Info */}
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600 uppercase tracking-wider">Full Name</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-blue-500 outline-none transition-all"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-1.5 opacity-60">
                    <label className="text-sm font-medium text-slate-600 uppercase tracking-wider">Email Address</label>
                    <input 
                      type="email" 
                      disabled
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl cursor-not-allowed"
                      value={formData.email}
                    />
                    <p className="text-[10px] text-slate-400 px-1 italic">Email cannot be changed after registration</p>
                  </div>
                </div>
              </div>

              {/* Branch Selection */}
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                  Academic Track
                </h2>
                
                <div className="space-y-4">
                  <label className="text-sm font-medium text-slate-600 uppercase tracking-wider">Select Your Branch</label>
                  <div className="relative group">
                    <select
                      value={formData.department_slug}
                      onChange={(e) => setFormData({...formData, department_slug: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:border-blue-500 outline-none transition-all appearance-none text-slate-900 cursor-pointer hover:bg-white"
                    >
                      <option value="" disabled>Choose your academic track</option>
                      {DEPARTMENTS.map(dept => (
                        <option key={dept.id} value={dept.id} className="bg-slate-50 py-2">
                          {dept.icon} {dept.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                  Professional Links
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600 uppercase tracking-wider">GitHub URL</label>
                    <input 
                      type="url" 
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-blue-500 outline-none transition-all"
                      value={formData.github_url}
                      onChange={(e) => setFormData({...formData, github_url: e.target.value})}
                      placeholder="https://github.com/username"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600 uppercase tracking-wider">LinkedIn URL</label>
                    <input 
                      type="url" 
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-blue-500 outline-none transition-all"
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Saving Changes..." : "Save Profile Details"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
