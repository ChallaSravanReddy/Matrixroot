"use client";

import { useTheme } from "./ThemeProvider";
import { useEffect, useState } from "react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-xl border border-slate-200 hover:border-blue-500/50 transition-all active:scale-95 group relative overflow-hidden ${className}`}
      aria-label="Toggle Theme"
    >
      <div className="relative w-5 h-5 z-10">
        {/* Sun Icon */}
        <div className={`absolute inset-0 transition-all duration-500 transform ${theme === 'dark' ? 'translate-y-10 opacity-0 rotate-90' : 'translate-y-0 opacity-100 rotate-0'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-sky-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M3 12h2.25m.386-6.364l1.591 1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M3 12h2.25m.386-6.364l1.591 1.591" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        </div>
        
        {/* Moon Icon */}
        <div className={`absolute inset-0 transition-all duration-500 transform ${theme === 'light' ? '-translate-y-10 opacity-0 -rotate-90' : 'translate-y-0 opacity-100 rotate-0'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-blue-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
        </div>
      </div>
      
      {/* Background Glow */}
      <div className={`absolute inset-0 opacity-10 blur-lg transition-colors duration-500 ${theme === 'dark' ? 'bg-blue-600' : 'bg-sky-600'}`}></div>
    </button>
  );
}
