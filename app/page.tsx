"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { ShieldCheck, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { getFriendlyAuthErrorMessage } from "@/lib/authErrors";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        // Accept terms automatically since they clicked it in login
        await supabase.from("profiles").update({ has_accepted_terms: true }).eq("id", data.user.id);
        window.location.href = "/dashboard";
      }
    } catch (err: unknown) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "apple" | "facebook") => {
    setError(null);
    try {
      const { error: oAuthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (oAuthError) throw oAuthError;
    } catch (err: unknown) {
      setError(getFriendlyAuthErrorMessage(err));
    }
  };

  return (
    <AuthLayout>
      <div className="w-full min-h-screen sm:min-h-fit sm:max-w-[430px] bg-white rounded-none sm:rounded-[32px] border-0 sm:border sm:border-neutral-100 shadow-none sm:shadow-[0_15px_50px_-15px_rgba(0,0,0,0.04)] p-6 sm:p-10 flex flex-col justify-center items-stretch relative">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-[32px] font-extrabold tracking-tight text-neutral-900 leading-none mb-2">
            Student Login
          </h2>
          <p className="text-xs text-neutral-500 font-semibold leading-relaxed">
            Hey, Enter your details to get sign in to your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          
          {/* Email Address */}
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-neutral-200 focus:border-neutral-400 focus:outline-none rounded-[14px] px-4 py-3.5 text-sm text-neutral-800 placeholder-neutral-400 font-semibold transition-all"
              placeholder="Enter Email / Phone No"
            />
            {/* Outline Circle Icon on the right */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-neutral-300"></div>
          </div>

          {/* Passcode (Password) */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-neutral-200 focus:border-neutral-400 focus:outline-none rounded-[14px] pl-4 pr-12 py-3.5 text-sm text-neutral-800 placeholder-neutral-400 font-semibold transition-all"
              placeholder="Passcode"
            />
            {/* Show/Hide Toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-700 hover:text-neutral-900 select-none cursor-pointer"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Having trouble in sign in? Link */}
          <div className="text-left mt-0.5">
            <Link
              href="/forgot-password"
              className="text-[12px] font-semibold text-neutral-800 hover:underline"
            >
              Having trouble in sign in?
            </Link>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-3 mt-1 p-3.5 rounded-[14px] bg-neutral-50/80 border border-neutral-100/50">
            <input
              id="terms"
              type="checkbox"
              required
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-[#FDBF84] focus:ring-0 cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-neutral-500 font-semibold leading-relaxed cursor-pointer select-none">
              I agree to the <Link href="/terms" target="_blank" className="font-bold text-neutral-800 hover:underline">Terms and Conditions</Link>.
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 text-xs font-semibold text-neutral-800 bg-[#FDBF84]/15 border border-[#FDBF84]/35 rounded-[14px] flex items-center gap-2">
              <ShieldCheck size={16} className="text-neutral-700 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={!agreedToTerms || loading}
            className="w-full bg-[#FDBF84] hover:bg-[#FCAE68] text-neutral-900 font-extrabold py-3.5 px-6 rounded-[14px] transition-all shadow-[0_4px_14px_rgba(253,191,132,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center text-sm mt-2 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-neutral-800" />
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-neutral-200/60"></div>
          <span className="px-3 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">— Or Sign in with —</span>
          <div className="flex-1 border-t border-neutral-200/60"></div>
        </div>

        {/* Social Logins */}
        <div className="flex gap-3">
          <button
            onClick={() => handleSocialLogin("google")}
            className="flex-1 py-3 px-2 border border-neutral-200 hover:border-neutral-300 rounded-xl bg-white hover:bg-neutral-50 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs font-bold text-neutral-800 shadow-sm"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          
          <button
            onClick={() => handleSocialLogin("apple")}
            className="flex-1 py-3 px-2 border border-neutral-200 hover:border-neutral-300 rounded-xl bg-white hover:bg-neutral-50 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs font-bold text-neutral-800 shadow-sm"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.75.8.01 2.05-.8 3.68-.63 1.7.17 2.97.86 3.64 2.05-3.57 2.12-2.99 6.74.55 8.16-.72 1.83-1.88 3.69-2.95 4.64zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.26 2.5-2.05 4.41-3.74 4.25z"/>
            </svg>
            Apple ID
          </button>
          
          <button
            onClick={() => handleSocialLogin("facebook")}
            className="flex-1 py-3 px-2 border border-neutral-200 hover:border-neutral-300 rounded-xl bg-white hover:bg-neutral-50 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs font-bold text-neutral-800 shadow-sm"
          >
            <svg className="w-4 h-4 shrink-0 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
        </div>

        {/* Footer Link */}
        <p className="text-xs text-neutral-500 font-semibold text-center mt-8 select-none">
          Don't have an account?
          <Link href="/signup" className="text-neutral-800 font-bold hover:underline ml-1">
            Request Now
          </Link>
        </p>

      </div>
    </AuthLayout>
  );
}
