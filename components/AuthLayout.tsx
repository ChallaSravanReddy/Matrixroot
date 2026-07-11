"use client";

import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-0 sm:p-4 md:p-8 bg-[#FAF6F0] overflow-hidden font-sans select-none">
      <div className="absolute inset-0 z-0 hidden min-[425px]:block pointer-events-none overflow-hidden">
        <div className="max-w-[1600px] mx-auto h-full relative">
          
          {/* ================= LEFT SIDE DIAGRAMS ================= */}

          {/* 1. Open Book (Study / Education) */}
          <div className="absolute left-[3%] top-[8%] rotate-[-6deg] hover:scale-105 hover:opacity-60 transition-all duration-300 pointer-events-auto cursor-default opacity-20">
            <svg width="100" height="70" viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 20C10 20 25 15 50 25C75 15 90 20 90 20V55C90 55 75 50 50 60C25 50 10 55 10 55V20Z" fill="white" stroke="#1A1A1A" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M50 25V60" stroke="#1A1A1A" strokeWidth="2.5" />
              <path d="M20 30H40M20 37H40M20 44H35" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
              <path d="M60 30H80M60 37H80M60 44H75" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          {/* 2. Big Cartesian Geometry Graph (Math/Physics) */}
          <div className="absolute left-[8%] top-[20%] rotate-[3deg] hover:scale-102 hover:opacity-60 transition-all duration-300 pointer-events-auto cursor-default opacity-20">
            <svg width="220" height="200" viewBox="0 0 220 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 180H200" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M20 180V10" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M195 175L200 180L195 185" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 15L20 10L25 15" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M30 60C70 170 120 170 180 30" stroke="#FDBF84" strokeWidth="4.5" strokeLinecap="round" />
              <circle cx="105" cy="132" r="5" fill="#1A1A1A" />
              <path d="M105 132V180" stroke="#1A1A1A" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d="M105 132H20" stroke="#1A1A1A" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="115" y="130" fill="#1A1A1A" fontSize="12" fontFamily="monospace" fontWeight="bold">P(x, y)</text>
              <text x="145" y="70" fill="#1A1A1A" fontSize="11" fontFamily="monospace" fontWeight="bold">y = sin(x)</text>
              <path d="M40 180C40 160 55 160 55 180" stroke="#1A1A1A" strokeWidth="1.5" />
              <text x="45" y="172" fill="#1A1A1A" fontSize="10" fontFamily="sans-serif">θ</text>
            </svg>
          </div>

          {/* 3. Big Mechanical Gear Assembly (Mechanical Engineering) */}
          <div className="absolute left-[2%] top-[45%] rotate-[-4deg] hover:scale-102 hover:opacity-60 transition-all duration-300 pointer-events-auto cursor-default opacity-20">
            <svg width="240" height="200" viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(70, 110)">
                <circle cx="0" cy="0" r="50" fill="white" stroke="#1A1A1A" strokeWidth="3" />
                <circle cx="0" cy="0" r="18" fill="#FAF6F0" stroke="#1A1A1A" strokeWidth="2.5" />
                <path d="M0 -50V-60M0 50V60M-50 0H-60M50 0H60M-35 -35L-42 -42M35 35L42 42M42 -35L49 -42M-35 35L-42 42" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
                <path d="M-30 -30C-10 -45 10 -45 30 -30" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
                <path d="M25 -32L30 -30L28 -24" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </g>
              <g transform="translate(160, 60)">
                <circle cx="0" cy="0" r="35" fill="white" stroke="#1A1A1A" strokeWidth="3" />
                <circle cx="0" cy="0" r="12" fill="#FAF6F0" stroke="#1A1A1A" strokeWidth="2" />
                <path d="M0 -35V-42M0 35V42M-35 0H-42M35 0H42M-25 -25L-30 -30M25 25L30 30M25 -25L30 -30M-25 25L-30 30" stroke="#1A1A1A" strokeWidth="4.5" strokeLinecap="round" />
              </g>
              <text x="135" y="145" fill="#1A1A1A" fontSize="12" fontFamily="monospace" fontWeight="bold">τ = I·α</text>
            </svg>
          </div>

          {/* 4. Electrical Circuit Schematic (Electrical Engineering) */}
          <div className="absolute left-[8%] top-[72%] rotate-[6deg] hover:scale-105 hover:opacity-60 transition-all duration-300 pointer-events-auto cursor-default opacity-20">
            <svg width="130" height="70" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 30H30L35 15L43 45L51 15L59 45L67 15L75 45L80 30H110" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="20" cy="30" r="4.5" fill="#FDBF84" stroke="#1A1A1A" strokeWidth="1.5" />
              <circle cx="100" cy="30" r="4.5" fill="#FDBF84" stroke="#1A1A1A" strokeWidth="1.5" />
              <text x="50" y="58" fill="#1A1A1A" fontSize="11" fontFamily="monospace" fontWeight="bold">R = 100 Ω</text>
            </svg>
          </div>

          {/* 5. Drafting Compass (Mechanical / Math) */}
          <div className="absolute left-[3%] top-[84%] rotate-[-12deg] hover:scale-105 hover:opacity-60 transition-all duration-300 pointer-events-auto cursor-default opacity-20">
            <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 10L30 85" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M50 10L70 85" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="50" cy="10" r="6" fill="#FDBF84" stroke="#1A1A1A" strokeWidth="2" />
              <path d="M38 55H62" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
              <circle cx="50" cy="55" r="4.5" fill="#1A1A1A" />
            </svg>
          </div>


          {/* ================= RIGHT SIDE DIAGRAMS ================= */}

          {/* 1. Graduation Cap (Study / Edtech) */}
          <div className="absolute right-[3%] top-[8%] rotate-[8deg] hover:scale-105 hover:opacity-60 transition-all duration-300 pointer-events-auto cursor-default opacity-20">
            <svg width="100" height="70" viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 10L90 28L50 46L10 28L50 10Z" fill="white" stroke="#1A1A1A" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M26 36V48C26 54 36 58 50 58C64 58 74 54 74 48V36" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M90 28V46M90 46L85 52M90 46L95 52" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          {/* 2. Big Logic Gates & Op-Amp Circuit (Electrical / Programming) */}
          <div className="absolute right-[8%] top-[20%] rotate-[-2deg] hover:scale-102 hover:opacity-60 transition-all duration-300 pointer-events-auto cursor-default opacity-20">
            <svg width="250" height="180" viewBox="0 0 250 180" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Logic gate - AND */}
              <path d="M30 40H60C75 40 85 50 85 65C85 80 75 90 60 90H30V40Z" fill="white" stroke="#1A1A1A" strokeWidth="3" strokeLinejoin="round" />
              <path d="M10 50H30M10 80H30" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
              <text x="12" y="44" fill="#1A1A1A" fontSize="11" fontFamily="monospace" fontWeight="bold">A</text>
              <text x="12" y="74" fill="#1A1A1A" fontSize="11" fontFamily="monospace" fontWeight="bold">B</text>
              <path d="M85 65H120V110H140" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {/* Op-amp */}
              <path d="M140 90L190 115L140 140V90Z" fill="white" stroke="#1A1A1A" strokeWidth="3" strokeLinejoin="round" />
              <path d="M120 130H140" stroke="#1A1A1A" strokeWidth="2.5" />
              <text x="145" y="105" fill="#1A1A1A" fontSize="12" fontFamily="monospace" fontWeight="bold">+</text>
              <text x="145" y="133" fill="#1A1A1A" fontSize="12" fontFamily="monospace" fontWeight="bold">-</text>
              <path d="M190 115H230" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
              <text x="215" y="105" fill="#1A1A1A" fontSize="11" fontFamily="monospace" fontWeight="bold">Out</text>
            </svg>
          </div>

          {/* 3. Big Bohr Atom & energy transition (Physics / Chemistry) */}
          <div className="absolute right-[2%] top-[45%] rotate-[5deg] hover:scale-102 hover:opacity-60 transition-all duration-300 pointer-events-auto cursor-default opacity-20">
            <svg width="240" height="220" viewBox="0 0 240 220" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="120" cy="110" r="90" stroke="#1A1A1A" strokeWidth="1.5" strokeDasharray="4 4" />
              <circle cx="120" cy="110" r="60" stroke="#1A1A1A" strokeWidth="2" strokeDasharray="3 3" />
              <circle cx="120" cy="110" r="30" stroke="#1A1A1A" strokeWidth="2.5" />
              <circle cx="120" cy="110" r="14" fill="#FDBF84" stroke="#1A1A1A" strokeWidth="2.5" />
              <text x="116" y="114" fill="#1A1A1A" fontSize="11" fontWeight="bold" fontFamily="sans-serif">+</text>
              <circle cx="68" cy="65" r="5" fill="#1A1A1A" />
              <circle cx="180" cy="110" r="5" fill="#1A1A1A" />
              <circle cx="120" cy="20" r="5" fill="#1A1A1A" />
              <circle cx="150" cy="162" r="5" fill="#1A1A1A" />
              <path d="M120 20C140 20 160 50 180 110" stroke="#FDBF84" strokeWidth="3" strokeDasharray="2 2" strokeLinecap="round" />
              <path d="M174 100L180 110L182 98" stroke="#FDBF84" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <text x="145" y="45" fill="#1A1A1A" fontSize="12" fontFamily="monospace" fontWeight="bold">h·ν</text>
              <text x="25" y="195" fill="#1A1A1A" fontSize="12" fontFamily="monospace" fontWeight="bold">E = -13.6 eV</text>
            </svg>
          </div>

          {/* 4. Code Monitor (Programming / Development) */}
          <div className="absolute right-[8%] top-[72%] rotate-[-4deg] hover:scale-105 hover:opacity-60 transition-all duration-300 pointer-events-auto cursor-default opacity-20">
            <svg width="105" height="85" viewBox="0 0 110 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="5" width="100" height="65" rx="8" fill="white" stroke="#1A1A1A" strokeWidth="2.5" />
              <path d="M35 70L25 82H85L75 70" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M35 25L20 37L35 49" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M75 25L90 37L75 49" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M58 20L48 54" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* 5. Idea Light Bulb (Innovation / Study) */}
          <div className="absolute right-[3%] top-[84%] rotate-[6deg] hover:scale-105 hover:opacity-60 transition-all duration-300 pointer-events-auto cursor-default opacity-20">
            <svg width="80" height="90" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M40 10C23 10 15 22 15 38C15 48 23 54 28 60V72H52V60C57 54 65 48 65 38C65 22 57 10 40 10Z" fill="white" stroke="#1A1A1A" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M32 78H48M35 84H45" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M33 50L37 34H43L47 50" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M40 2V6M10 20L14 23M70 20L66 23M4 38H8M76 38H72" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </div>


          {/* ================= OVERLAPPING BACKGROUND DIAGRAMS (Go under/around widget) ================= */}

          {/* 1. Programming Flowchart / Binary Tree (behind/left of card) */}
          <div className="absolute left-[31%] top-[12%] rotate-[10deg] opacity-[0.08] z-0">
            <svg width="220" height="180" viewBox="0 0 300 240" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="120" y="10" width="60" height="30" rx="8" fill="white" stroke="#1A1A1A" strokeWidth="2.5" />
              <text x="132" y="28" fill="#1A1A1A" fontSize="11" fontFamily="monospace" fontWeight="bold">Node</text>
              <path d="M130 40L80 80" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
              <path d="M170 40L220 80" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
              <rect x="50" y="80" width="60" height="30" rx="8" fill="white" stroke="#1A1A1A" strokeWidth="2.5" />
              <text x="63" y="98" fill="#1A1A1A" fontSize="11" fontFamily="monospace" fontWeight="bold">Left</text>
              <rect x="190" y="80" width="60" height="30" rx="8" fill="#FDBF84" stroke="#1A1A1A" strokeWidth="2.5" />
              <text x="202" y="98" fill="#1A1A1A" fontSize="11" fontFamily="monospace" fontWeight="bold">Right</text>
              <path d="M60 110L30 150" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
              <path d="M100 110L130 150" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
              <circle cx="20" cy="160" r="15" fill="white" stroke="#1A1A1A" strokeWidth="2.5" />
              <circle cx="140" cy="160" r="15" fill="white" stroke="#1A1A1A" strokeWidth="2.5" />
            </svg>
          </div>

          {/* 2. Chemistry Benzene Ring & organic compounds (behind/right of card) */}
          <div className="absolute right-[31%] top-[12%] rotate-[-8deg] opacity-[0.08] z-0">
            <svg width="180" height="180" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M60 10L100 33V79L60 102L20 79V33L60 10Z" fill="white" stroke="#1A1A1A" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M60 20L92 38V74L60 92L28 74V38L60 20Z" stroke="#1A1A1A" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="53" y="5" fill="#1A1A1A" fontSize="12" fontFamily="sans-serif" fontWeight="bold">OH</text>
              <text x="104" y="85" fill="#1A1A1A" fontSize="12" fontFamily="sans-serif" fontWeight="bold">CH₃</text>
            </svg>
          </div>

          {/* 3. Calculus Integration and area limit diagram (behind/bottom-left of card) */}
          <div className="absolute left-[33%] bottom-[12%] rotate-[-6deg] opacity-[0.08] z-0">
            <svg width="200" height="150" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 100H140M20 10V100" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
              <path d="M30 80C50 40 90 30 130 50" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M50 63V100M90 36V100" stroke="#1A1A1A" strokeWidth="1.5" strokeDasharray="2 2" />
              <text x="12" y="18" fill="#1A1A1A" fontSize="18" fontFamily="serif">∫</text>
              <text x="25" y="24" fill="#1A1A1A" fontSize="10" fontFamily="monospace">a</text>
              <text x="25" y="10" fill="#1A1A1A" fontSize="10" fontFamily="monospace">b</text>
              <text x="35" y="20" fill="#1A1A1A" fontSize="12" fontFamily="serif" fontWeight="bold">f(x)dx</text>
            </svg>
          </div>

          {/* 4. Electrical power equation & electromagnetic vectors (behind/bottom-right of card) */}
          <div className="absolute right-[33%] bottom-[12%] rotate-[6deg] opacity-[0.08] z-0">
            <svg width="200" height="150" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 90L90 10M90 10L170 90M90 10V110" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
              <path d="M40 60C60 45 120 45 140 60" stroke="#FDBF84" strokeWidth="2" strokeLinecap="round" />
              <text x="10" y="20" fill="#1A1A1A" fontSize="13" fontFamily="monospace" fontWeight="bold">∇ × E = -∂B/∂t</text>
              <text x="10" y="40" fill="#1A1A1A" fontSize="13" fontFamily="monospace" fontWeight="bold">P = V · I</text>
            </svg>
          </div>

        </div>
      </div>

      {/* CHILDREN (THE MAIN LOGIN / SIGNUP CARD) */}
      <div className="w-full flex justify-center items-center z-10">
        {children}
      </div>
    </div>
  );
}
