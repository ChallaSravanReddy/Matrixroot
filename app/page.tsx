import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Code, Database, Layout, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Matrix Root Logo" width={32} height={32} className="object-contain sm:w-[40px] sm:h-[40px] drop-shadow-md" priority />
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 hidden sm:block">
                Matrix Root
              </span>
            </Link>
            
            {/* Login and Signup buttons on the right */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link 
                href="/login" 
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors px-2 sm:px-4 py-2 text-sm sm:base"
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-medium transition-all shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-sm sm:base"
              >
                Sign Up 
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-5 pb-5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-sky-50 -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-6">
                <Zap size={16} className="text-blue-600" />
                <span>Next-Gen Engineering Platform</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
                Accelerate your career with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-600">Matrix Root</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                The ultimate training-cum-internship platform designed to bridge the gap between academia and industry. Master modern technologies, build live projects, and earn your professional certification.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/signup" 
                  className="inline-flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-xl hover:shadow-2xl"
                >
                  Start Your Journey <ArrowRight size={20} />
                </Link>
                <Link 
                  href="#about" 
                  className="inline-flex justify-center items-center bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 px-8 py-4 rounded-full font-semibold text-lg transition-all"
                >
                  Learn More
                </Link>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="relative lg:h-[600px] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-sky-500/20 rounded-3xl transform rotate-3 scale-105 blur-2xl -z-10"></div>
              <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-white/50 bg-white p-2">
                <Image 
                  src="/hero.png" 
                  alt="Matrix Root Platform" 
                  width={800} 
                  height={800} 
                  className="rounded-xl object-cover w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Company / Features */}
      <section id="about" className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose Matrix Root?</h2>
            <p className="text-lg text-slate-600">
              We empower engineering students with industry-standard skills, hands-on experience, and verifiable credentials to succeed in the modern tech landscape.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Code className="text-blue-600" size={28} />}
              title="Modern Tech Stack"
              description="Learn by building with React, Next.js, Node.js, and other cutting-edge frameworks used by top tech companies worldwide."
            />
            <FeatureCard 
              icon={<Layout className="text-sky-600" size={28} />}
              title="Hands-on Internships"
              description="Transition from theory to practice through our structured internship programs that simulate real-world software engineering environments."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-sky-600" size={28} />}
              title="Verified Certifications"
              description="Earn an official, verifiable certification upon successful completion and admin approval, boosting your resume and credibility."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-sky-500/20 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-extrabold mb-2 text-white">50+</div>
              <div className="text-slate-400 font-medium">Live Projects</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold mb-2 text-white">10k+</div>
              <div className="text-slate-400 font-medium">Students Enrolled</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold mb-2 text-white">95%</div>
              <div className="text-slate-400 font-medium">Placement Rate</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold mb-2 text-white">24/7</div>
              <div className="text-slate-400 font-medium">Mentor Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Matrix Root Logo" width={32} height={32} className="object-contain drop-shadow-md" />
            <span className="font-bold text-lg text-slate-900">Matrix Root</span>
          </div>
          <p className="text-slate-500 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} Matrix Root Technologies. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-slate-400 hover:text-blue-600 transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-slate-400 hover:text-blue-600 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50 transition-all group">
      <div className="w-14 h-14 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
