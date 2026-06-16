"use client";

import { motion } from "framer-motion";
import { Shield, Sparkles, Scale, FileText, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 container mx-auto max-w-4xl px-4 py-[48px] md:py-[80px]">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-[48px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#8B5A2B]/10 border border-[#8B5A2B]/20 text-xs font-bold text-[#8B5A2B] mb-[16px]"
          >
            <Sparkles size={12} />
            Agreement Terms
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold tracking-tight text-black mb-[16px]"
          >
            Terms & Conditions
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.2 }}
            className="text-xs md:text-sm text-black/60 leading-[1.6] font-medium"
          >
            Last Updated: June 16, 2026. Please read these terms carefully before participating in our programs.
          </motion.p>
        </div>

        {/* Content Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.3 }}
          className="bg-white border border-black/10 rounded-[16px] p-[28px] md:p-[48px] shadow-none space-y-8"
        >
          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-black flex items-center gap-2">
              <Scale size={16} className="text-[#8B5A2B]" /> 1. Agreement to Terms
            </h2>
            <p className="text-xs md:text-sm text-black/80 leading-relaxed font-medium">
              By accessing our online learning portal, registering an account, or enrolling in any Matrix Root training or internship program (both online and offline), you agree to be bound by these Terms and Conditions. If you do not agree, you are prohibited from utilizing our services.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-black flex items-center gap-2">
              <Shield size={16} className="text-[#8B5A2B]" /> 2. Student Registration & Accounts
            </h2>
            <p className="text-xs md:text-sm text-black/80 leading-relaxed font-medium">
              To participate in our training courses or internships, you must register a student account. You agree to provide accurate, current, and complete registration information (including your name, email, phone number, and college/professional background). You are responsible for keeping your password secure and for all activities that occur under your account.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-black flex items-center gap-2">
              <FileText size={16} className="text-[#8B5A2B]" /> 3. Internship Scope & Requirements
            </h2>
            <p className="text-xs md:text-sm text-black/80 leading-relaxed font-medium">
              Matrix Root internships are experiential programs designed to prepare students for careers in software engineering, IT, and specialized branches. Active students are required to submit weekly reports, progress updates, and code repositories as requested by their instructors. Failure to submit verified weekly progress updates may result in suspension from the track.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-black flex items-center gap-2">
              <Shield size={16} className="text-[#8B5A2B]" /> 4. Certification & Verifiability
            </h2>
            <p className="text-xs md:text-sm text-black/80 leading-relaxed font-medium">
              Verifiable internship certificates are issued to students who successfully satisfy all program milestones, submit authentic tasks, and achieve the minimum performance rating. Matrix Root registers all certificate IDs on a public registry. We reserve the absolute right to audit submissions, investigate code duplication/plagiarism, and revoke certificates at any time if academic dishonesty is identified.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-black flex items-center gap-2">
              <Scale size={16} className="text-[#8B5A2B]" /> 5. Intellectual Property
            </h2>
            <p className="text-xs md:text-sm text-black/80 leading-relaxed font-medium">
              All learning materials, project blueprints, code templates, curriculum documentation, and video content provided by Matrix Root remain the intellectual property of Matrix Root. You are granted a personal, non-transferable, and non-exclusive license to use these materials solely for educational purposes during your program.
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-black flex items-center gap-2">
              <Scale size={16} className="text-[#8B5A2B]" /> 6. Code of Conduct
            </h2>
            <p className="text-xs md:text-sm text-black/80 leading-relaxed font-medium">
              You agree to engage in a respectful manner with all instructors, advisors, and peers. You must not engage in any activity that disrupts or harms the learning management system, including bypassing authorization controls, using automated scrapers, or sharing platform materials with unauthorized users.
            </p>
          </div>

          {/* Section 7 */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-black flex items-center gap-2">
              <Shield size={16} className="text-[#8B5A2B]" /> 7. Limitation of Liability
            </h2>
            <p className="text-xs md:text-sm text-black/80 leading-relaxed font-medium">
              Matrix Root training programs, materials, and certificates are provided on an &quot;as-is&quot; basis. We make no guarantees, warranties, or representations of any kind, express or implied. Under no circumstances shall Matrix Root be liable for any indirect, incidental, or consequential damages resulting from platform use or program participation.
            </p>
          </div>

          {/* Bottom actions */}
          <div className="pt-8 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[11px] text-black/50 font-medium">
              Copyright © 2026 Matrix Root. All rights reserved.
            </div>
            
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-bold text-black hover:text-[#8B5A2B] transition-colors"
            >
              <ArrowLeft size={14} className="text-[#8B5A2B]" /> Back to Login
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
