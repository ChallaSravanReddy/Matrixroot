"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        await supabase.from("profiles").update({ has_accepted_terms: true }).eq("id", data.user.id);
        
        const { data: profile } = await supabase.from("profiles").select("department_slug").eq("id", data.user.id).single();
          
        if (!profile?.department_slug) {
          window.location.href = "/onboarding";
        } else {
          window.location.href = "/dashboard";
        }
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
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
          <h2 className="text-2xl md:text-3xl font-normal tracking-[-0.02em] text-[#3D2B1F]">Member Affirmation</h2>
          <p className="text-sm text-[#3D2B1F]/80 mt-1">Authenticate access to verified ledgers</p>
        </div>

        <div className="bg-white border border-[#8B4513]/20 rounded-[12px] p-[32px] shadow-none">
          <form onSubmit={handleLogin} className="space-y-[24px]">
            <div className="space-y-[16px]">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#3D2B1F]/60">Email Identity</label>
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
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-[#3D2B1F]/60">Secure Passphrase</label>
                  <Link href="/forgot-password" className="text-[10px] font-medium text-[#8B4513] uppercase tracking-wider hover:underline">Reset</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3D2B1F]/40 h-4 w-4" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[#F9F5F0]/50 border border-[#8B4513]/20 rounded-[12px] focus:outline-none focus:border-[#8B4513] transition-all text-sm text-[#3D2B1F]"
                    placeholder="••••••••"
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
                I re-verify adherence to <span className="font-medium text-[#8B4513]">institution operational boundaries</span>.
              </label>
            </div>

            {error && (
              <div className="p-3 text-xs font-medium text-[#8B4513] bg-[#8B4513]/5 border border-[#8B4513]/10 rounded-[12px] flex items-center gap-2">
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
                <>Establish Session <ArrowRight className="ml-2 h-4 w-4 text-[#8B4513]" /></>
              )}
            </Button>
          </form>

          <div className="mt-[32px] text-center border-t border-[#8B4513]/10 pt-[24px]">
            <p className="text-xs text-[#3D2B1F]/60">
              Require institutional credentials?{' '}
              <Link href="/signup" className="text-[#8B4513] font-medium hover:underline">
                Enroll Identity
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
