"use client";

import React, { Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import { useSidebarContext, SidebarProvider } from "@/components/SidebarContext";
import { usePathname } from "next/navigation";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isSidebarOpen, setIsSidebarOpen } = useSidebarContext();

  // Explicitly check if the current route path gets the main navigation sidebar
  const hasSidebar = 
    pathname === "/dashboard" ||
    pathname === "/dashboard/courses" ||
    pathname === "/dashboard/internships" ||
    pathname === "/dashboard/performance" ||
    pathname === "/dashboard/support" ||
    pathname === "/workspace" ||
    pathname === "/profile";

  if (!hasSidebar) {
    return <>{children}</>;
  }

  const activeSlug = (() => {
    if (pathname === "/dashboard") return "dashboard";
    if (pathname.startsWith("/dashboard/courses")) return "courses";
    if (pathname.startsWith("/workspace")) return "workspace";
    if (pathname.startsWith("/dashboard/internships")) return "internships";
    if (pathname.startsWith("/dashboard/performance")) return "performance";
    if (pathname.startsWith("/dashboard/support")) return "support";
    if (pathname.startsWith("/profile")) return "profile";
    return "dashboard";
  })() as any;

  return (
    <div className="flex h-screen bg-[#FAF6F0] text-black overflow-hidden font-sans">
      <Sidebar 
        activeSlug={activeSlug} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
      />
      {children}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Suspense fallback={null}>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </Suspense>
    </SidebarProvider>
  );
}
