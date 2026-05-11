"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  User, 
  Mail, 
  Code, 
  Globe, 
  LayoutDashboard, 
  GraduationCap, 
  Save, 
  Loader2,
  ShieldCheck,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";

const DEPARTMENTS = [
  { id: "it", name: "Information Technology", icon: "💻" },
  { id: "eee", name: "Electrical & Electronics", icon: "⚡" },
  { id: "mech", name: "Mechanical Engineering", icon: "⚙️" },
];

export default function ProfilePage() {
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
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/login";
        return;
      }
      setUserId(session.user.id);

      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
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
      await supabase.from("profiles").update({ 
        full_name: formData.full_name,
        department_slug: formData.department_slug,
        github_url: formData.github_url,
        linkedin_url: formData.linkedin_url
      }).eq("id", userId);
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 hidden lg:flex flex-col border-r border-border bg-card/30">
        <div className="p-6 flex items-center gap-3 border-b border-border">
          <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Logo" width={32} height={32} />
          <span className="font-bold text-lg">Matrix Root</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start font-bold" onClick={() => window.location.href = '/dashboard'}>
            <LayoutDashboard size={18} className="mr-3" /> Dashboard
          </Button>
          <Button variant="default" className="w-full justify-start font-bold">
            <User size={18} className="mr-3" /> My Profile
          </Button>
        </nav>
        <div className="p-4 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={() => window.location.href = '/dashboard'}>
            <ArrowLeft size={14} className="mr-2" /> Back
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <h2 className="text-lg font-black uppercase tracking-widest">Account Settings</h2>
          <ThemeToggle />
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-20">
          <div className="max-w-3xl mx-auto">
            <div className="mb-10">
              <h1 className="text-3xl font-black mb-2">Student Profile</h1>
              <p className="text-muted-foreground font-medium">Manage your industrial track and professional links.</p>
            </div>

            {successMsg && (
              <div className="mb-8 p-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95">
                <ShieldCheck size={18} />
                {successMsg}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-8">
              {/* Profile Card */}
              <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-card space-y-8">
                <div className="flex items-center gap-6">
                   <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center text-primary-foreground text-3xl font-black">
                      {formData.full_name?.charAt(0) || "S"}
                   </div>
                   <div>
                      <h3 className="text-xl font-black">{formData.full_name || "Industrial Trainee"}</h3>
                      <p className="text-sm text-muted-foreground font-medium">Matrix Root Professional Track</p>
                   </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <input 
                        type="text" 
                        required
                        className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        value={formData.full_name}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 opacity-60">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 text-primary">Email (Locked)</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <input 
                        type="email" 
                        disabled
                        className="w-full pl-12 pr-4 py-4 bg-accent/20 border border-border rounded-2xl cursor-not-allowed font-medium"
                        value={formData.email}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Academic Branch</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <select
                      value={formData.department_slug}
                      onChange={(e) => setFormData({...formData, department_slug: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium appearance-none"
                    >
                      <option value="" disabled>Select Branch</option>
                      {DEPARTMENTS.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">GitHub Portfolio</label>
                    <div className="relative">
                      <Code className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <input 
                        type="url" 
                        className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        value={formData.github_url}
                        onChange={(e) => setFormData({...formData, github_url: e.target.value})}
                        placeholder="https://github.com/..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">LinkedIn Profile</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <input 
                        type="url" 
                        className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        value={formData.linkedin_url}
                        onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-14 rounded-2xl font-black shadow-xl shadow-primary/20"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <><Save size={18} className="mr-2" /> Save Profile Changes</>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
