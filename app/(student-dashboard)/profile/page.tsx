"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Menu,
  User, 
  Mail, 
  Code, 
  Globe, 
  LayoutDashboard, 
  GraduationCap, 
  Save, 
  Loader2,
  ShieldCheck,
  ArrowLeft,
  BookOpen,
  TrendingUp,
  LogOut,
  Layers,
  Sparkles
} from "lucide-react";
import { useSidebarContext } from "@/components/SidebarContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const DEPARTMENTS = [
  { id: "cse", name: "Computer Science & Allied Branches", icon: "🖥️" },
  { id: "it", name: "Information Technology", icon: "💻" },
  { id: "eee", name: "Electrical & Electronics", icon: "⚡" },
  { id: "mech", name: "Mechanical Engineering", icon: "⚙️" },
];

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const { setIsSidebarOpen } = useSidebarContext();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    department_slug: "",
    github_url: "",
    linkedin_url: "",
    phone: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          window.location.href = "/login";
          return;
        }
        setUserId(session.user.id);

        const profileRes = await supabase.from("profiles").select("*, departments(name)").eq("id", session.user.id).single();

        if (profileRes.data) {
          setProfile(profileRes.data);
          setFormData({
            full_name: profileRes.data.full_name || "",
            email: session.user.email || "",
            department_slug: profileRes.data.department_slug || "",
            github_url: profileRes.data.github_url || "",
            linkedin_url: profileRes.data.linkedin_url || "",
            phone: profileRes.data.phone || "",
          });
        }
      } catch (err) {
        console.error("Profile Load Error:", err);
        window.location.href = "/login";
      } finally {
        setFetching(false);
      }
    };
    fetchUser();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    setSuccessMsg(null);
    try {
      const { error } = await supabase.from("profiles").update({ 
        full_name: formData.full_name,
        department_slug: formData.department_slug,
        github_url: formData.github_url,
        linkedin_url: formData.linkedin_url,
        phone: formData.phone
      }).eq("id", userId);
      
      if (error) throw error;
      
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#8B5A2B]" />
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAF6F0]">
        <header className="h-16 border-b border-black/10 bg-white flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-black hover:bg-black/5 rounded-[8px]">
              <Menu size={20} className="text-[#8B5A2B]" />
            </button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
              <Button variant="outline" size="icon" onClick={() => router.push('/dashboard')} className="rounded-[12px] h-8 w-8 border-black/10 shadow-none">
                <ArrowLeft size={16} className="text-[#8B5A2B]" />
              </Button>
            </motion.div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-black">Profile Settings</h2>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-[32px] md:p-[64px] pb-20 bg-[#FAF6F0]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="max-w-3xl mx-auto"
          >
            <div className="mb-[40px]">
              <h1 className="text-3xl font-normal tracking-[-0.02em] text-black mb-2">Your Student Profile</h1>
              <p className="text-xs text-black/60 leading-[1.6]">Keep your profile information, links, and contact details up to date.</p>
            </div>

            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-[32px] p-[16px] bg-[#FDBF84]/25 text-[#8B5A2B] border border-[#FDBF84]/40 rounded-[12px] flex items-center gap-3 text-xs font-medium"
              >
                <ShieldCheck size={16} className="text-[#8B5A2B]" />
                {successMsg}
              </motion.div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-[32px]">
              {/* Profile Card */}
              <div className="bg-white border border-black/10 rounded-[12px] p-[32px] md:p-[48px] space-y-[32px] shadow-none">
                <div className="flex items-center gap-[24px]">
                   <div className="w-14 h-14 rounded-[12px] bg-[#FDBF84]/20 border border-[#FDBF84]/35 flex items-center justify-center text-[#8B5A2B] text-lg font-medium shrink-0">
                      {formData.full_name?.charAt(0) || "M"}
                   </div>
                   <div>
                      <h3 className="text-base font-medium tracking-[-0.02em] text-black">{formData.full_name || "Student Profile"}</h3>
                      <p className="text-xs text-black/60 mt-0.5">Verified Primary Identity Instance</p>
                   </div>
                </div>

                <div className="grid md:grid-cols-2 gap-[24px]">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium uppercase tracking-wider text-black/60 block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B5A2B] h-3.5 w-3.5" />
                      <input 
                        type="text" 
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-black/10 rounded-[12px] focus:outline-none focus:border-black transition-all text-xs text-black"
                        value={formData.full_name}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 opacity-70">
                    <label className="text-[10px] font-medium uppercase tracking-wider text-[#8B5A2B] block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B5A2B] h-3.5 w-3.5" />
                      <input 
                        type="email" 
                        disabled
                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-black/10 rounded-[12px] cursor-not-allowed text-xs text-black/80"
                        value={formData.email}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium uppercase tracking-wider text-black/60 block">College Department</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B5A2B] h-3.5 w-3.5" />
                    <select
                      value={formData.department_slug}
                      onChange={(e) => setFormData({...formData, department_slug: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-black/10 rounded-[12px] focus:outline-none focus:border-black transition-all text-xs text-black appearance-none"
                    >
                      <option value="" disabled>Select Core Stream Alignment</option>
                      {DEPARTMENTS.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-[24px]">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium uppercase tracking-wider text-black/60 block">GitHub Profile URL</label>
                    <div className="relative">
                      <Code className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B5A2B] h-3.5 w-3.5" />
                      <input 
                        type="url" 
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-black/10 rounded-[12px] focus:outline-none focus:border-black transition-all text-xs text-black"
                        value={formData.github_url}
                        onChange={(e) => setFormData({...formData, github_url: e.target.value})}
                        placeholder="https://github.com/..."
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium uppercase tracking-wider text-black/60 block">LinkedIn Profile URL</label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B5A2B] h-3.5 w-3.5" />
                      <input 
                        type="url" 
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-black/10 rounded-[12px] focus:outline-none focus:border-black transition-all text-xs text-black"
                        value={formData.linkedin_url}
                        onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium uppercase tracking-wider text-black/60 block">Phone Number</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B5A2B] h-3.5 w-3.5" />
                    <input 
                      type="tel" 
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-black/10 rounded-[12px] focus:outline-none focus:border-black transition-all text-xs text-black"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="e.g. 9876543210"
                    />
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="pt-[16px]">
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full h-10 rounded-[12px] bg-[#FDBF84] text-neutral-900 hover:bg-[#FCAE68] border border-[#FDBF84]/25 shadow-none font-extrabold text-xs cursor-pointer"
                  >
                    {loading ? <Loader2 className="animate-spin h-4 w-4 text-neutral-900" /> : <><Save size={14} className="mr-2 text-neutral-900" /> Save Profile Changes</>}
                  </Button>
                </motion.div>
              </div>
            </form>
          </motion.div>
        </div>
    </main>
  );
}


