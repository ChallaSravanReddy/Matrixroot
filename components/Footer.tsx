"use client";

import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/30 py-20 mt-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
      
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid gap-16 md:grid-cols-4">
          <div className="md:col-span-2 space-y-8">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Logo" width={32} height={32} />
              <span className="font-black text-2xl tracking-tighter">Matrix Root</span>
            </Link>
            <p className="max-w-md text-muted-foreground font-medium leading-relaxed">
              We build scalable digital infrastructure for the future. From enterprise-grade web development to AI automation, we provide software solutions that drive real business growth.
            </p>
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-primary/5 border border-primary/10 text-xs font-bold text-primary">
              <ShieldCheck className="h-4 w-4" />
              UDYAM REGISTERED MSME • GOVT. OF INDIA
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground mb-8">Solutions</h4>
            <ul className="space-y-4 text-sm font-bold text-muted-foreground">
              <li><Link href="/#services" className="hover:text-primary transition-colors">Digital Infrastructure</Link></li>
              <li><Link href="/#services" className="hover:text-primary transition-colors">AI Automation</Link></li>
              <li><Link href="/#services" className="hover:text-primary transition-colors">Custom Software</Link></li>
              <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground mb-8">Company</h4>
            <ul className="space-y-4 text-sm font-bold text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Contact Support</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Verify Certificate</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <p>© {new Date().getFullYear()} Matrix Root Technologies. No-Bluff Software Engineering.</p>
          <div className="flex items-center gap-6">
            <span>Built with precision</span>
            <div className="h-4 w-px bg-border/40" />
            <span>Bangalore, India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
