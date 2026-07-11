"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, GraduationCap, Building2, Calendar, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEPARTMENTS = [
  { id: "cse", name: "Computer Science & Allied Branches" },
  { id: "it", name: "Information Technology" },
  { id: "eee", name: "Electrical & Electronics" },
  { id: "mech", name: "Mechanical Engineering" },
];

export function ProfileCompletionModal({
  userId,
  initialData,
  onComplete
}: {
  userId: string,
  initialData: {
    department_slug?: string;
    year_of_study?: string;
    college_name?: string;
    phone?: string;
    role?: string;
  } | null | undefined,
  onComplete: () => void
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    department_slug: initialData?.department_slug || "",
    year_of_study: initialData?.year_of_study || "",
    college_name: initialData?.college_name || "",
    phone: initialData?.phone || "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.from("profiles").upsert({
        id: userId,
        department_slug: formData.department_slug,
        year_of_study: formData.year_of_study,
        college_name: formData.college_name,
        phone: formData.phone,
        has_accepted_terms: true,
        role: initialData?.role || 'student'
      }, { onConflict: 'id' });

      if (updateError) throw updateError;
      onComplete();
    } catch (err: unknown) {
      const errMsg = (err as { message?: string })?.message || "Failed to update profile. Please try again.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xs p-[24px]">
      <div className="w-full max-w-lg bg-white border border-black/10 rounded-[16px] shadow-2xl p-[32px] md:p-[48px]">
        <div className="text-center mb-[32px]">
          <h2 className="text-2xl font-bold text-black mb-[8px]">Complete Your Profile</h2>
          <p className="text-sm text-black/70">Please provide these details to unlock your dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-[24px]">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-black/60 block">Branch</label>
            <div className="relative">
              <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B5A2B] h-4 w-4" />
              <select
                required
                value={formData.department_slug}
                onChange={(e) => setFormData({ ...formData, department_slug: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-black/10 rounded-[12px] focus:outline-none focus:border-black transition-all text-sm text-black appearance-none"
              >
                <option value="" disabled>Select Branch</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-black/60 block">Year of Study</label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B5A2B] h-4 w-4" />
              <select
                required
                value={formData.year_of_study}
                onChange={(e) => setFormData({ ...formData, year_of_study: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-black/10 rounded-[12px] focus:outline-none focus:border-black transition-all text-sm text-black appearance-none"
              >
                <option value="" disabled>Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
                <option value="Graduated">Graduated</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-black/60 block">Institution / College Name</label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B5A2B] h-4 w-4" />
              <input
                type="text"
                required
                value={formData.college_name}
                onChange={(e) => setFormData({ ...formData, college_name: e.target.value })}
                placeholder="e.g. Matrix University"
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-black/10 rounded-[12px] focus:outline-none focus:border-black transition-all text-sm text-black"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-black/60 block">Contact Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B5A2B] h-4 w-4" />
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. 9876543210"
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-black/10 rounded-[12px] focus:outline-none focus:border-black transition-all text-sm text-black"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 text-xs font-bold text-[#8B5A2B] bg-[#FDBF84]/25 border border-[#FDBF84]/40 rounded-[12px]">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-[12px] bg-[#FDBF84] text-neutral-900 hover:bg-[#FCAE68] shadow-none font-extrabold mt-[12px] border border-[#FDBF84]/25 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-neutral-900" />
            ) : (
              <>Save Profile <ArrowRight className="ml-2 h-4 w-4 text-neutral-900" /></>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
