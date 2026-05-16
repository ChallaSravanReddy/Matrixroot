"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { User, Mail, Lock, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        await supabase.from("profiles").upsert({ 
          id: data.user.id, 
          has_accepted_terms: true,
          full_name: fullName, 
          phone: phone,
          role: 'student'
        });
        window.location.href = "/onboarding";
      } else {
        setError("Success! Check your email for a verification link.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F5F0] p-[32px] md:p-[64px] text-[#3D2B1F] font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-[40px]">
          <Link href="/" className="inline-flex items-center gap-2 mb-[24px]">
            <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Logo" width={40} height={40} className="object-contain" />
            <span className="font-medium text-xl tracking-tight text-[#3D2B1F]">Matrix Root</span>
          </Link>
          <h2 className="text-2xl md:text-3xl font-normal tracking-[-0.02em] text-[#3D2B1F]">Institution Enrollment</h2>
          <p className="text-sm text-[#3D2B1F]/80 mt-1">Foundational membership & curriculum access</p>
        </div>

        <div className="bg-white border border-[#8B4513]/20 rounded-[12px] p-[32px] shadow-none">
          <form onSubmit={handleSignup} className="space-y-[24px]">
            <div className="space-y-[16px]">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#3D2B1F]/60">Full Legal Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3D2B1F]/40 h-4 w-4" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[#F9F5F0]/50 border border-[#8B4513]/20 rounded-[12px] focus:outline-none focus:border-[#8B4513] transition-all text-sm text-[#3D2B1F]"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#3D2B1F]/60">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3D2B1F]/40 h-4 w-4" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[#F9F5F0]/50 border border-[#8B4513]/20 rounded-[12px] focus:outline-none focus:border-[#8B4513] transition-all text-sm text-[#3D2B1F]"
                    placeholder="name@institution.edu"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#3D2B1F]/60">Secure Credentials</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3D2B1F]/40 h-4 w-4" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[#F9F5F0]/50 border border-[#8B4513]/20 rounded-[12px] focus:outline-none focus:border-[#8B4513] transition-all text-sm text-[#3D2B1F]"
                    placeholder="Minimum 6 characters"
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#3D2B1F]/60">Contact Number</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3D2B1F]/40 text-xs font-bold">+91</div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[#F9F5F0]/50 border border-[#8B4513]/20 rounded-[12px] focus:outline-none focus:border-[#8B4513] transition-all text-sm text-[#3D2B1F]"
                    placeholder="9876543210"
                    pattern="[0-9]{10}"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-[12px] bg-[#8B4513]/5 border border-[#8B4513]/10">
              <input
                id="terms"
                type="checkbox"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded-[4px] border-[#8B4513]/20 text-[#8B4513] focus:ring-0"
              />
              <label htmlFor="terms" className="text-xs text-[#3D2B1F] font-normal leading-relaxed cursor-pointer">
                I bind myself to the <span className="font-medium text-[#8B4513]">Matrix Root directives</span> and academic confidentiality agreements.
              </label>
            </div>

            {error && (
              <div className={`p-3 text-xs font-medium rounded-[12px] flex items-center gap-2 ${error.includes('Success') ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-[#8B4513] bg-[#8B4513]/5 border border-[#8B4513]/10'}`}>
                <ShieldCheck size={16} />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={!agreedToTerms || loading}
              className="w-full h-11 rounded-[12px] bg-[#D2B48C] text-[#3D2B1F] hover:bg-[#C1A37B] shadow-none font-medium mt-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#8B4513]" />
              ) : (
                <>Submit Identity Affirmation <ArrowRight className="ml-2 h-4 w-4 text-[#8B4513]" /></>
              )}
            </Button>
          </form>

          <div className="mt-[32px] text-center border-t border-[#8B4513]/10 pt-[24px]">
            <p className="text-xs text-[#3D2B1F]/60">
              Already possess authenticated credentials?{' '}
              <Link href="/login" className="text-[#8B4513] font-medium hover:underline">
                Access Portal
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
