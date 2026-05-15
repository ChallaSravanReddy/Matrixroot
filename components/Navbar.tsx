"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/#services", label: "Services" },
    { href: "/careers", label: "Careers & Internships" },
    { href: "/contact", label: "Contact Us" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#8B4513]/10 bg-[#F9F5F0]/80 backdrop-blur-[10px] transition-all">
      <div className="container mx-auto max-w-7xl px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <Image 
              src="/img/Matrixroot_onlyimglogo-removebg-preview.png" 
              alt="Matrix Root Logo" 
              width={32} 
              height={32} 
              className="object-contain transition-transform duration-300 group-hover:opacity-90" 
              priority 
            />
            <span className="font-bold text-base tracking-tight text-[#3D2B1F]">
              Matrix Root
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3.5 py-2 text-xs font-bold tracking-tight transition-colors rounded-[8px] group ${
                    isActive 
                      ? "text-[#8B4513]" 
                      : "text-[#3D2B1F]/80 hover:text-[#3D2B1F]"
                  }`}
                >
                  {link.label}
                  {/* Subtle underline expanding from center on hover */}
                  <span className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all duration-300 ${
                    isActive ? "w-[calc(100%-20px)] bg-[#8B4513]" : "w-0 bg-[#8B4513] group-hover:w-[calc(100%-20px)]"
                  }`} />
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="relative text-xs font-bold tracking-tight text-[#3D2B1F] group py-1 px-2 hidden sm:block"
            >
              Student Login
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#8B4513] transition-all duration-300 group-hover:w-full rounded-full" />
            </Link>
            <Button asChild size="sm" className="rounded-[8px] px-5 h-9 font-bold text-xs bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] transition-colors shadow-none">
              <Link href="/contact">Start a Project</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
