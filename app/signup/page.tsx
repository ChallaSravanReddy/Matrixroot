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
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 selection:bg-primary/20">
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
      
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Logo" width={48} height={48} />
            <span className="font-black text-2xl tracking-tighter">Matrix Root</span>
          </Link>
          <h2 className="text-3xl font-black text-foreground">Join the Track</h2>
          <p className="text-muted-foreground mt-2 font-medium">Start your industrial internship today</p>
        </div>

        <div className="bg-card/50 backdrop-blur-2xl border border-border rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5">
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    placeholder="name@university.edu"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    placeholder="Min. 6 characters"
                    minLength={6}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <input
                id="terms"
                type="checkbox"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded-sm border-border text-primary focus:ring-primary/20"
              />
              <label htmlFor="terms" className="text-xs text-foreground font-medium leading-relaxed cursor-pointer">
                I agree to the <span className="text-primary font-bold">Matrix Root training terms</span> and the industrial internship code of conduct.
              </label>
            </div>

            {error && (
              <div className={`p-4 text-xs font-bold border rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 ${error.includes('Success') ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-destructive bg-destructive/10 border-destructive/20'}`}>
                <ShieldCheck size={18} />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={!agreedToTerms || loading}
              className="w-full h-14 rounded-2xl font-black text-base shadow-xl shadow-primary/20 mt-2"
              style={{ background: "var(--gradient-primary)" }}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="ml-2 h-5 w-5" /></>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center border-t border-border pt-6">
            <p className="text-sm font-medium text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
