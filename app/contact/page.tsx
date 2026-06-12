"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Building2, 
  Briefcase, 
  Coins, 
  Clock, 
  HelpCircle, 
  Send, 
  Sparkles, 
  CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";

const projectTypes = [
  "Custom Web Application Development",
  "AI Workflow & Automation Systems",
  "Supabase / Database Architecture Scoping",
  "Long-term Dedicated Tech Collaboration",
  "Other Custom Enterprise Solutions"
];

const budgetRanges = [
  "Under ₹50,000",
  "₹50,000 - ₹2,00,000",
  "₹2,00,000 - ₹5,00,000",
  "Above ₹5,00,000"
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    companyName: "",
    projectType: projectTypes[0],
    budgetRange: budgetRanges[0],
    description: "",
    preferredContactTime: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from("project_inquiries")
        .insert([{
          full_name: formData.fullName,
          email: formData.email,
          company_name: formData.companyName,
          project_type: formData.projectType,
          budget_range: formData.budgetRange,
          description: formData.description,
          preferred_contact_time: formData.preferredContactTime,
        }]);

      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      console.error("Submission trigger error:", err);
      setErrorMsg("Failed to submit. Please check your network connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans overflow-hidden flex flex-col justify-between">
      <Navbar />

      {/* Main Container Area */}
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-[48px] md:py-[80px]">

        {/* Decorative introductory header */}
        <div className="text-center max-w-2xl mx-auto mb-[48px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#8B5A2B]/10 border border-[#8B5A2B]/20 text-xs font-bold text-[#8B5A2B] mb-[16px]"
          >
            <Sparkles size={12} />
            Project Form
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold tracking-tight text-black mb-[16px]"
          >
            Start a Software Project
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.2 }}
            className="text-xs md:text-sm text-black/80 leading-[1.6] font-medium"
          >
            Tell us about your project, goals, and needs. Our team will get back to you with custom solutions.
          </motion.p>
        </div>

        {/* Application Submission Form Wrapper */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.3 }}
          className="bg-white border border-black/10 rounded-[12px] p-[24px] md:p-[48px] shadow-none relative"
        >
          {submitted ? (
            /* Successful submission feedback confirmation state */
            <div className="py-[48px] text-center space-y-[24px]">
              <div className="w-16 h-16 bg-[#8B5A2B]/10 text-[#8B5A2B] rounded-full flex items-center justify-center mx-auto border border-[#8B5A2B]/20">
                <CheckCircle2 size={32} className="text-[#8B5A2B]" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-2xl font-bold text-black">Application Received</h3>
                <p className="text-xs text-black/80 leading-[1.6] font-medium">
                  Thank you for submitting your project specifications, <span className="font-bold">{formData.fullName}</span>.
                  Our team will evaluate your objectives and connect with you during your stated ideal timeframe: <span className="underline decoration-[#8B5A2B]/40 font-bold">{formData.preferredContactTime}</span>.
                </p>
              </div>

              <div className="pt-[16px] p-4 bg-neutral-50 rounded-[8px] border border-black/10 max-w-sm mx-auto text-left text-[11px] space-y-1">
                <p className="font-bold text-[#8B5A2B] text-[10px] uppercase tracking-wider">Estimated Review Time</p>
                <p className="text-black/90 font-medium">12 to 24 hours.</p>
              </div>

              <div className="pt-[16px]">
                <Button asChild className="rounded-[8px] bg-black text-white hover:bg-neutral-900 font-bold text-xs h-10 px-6 shadow-none border-0">
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
                  <label className="text-xs font-bold text-black flex items-center gap-1.5">
                    <User size={12} className="text-[#8B5A2B]" /> Your Full Name <span className="text-rose-750">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Jane Doe"
                    className="w-full bg-neutral-50 border border-black/10 rounded-[8px] p-3 text-xs text-black outline-none focus:border-black transition-all font-medium"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black flex items-center gap-1.5">
                    <Mail size={12} className="text-[#8B5A2B]" /> Business Email <span className="text-rose-755">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. founder@company.com"
                    className="w-full bg-neutral-50 border border-black/10 rounded-[8px] p-3 text-xs text-black outline-none focus:border-black transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-[24px]">
                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black flex items-center gap-1.5">
                    <Building2 size={12} className="text-[#8B5A2B]" /> Organization / Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Matrix Solutions Ltd (Optional)"
                    className="w-full bg-neutral-50 border border-black/10 rounded-[8px] p-3 text-xs text-black outline-none focus:border-black transition-all font-medium"
                  />
                </div>

                {/* Primary Project Scope */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black flex items-center gap-1.5">
                    <Briefcase size={12} className="text-[#8B5A2B]" /> Target Expertise Needed <span className="text-rose-760">*</span>
                  </label>
                  <select
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleChange}
                    className="w-full bg-neutral-50 border border-black/10 rounded-[8px] p-3 text-xs text-black outline-none focus:border-black transition-all font-medium cursor-pointer"
                  >
                    {projectTypes.map((pt, idx) => (
                      <option key={idx} value={pt}>{pt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Estimated Budget Allocation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black flex items-center gap-1.5">
                  <Coins size={12} className="text-[#8B5A2B]" /> Estimated Project Budget Allocation <span className="text-rose-765">*</span>
                </label>
                <select
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleChange}
                  className="w-full bg-neutral-50 border border-black/10 rounded-[8px] p-3 text-xs text-black outline-none focus:border-black transition-all font-medium cursor-pointer"
                >
                  {budgetRanges.map((br, idx) => (
                    <option key={idx} value={br}>{br}</option>
                  ))}
                </select>
              </div>

              {/* Description Core Needs */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black block">
                  Project Description & Core Deliverables Needed <span className="text-rose-770">*</span>
                </label>
                <p className="text-[11px] text-black/60 font-medium pb-1">
                  Describe what you are aiming to build, technical frameworks preferred, or business problems we need to automate.
                </p>
                <textarea
                  name="description"
                  required
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="We are looking to scale our digital platform with responsive interfaces, custom Supabase permissions, and integrated AI notification routines..."
                  className="w-full bg-neutral-50 border border-black/10 rounded-[8px] p-3 text-xs text-black outline-none focus:border-black transition-all font-medium resize-y"
                />
              </div>

              {/* Communication timeframe instructions */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black flex items-center gap-1.5">
                  <Clock size={12} className="text-[#8B5A2B]" /> Best Time & Medium for Business Discussion <span className="text-rose-775">*</span>
                </label>
                <input
                  type="text"
                  name="preferredContactTime"
                  required
                  value={formData.preferredContactTime}
                  onChange={handleChange}
                  placeholder="e.g. Weekdays between 10 AM - 2 PM via Phone call or Google Meet link"
                  className="w-full bg-neutral-50 border border-black/10 rounded-[8px] p-3 text-xs text-black outline-none focus:border-black transition-all font-medium"
                />
              </div>

              {/* Form trigger layout */}
              <div className="pt-[16px] border-t border-black/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-[16px]">
                <div className="text-[11px] text-black/60 font-medium flex items-center gap-1.5 max-w-xs">
                  <HelpCircle size={14} className="text-[#8B5A2B] shrink-0" />
                  <span>Confidential scoping agreement guaranteed upon request.</span>
                </div>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="shrink-0">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto rounded-[8px] bg-black text-white hover:bg-neutral-900 font-bold text-xs h-11 px-8 shadow-none flex items-center justify-center gap-2 border-0"
                  >
                    {submitting ? (
                      <span>Saving Application...</span>
                    ) : (
                      <>
                        <span>Submit Project</span>
                        <Send size={12} className="text-[#8B5A2B]" />
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
