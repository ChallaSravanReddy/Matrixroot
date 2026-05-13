"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Lock, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Automatically intercept and handshake PKCE auth session keys from query string parameter mapping
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const codeParam = searchParams.get("code");
      
      if (codeParam) {
        supabase.auth.exchangeCodeForSession(codeParam).then(({ error: exchangeErr }) => {
          if (exchangeErr) {
            console.error("PKCE Code Verification link handshake failed:", exchangeErr);
            setError("Password recovery link validation link expired or corrupted. Please generate a fresh recovery link.");
          }
        });
      }

      const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
          console.log("Password state sync verified");
        }
      });

      return () => {
        authListener?.subscription.unsubscribe();
      };
    }
  }, []);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        if (updateError.message?.toLowerCase().includes("logged in") || updateError.status === 401) {
          setError("Your password token handshake expired. Please ensure you open the reset link in the primary default browser application.");
        } else {
          setError(updateError.message);
        }
      } else {
        setMessage("Password re-secured successfully! Launching login module verification gate...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Credential configuration validation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 selection:bg-primary/20 font-sans">
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
      
      <div className="w-full max-w-md font-sans">
        <div className="text-center mb-10 font-sans">
          <Link href="/login" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground mb-6 transition-colors font-sans">
            <ArrowLeft className="w-4 h-4 font-sans" /> Back to Login Gate
          </Link>
          <div className="flex items-center justify-center gap-2 mb-4 font-sans">
            <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Logo" width={48} height={48} />
          </div>
          <h2 className="text-3xl font-black text-foreground font-sans">New Security Passcode</h2>
          <p className="text-muted-foreground mt-2 font-medium text-sm font-sans">Input your fresh strong passcode credential string</p>
        </div>

        <div className="bg-card/50 backdrop-blur-2xl border border-border rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5 font-sans">
          <form onSubmit={handlePasswordUpdate} className="space-y-6 font-sans">
            <div className="space-y-2 font-sans">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block font-sans">New Passcode</label>
              <div className="relative font-sans">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 font-sans" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-foreground placeholder:text-muted-foreground text-sm font-sans"
                  placeholder="Minimum 6 security characters"
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
              disabled={loading || password.length < 6}
              className="w-full h-14 rounded-2xl font-black text-base shadow-xl shadow-primary/20 font-sans"
              style={{ background: "var(--gradient-primary)" }}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin font-sans" />
              ) : (
                <span className="font-sans">Secure Authorization Password</span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
