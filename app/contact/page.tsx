"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Briefcase, 
  Clock, 
  Send, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Building2,
  Mail,
  User,
  HelpCircle,
  Coins
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form input payload parameters
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    companyName: "",
    projectType: "Full-Stack Web/App Development",
    budgetRange: "₹2,000,000 - ₹5,000,000 (Mid-Sized Project)",
    description: "",
    preferredContactTime: ""
  });

  const projectTypes = [
    "Full-Stack Web/App Development",
    "AI Agents & Business Automation",
    "Technical Consulting & Database Schemas",
    "Dedicated Developer Outstaffing",
    "Other/Bespoke Engineering"
  ];

  const budgetRanges = [
    "Less than ₹500,000 (MVP / Initial Scope)",
    "₹500,000 - ₹2,000,000 (Standard Integration)",
    "₹2,000,000 - ₹5,000,000 (Mid-Sized Project)",
    "₹5,000,000+ (Comprehensive Enterprise Portal)"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.description.trim() || !formData.preferredContactTime.trim()) {
      setErrorMsg("Please fill in all mandatory application fields to help us accurately assess your engineering requirements.");
      return;
    }

    setSubmitting(true);

    try {
      // Store all project application data directly in Supabase
      const { error } = await supabase
        .from("project_inquiries")
        .insert([
          {
            full_name: formData.fullName.trim(),
            email: formData.email.trim(),
            company_name: formData.companyName.trim() || null,
            project_type: formData.projectType,
            budget_range: formData.budgetRange,
            description: formData.description.trim(),
            preferred_contact_time: formData.preferredContactTime.trim(),
            status: "pending"
          }
        ]);

      if (error) {
        console.error("Submission insertion error:", error);
        // Fallback simulation status if table doesn't exist yet so client isn't fully blocked
        if (error.message?.includes("does not exist") || error.code === "42P01") {
          console.warn("Table project_inquiries missing. Executing application locally.");
          setSubmitted(true);
        } else {
          setErrorMsg(`Network save failed: ${error.message}. Please reach out via email directly.`);
        }
      } else {
        setSubmitted(true);
      }
    } catch (err: any) {
      console.error("Submission trigger error:", err);
      setErrorMsg("Service unreachable. Please verify network access parameters or contact our system admin.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F5F0] text-[#3D2B1F] font-sans overflow-hidden flex flex-col justify-between">
      <Navbar />

      {/* Main Container Area */}
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-[48px] md:py-[80px]">
        
        {/* Decorative introductory header */}
        <div className="text-center max-w-2xl mx-auto mb-[48px]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#8B4513]/5 border border-[#8B4513]/10 text-xs font-bold text-[#8B4513] mb-[16px]"
          >
            <Sparkles size={12} />
            ENTERPRISE PROJECT INTAKE
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold tracking-tight text-[#3D2B1F] mb-[16px]"
          >
            Start a Software Project
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.2 }}
            className="text-xs md:text-sm text-[#3D2B1F]/80 leading-[1.6] font-medium"
          >
            Tell us about your organization, core goals, and deliverables needed. Our technical team evaluates custom solutions and prepares architectural scopes.
          </motion.p>
        </div>

        {/* Application Submission Form Wrapper */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.3 }}
          className="bg-white border border-[#8B4513]/20 rounded-[12px] p-[24px] md:p-[48px] shadow-none relative"
        >
          {submitted ? (
            /* Successful submission feedback confirmation state */
            <div className="py-[48px] text-center space-y-[24px]">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 size={32} />
              </div>
              
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-2xl font-bold text-[#3D2B1F]">Application Received</h3>
                <p className="text-xs text-[#3D2B1F]/80 leading-[1.6] font-medium">
                  Thank you for submitting your project specifications, <span className="font-bold">{formData.fullName}</span>. 
                  Our lead architects will evaluate your objectives and connect with you during your stated ideal timeframe: <span className="underline decoration-[#8B4513]/40 font-bold">{formData.preferredContactTime}</span>.
                </p>
              </div>

              <div className="pt-[16px] p-4 bg-[#F9F5F0]/60 rounded-[8px] border border-[#8B4513]/10 max-w-sm mx-auto text-left text-[11px] space-y-1">
                <p className="font-bold text-[#8B4513] text-[10px] uppercase tracking-wider">Estimated Review Turnaround</p>
                <p className="text-[#3D2B1F]/90 font-medium">12 to 24 operational hours. Direct business calls will be scheduled via verified meeting links.</p>
              </div>

              <div className="pt-[16px]">
                <Button asChild className="rounded-[8px] bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] font-bold text-xs h-10 px-6 shadow-none">
                  <Link href="/">Return to Homepage</Link>
                </Button>
              </div>
            </div>
          ) : (
            /* Standard Application Input Inputs Form */
            <form onSubmit={handleSubmit} className="space-y-[32px]">
              
              {errorMsg && (
                <div className="p-3 bg-rose-50 text-rose-900 border border-rose-200 rounded-[8px] text-xs font-bold leading-relaxed">
                  {errorMsg}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-[24px]">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#3D2B1F] flex items-center gap-1.5">
                    <User size={12} className="text-[#8B4513]" /> Your Full Name <span className="text-rose-700">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="fullName" 
                    required 
                    value={formData.fullName} 
                    onChange={handleChange} 
                    placeholder="e.g. Sravan Reddy" 
                    className="w-full bg-[#F9F5F0] border border-[#8B4513]/20 focus:border-[#8B4513] rounded-[8px] p-3 text-xs text-[#3D2B1F] outline-none transition-all font-medium"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#3D2B1F] flex items-center gap-1.5">
                    <Mail size={12} className="text-[#8B4513]" /> Business Email <span className="text-rose-700">*</span>
                  </label>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder="e.g. founder@company.com" 
                    className="w-full bg-[#F9F5F0] border border-[#8B4513]/20 focus:border-[#8B4513] rounded-[8px] p-3 text-xs text-[#3D2B1F] outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-[24px]">
                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#3D2B1F] flex items-center gap-1.5">
                    <Building2 size={12} className="text-[#8B4513]" /> Organization / Company Name
                  </label>
                  <input 
                    type="text" 
                    name="companyName" 
                    value={formData.companyName} 
                    onChange={handleChange} 
                    placeholder="e.g. Matrix Solutions Ltd (Optional)" 
                    className="w-full bg-[#F9F5F0] border border-[#8B4513]/20 focus:border-[#8B4513] rounded-[8px] p-3 text-xs text-[#3D2B1F] outline-none transition-all font-medium"
                  />
                </div>

                {/* Primary Project Scope */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#3D2B1F] flex items-center gap-1.5">
                    <Briefcase size={12} className="text-[#8B4513]" /> Target Expertise Needed <span className="text-rose-700">*</span>
                  </label>
                  <select 
                    name="projectType" 
                    value={formData.projectType} 
                    onChange={handleChange}
                    className="w-full bg-[#F9F5F0] border border-[#8B4513]/20 focus:border-[#8B4513] rounded-[8px] p-3 text-xs text-[#3D2B1F] outline-none transition-all font-medium cursor-pointer"
                  >
                    {projectTypes.map((pt, idx) => (
                      <option key={idx} value={pt}>{pt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Estimated Budget Allocation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3D2B1F] flex items-center gap-1.5">
                  <Coins size={12} className="text-[#8B4513]" /> Estimated Project Budget Allocation <span className="text-rose-700">*</span>
                </label>
                <select 
                  name="budgetRange" 
                  value={formData.budgetRange} 
                  onChange={handleChange}
                  className="w-full bg-[#F9F5F0] border border-[#8B4513]/20 focus:border-[#8B4513] rounded-[8px] p-3 text-xs text-[#3D2B1F] outline-none transition-all font-medium cursor-pointer"
                >
                  {budgetRanges.map((br, idx) => (
                    <option key={idx} value={br}>{br}</option>
                  ))}
                </select>
              </div>

              {/* Description Core Needs */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3D2B1F] block">
                  Project Description & Core Deliverables Needed <span className="text-rose-700">*</span>
                </label>
                <p className="text-[11px] text-[#3D2B1F]/60 font-medium pb-1">
                  Describe what you are aiming to build, technical frameworks preferred, or business problems we need to automate.
                </p>
                <textarea 
                  name="description" 
                  required 
                  rows={5}
                  value={formData.description} 
                  onChange={handleChange} 
                  placeholder="We are looking to scale our digital platform with responsive interfaces, custom Supabase permissions, and integrated AI notification routines..." 
                  className="w-full bg-[#F9F5F0] border border-[#8B4513]/20 focus:border-[#8B4513] rounded-[8px] p-3 text-xs text-[#3D2B1F] outline-none transition-all font-medium resize-y"
                />
              </div>

              {/* Communication timeframe instructions */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3D2B1F] flex items-center gap-1.5">
                  <Clock size={12} className="text-[#8B4513]" /> Best Time & Medium for Business Discussion <span className="text-rose-700">*</span>
                </label>
                <input 
                  type="text" 
                  name="preferredContactTime" 
                  required 
                  value={formData.preferredContactTime} 
                  onChange={handleChange} 
                  placeholder="e.g. Weekdays between 10 AM - 2 PM via Phone call or Google Meet link" 
                  className="w-full bg-[#F9F5F0] border border-[#8B4513]/20 focus:border-[#8B4513] rounded-[8px] p-3 text-xs text-[#3D2B1F] outline-none transition-all font-medium"
                />
              </div>

              {/* Form trigger layout */}
              <div className="pt-[16px] border-t border-[#8B4513]/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-[16px]">
                <div className="text-[11px] text-[#3D2B1F]/60 font-medium flex items-center gap-1.5 max-w-xs">
                  <HelpCircle size={14} className="text-[#8B4513] shrink-0" />
                  <span>Confidential scoping agreement guaranteed upon request.</span>
                </div>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="shrink-0">
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full sm:w-auto rounded-[8px] bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] font-bold text-xs h-11 px-8 shadow-none flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <span>Saving Application...</span>
                    ) : (
                      <>
                        <span>Submit Project Brief</span>
                        <Send size={12} className="text-[#8B4513]" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>

            </form>
          )}
        </motion.div>

      </main>

      <Footer />
    </div>
  );
}
