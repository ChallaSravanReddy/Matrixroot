"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { 
  LayoutDashboard, 
  BookOpen, 
  Layers, 
  TrendingUp, 
  Sparkles, 
  User, 
  LogOut, 
  X 
} from "lucide-react";

interface SidebarProps {
  activeSlug: "dashboard" | "courses" | "workspace" | "internships" | "performance" | "support" | "profile";
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  // Optional profile prop to avoid redundant fetching
  profile?: any;
}

export function SidebarItem({ 
  icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  onClick?: () => void; 
}) {
  return (
    <motion.button 
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3.5 min-h-[36px] rounded-[8px] text-xs font-bold transition-colors ${
        active 
        ? "bg-[#FDBF84] text-neutral-900" 
        : "text-black/70 hover:bg-black/5 hover:text-black"
      }`}
    >
      <span className={`${active ? "text-neutral-900" : "text-[#8B5A2B]"} shrink-0`}>{icon}</span>
      <span className="truncate">{label}</span>
    </motion.button>
  );
}

export default function Sidebar({ activeSlug, isSidebarOpen, setIsSidebarOpen, profile: initialProfile }: SidebarProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(initialProfile || null);

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, department_slug, departments(name)")
          .eq("id", session.user.id)
          .single();
        
        if (!error && data) {
          setProfile(data);
        }
      } catch (err) {
        console.error("Sidebar profile fetch error:", err);
      }
    };

    fetchProfile();
  }, [initialProfile]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const navigationItems = [
    { slug: "dashboard", label: "Dashboard Hub", icon: <LayoutDashboard size={18} />, path: "/dashboard" },
    { slug: "courses", label: "Courses", icon: <BookOpen size={18} />, path: "/dashboard/courses" },
    { slug: "workspace", label: "Workspace Hub", icon: <Layers size={18} />, path: "/workspace" },
    { slug: "internships", label: "Subscribed Tracks", icon: <BookOpen size={18} />, path: "/dashboard/internships" },
    { slug: "performance", label: "Progress & Grades", icon: <TrendingUp size={18} />, path: "/dashboard/performance" },
    { slug: "support", label: "Live Support", icon: <Sparkles size={18} />, path: "/dashboard/support" }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 hidden lg:flex flex-col border-r border-black/10 bg-white shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-black/10">
          <img 
            src="/img/Matrixroot_onlyimglogo-removebg-preview.png" 
            alt="Matrix Root Logo" 
            className="w-10 h-10 object-contain"
          />
          <span className="font-bold text-base text-black">Matrix Root Studio</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-black/40 uppercase tracking-wider mb-2">My Learning</p>
          {navigationItems.map((item) => (
            <SidebarItem 
              key={item.slug}
              icon={item.icon}
              label={item.label}
              active={activeSlug === item.slug}
              onClick={() => {
                if (item.path.startsWith("http") || item.path.includes("window.location")) {
                  window.location.href = item.path;
                } else {
                  router.push(item.path);
                }
              }}
            />
          ))}
          
          <div className="pt-6">
            <p className="px-3 text-[10px] font-bold text-black/40 uppercase tracking-wider mb-2">Account Management</p>
            <SidebarItem 
              icon={<User size={18} />} 
              label="Profile Setup" 
              active={activeSlug === "profile"} 
              onClick={() => {
                // profile setup page often uses redirect or router
                router.push('/profile');
              }} 
            />
            <SidebarItem 
              icon={<LogOut size={18} />} 
              label="Sign Out" 
              onClick={handleSignOut} 
            />
          </div>
        </nav>

        <div className="p-4 border-t border-black/10">
          <div className="flex items-center gap-3 p-2 rounded-[12px] bg-neutral-50 border border-black/10">
            <div className="w-8 h-8 rounded-[8px] bg-[#FDBF84]/20 border border-[#FDBF84]/35 flex items-center justify-center text-black font-bold text-xs">
              {profile?.full_name?.charAt(0) || "S"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-black truncate">{profile?.full_name || "Student Account"}</p>
              <p className="text-[10px] text-black/60 truncate font-medium">{profile?.departments?.name || "Active Program"}</p>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-72 bg-white flex flex-col border-r border-black/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 flex items-center justify-between border-b border-black/10">
                <div className="flex items-center gap-3">
                  <img 
                    src="/img/Matrixroot_onlyimglogo-removebg-preview.png" 
                    alt="Matrix Root Logo" 
                    className="w-10 h-10 object-contain"
                  />
                  <span className="font-bold text-base text-black">Matrix Root</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-black/40 hover:text-black">
                  <X size={20} className="text-[#8B5A2B]" />
                </button>
              </div>
              
              <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                {navigationItems.map((item) => (
                  <SidebarItem 
                    key={item.slug}
                    icon={item.icon}
                    label={item.label}
                    active={activeSlug === item.slug}
                    onClick={() => {
                      setIsSidebarOpen(false);
                      router.push(item.path);
                    }}
                  />
                ))}
                <div className="pt-6">
                  <SidebarItem 
                    icon={<User size={18} />} 
                    label="Profile Setup" 
                    active={activeSlug === "profile"} 
                    onClick={() => {
                      setIsSidebarOpen(false);
                      router.push('/profile');
                    }} 
                  />
                  <SidebarItem 
                    icon={<LogOut size={18} />} 
                    label="Sign Out" 
                    onClick={handleSignOut} 
                  />
                </div>
              </nav>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
