"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "@/components/icons";

export function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-black/10 bg-[#FAF6F0] py-[64px] mt-[64px]">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid gap-16 md:grid-cols-4">
          <div className="md:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Logo" width={32} height={32} className="object-contain opacity-90" />
              <span className="font-bold text-base tracking-tight text-black">Matrix Root</span>
            </Link>
            <p className="max-w-md text-black/80 font-medium leading-relaxed text-xs">
              Web development, custom AI automation, and software solutions.
            </p>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FDBF84]/20 border border-[#FDBF84]/40 text-xs font-bold text-[#8B5A2B]">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>A Government Registered MSME Enterprise (UDYAM-TS-31-0053124)</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-wider text-black mb-6 uppercase">Navigation</h4>
            <ul className="space-y-3 text-xs font-medium text-black/80">
              <li><Link href="/#services" className="hover:text-black transition-colors">Services & Results</Link></li>
              <li><Link href="/careers" className="hover:text-black transition-colors">Internship Ecosystem</Link></li>
              <li><Link href="/signup" className="hover:text-black transition-colors">Explore Tracks</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-wider text-black mb-6 uppercase">Institution</h4>
            <ul className="space-y-3 text-xs font-medium text-black/80">
              <li><Link href="/login" className="hover:text-black transition-colors">Client/Student Login</Link></li>
              <li><Link href="#" className="hover:text-black transition-colors">Privacy Charter</Link></li>
              <li><Link href="/dashboard/support" className="hover:text-black transition-colors">Support Operations</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-[64px] pt-8 border-t border-black/10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-black/60 font-medium">
          <p>© {year || 2026} Matrix Root. Practical Tech Infrastructure.</p>
          <div className="flex items-center gap-6">
            <span>Ecosystem Integrity</span>
            <div className="h-4 w-px bg-black/10" />
            <span>Hyderabad & Bangalore, India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
