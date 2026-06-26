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
    <header className="sticky top-0 z-50 w-full border-b border-black/10 bg-white/80 backdrop-blur-[10px] transition-all">
      {/* 3-column grid: logo (left) | nav links (center) | login (right) */}
      <div className="container mx-auto max-w-7xl px-4 h-20 grid grid-cols-[auto_1fr_auto] items-center gap-4">

        {/* Left — Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/img/Matrixroot_onlyimglogo-removebg-preview.png"
            alt="Matrix Root Logo"
            width={44}
            height={44}
            className="object-contain transition-opacity duration-300 group-hover:opacity-80"
            priority
          />
          <span className="font-bold text-base tracking-tight text-black">
            Matrix Root
          </span>
        </Link>

        {/* Centre — Nav links (desktop only) */}
        <nav className="hidden md:flex items-center justify-center gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3.5 py-2 text-xs font-bold tracking-tight transition-colors rounded-[8px] group ${
                  isActive ? "text-[#8B5A2B]" : "text-black/80 hover:text-black"
                }`}
              >
                {link.label}
                {/* Underline expanding from center on hover / active */}
                <span
                  className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-[calc(100%-20px)] bg-[#8B5A2B]"
                      : "w-0 bg-[#8B5A2B] group-hover:w-[calc(100%-20px)]"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Mobile: empty spacer so login stays pinned right */}
        <span className="md:hidden" />

        {/* Right — Student Login only */}
        {/* Desktop: text link with animated underline */}
        <Link
          href="/login"
          className="relative text-xs font-bold tracking-tight text-black group py-1 px-2 hidden sm:block whitespace-nowrap"
        >
          Student Login
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#8B5A2B] transition-all duration-300 group-hover:w-full rounded-full" />
        </Link>

        {/* Mobile: outlined button */}
        <Button
          asChild
          size="sm"
          variant="outline"
          className="rounded-[8px] px-5 h-9 font-bold text-xs border-black/20 text-black hover:bg-black/5 shadow-none sm:hidden whitespace-nowrap"
        >
          <Link href="/login">Student Login</Link>
        </Button>
      </div>
    </header>
  );
}
