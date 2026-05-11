"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/#services", label: "Services" },
    { href: "/careers", label: "Careers" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl transition-all duration-300">
      <div className="container mx-auto max-w-7xl px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Image 
                src="/img/Matrixroot_onlyimglogo-removebg-preview.png" 
                alt="Matrix Root Logo" 
                width={36} 
                height={36} 
                className="object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300" 
                priority 
              />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500 -z-10" />
            </div>
            <span className="font-black text-xl tracking-tighter text-foreground">
              Matrix Root
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm font-bold tracking-tight transition-colors rounded-full ${
                  pathname === link.href 
                    ? "text-primary bg-primary/5" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <Link 
              href="/login" 
              className="px-4 py-2 text-sm font-bold tracking-tight text-muted-foreground hover:text-primary transition-colors"
            >
              Login
            </Link>
            <Button asChild size="sm" className="rounded-full px-6 font-bold shadow-lg shadow-primary/20 bg-primary hover:shadow-primary/40 transition-all">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
          <div className="h-6 w-px bg-border/60 mx-1 hidden sm:block" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
