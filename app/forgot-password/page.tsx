"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Mail, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import { getSiteUrl } from "@/lib/siteConfig";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const siteUrl = getSiteUrl();
      const targetRedirectUrl = `${siteUrl}/reset-password`;
      
      console.log("Password Reset Redirect URL:", targetRedirectUrl);

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: targetRedirectUrl,
      });

      if (resetError) {
        // Automatically provide intelligent Supabase URL configuration guidance if unauthorized
        if (resetError.message?.toLowerCase().includes("authorized") || resetError.message?.toLowerCase().includes("allowed") || resetError.status === 400) {
          setError(`Supabase Auth Notice: Please add '${targetRedirectUrl}' to your allowed Redirect URLs list in Supabase Dashboard -> Authentication -> URL Configuration.`);
        } else {
          setError(resetError.message);
        }
      } else {
        setMessage("Success! Password recovery instruction link dispatched to your mailbox.");
      }
    } catch (err: any) {
      setError(err.message || "Communication link error. Try resubmitting momentarily.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 selection:bg-primary/20 font-sans">
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
      
      <div className="w-full max-w-md font-sans">
        <div className="text-center mb-10 font-sans">
          <Link href="/login" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Login Gate
          </Link>
          <div className="flex items-center justify-center gap-2 mb-4 font-sans">
            <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Logo" width={48} height={48} />
          </div>
          <h2 className="text-3xl font-black text-foreground font-sans">Password Recovery</h2>
          <p className="text-muted-foreground mt-2 font-medium text-sm font-sans">Enter your institutional address to receive secure reset links</p>
        </div>

        <div className="bg-card/50 backdrop-blur-2xl border border-border rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5 font-sans">
          <form onSubmit={handleResetRequest} className="space-y-6 font-sans">
            <div className="space-y-2 font-sans">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block font-sans">Email Address</label>
              <div className="relative font-sans">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 font-sans" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-foreground placeholder:text-muted-foreground text-sm font-sans"
                  placeholder="name@university.edu"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 text-xs font-bold text-destructive bg-destructive/10 border border-destructive/20 rounded-2xl flex items-start gap-3 animate-in fade-in zoom-in-95 font-sans selection:bg-destructive/20 selection:text-destructive-foreground">
                <ShieldCheck size={18} className="shrink-0 mt-0.5 font-sans" />
                <div className="leading-relaxed font-sans">{error}</div>
              </div>
            )}

            {message && (
              <div className="p-4 text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 font-sans">
                <ShieldCheck size={18} className="shrink-0 font-sans" />
                <div className="leading-relaxed font-sans">{message}</div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl font-black text-base shadow-xl shadow-primary/20 font-sans"
              style={{ background: "var(--gradient-primary)" }}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin font-sans" />
              ) : (
                <span className="font-sans">Send Secure Reset Link</span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
