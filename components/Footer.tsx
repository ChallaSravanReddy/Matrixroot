"use client";

import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#8B4513]/10 bg-[#F9F5F0] py-[80px] mt-[64px]">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid gap-16 md:grid-cols-4">
          <div className="md:col-span-2 space-y-8">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Logo" width={32} height={32} className="object-contain opacity-90" />
              <span className="font-medium text-xl tracking-tight text-[#3D2B1F]">Matrix Root</span>
            </Link>
            <p className="max-w-md text-[#3D2B1F]/80 font-normal leading-relaxed text-sm">
              Premium software engineering and educational excellence. Focused on clarity, timeless elegance, and foundational mastery.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[12px] bg-[#8B4513]/5 border border-[#8B4513]/10 text-xs font-medium text-[#8B4513]">
              <ShieldCheck className="h-4 w-4" />
              UDYAM REGISTERED INSTITUTION
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-wider text-[#3D2B1F] mb-6 uppercase">Navigation</h4>
            <ul className="space-y-4 text-sm font-medium text-[#3D2B1F]/80">
              <li><Link href="/#services" className="hover:text-[#3D2B1F] transition-colors">Curriculum</Link></li>
              <li><Link href="/#services" className="hover:text-[#3D2B1F] transition-colors">Expertise</Link></li>
              <li><Link href="/careers" className="hover:text-[#3D2B1F] transition-colors">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-wider text-[#3D2B1F] mb-6 uppercase">Institution</h4>
            <ul className="space-y-4 text-sm font-medium text-[#3D2B1F]/80">
              <li><Link href="/login" className="hover:text-[#3D2B1F] transition-colors">Portal Access</Link></li>
              <li><Link href="#" className="hover:text-[#3D2B1F] transition-colors">Privacy Charter</Link></li>
              <li><Link href="#" className="hover:text-[#3D2B1F] transition-colors">Support Desk</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-[64px] pt-8 border-t border-[#8B4513]/10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-[#3D2B1F]/60 font-normal">
          <p>© {new Date().getFullYear()} Matrix Root. Timeless craftsmanship and clarity.</p>
          <div className="flex items-center gap-6">
            <span>Elegance in Systems</span>
            <div className="h-4 w-px bg-[#8B4513]/10" />
            <span>Bangalore, India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
