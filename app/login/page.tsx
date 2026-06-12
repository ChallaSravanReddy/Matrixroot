"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFriendlyAuthErrorMessage } from "@/lib/authErrors";

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

        window.location.href = "/dashboard";
      }
    } catch (err: unknown) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-[32px] md:p-[64px] text-black font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-[40px]">
          <Link href="/" className="inline-flex items-center gap-2 mb-[24px]">
            <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Logo" width={40} height={40} className="object-contain" />
            <span className="font-medium text-xl tracking-tight text-black">Matrix Root</span>
          </Link>
          <h2 className="text-2xl md:text-3xl font-normal tracking-[-0.02em] text-black">Student Login</h2>
          <p className="text-sm text-black/80 mt-1">Sign in to your student account</p>
        </div>

        <div className="bg-white border border-black/10 rounded-[12px] p-[32px] shadow-none">
          <form onSubmit={handleLogin} className="space-y-[24px]">
            <div className="space-y-[16px]">
              <div className="space-y-1">
                <label className="text-xs font-medium text-black/60">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B5A2B] h-4 w-4" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-black/10 rounded-[12px] focus:outline-none focus:border-black transition-all text-sm text-black"
                    placeholder="name@institution.edu"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-black/60">Password</label>
                  <Link href="/forgot-password" className="text-[10px] font-medium text-[#8B5A2B] uppercase tracking-wider hover:underline">Forgot Password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B5A2B] h-4 w-4" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-black/10 rounded-[12px] focus:outline-none focus:border-black transition-all text-sm text-black"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-[12px] bg-[#8B5A2B]/10 border border-[#8B5A2B]/20">
              <input
                id="terms"
                type="checkbox"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded-[4px] border-black/20 text-[#8B5A2B] focus:ring-0"
              />
              <label htmlFor="terms" className="text-xs text-black/80 font-normal leading-relaxed cursor-pointer">
                I agree to the <span className="font-medium text-[#8B5A2B]">Terms and Conditions</span>.
              </label>
            </div>

            {error && (
              <div className="p-3 text-xs font-medium text-[#8B5A2B] bg-[#8B5A2B]/10 border border-[#8B5A2B]/20 rounded-[12px] flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#8B5A2B]" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={!agreedToTerms || loading}
              className="w-full h-11 rounded-[12px] bg-black text-white hover:bg-neutral-900 shadow-none font-medium mt-2 border-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#8B5A2B]" />
              ) : (
                <>Log In <ArrowRight className="ml-2 h-4 w-4 text-[#8B5A2B]" /></>
              )}
            </Button>
          </form>

          <div className="mt-[32px] text-center border-t border-black/10 pt-[24px]">
            <p className="text-xs text-black/60">
              {"Don't have an account?"}{' '}
              <Link href="/signup" className="text-[#8B5A2B] font-medium hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
