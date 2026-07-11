"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { getFriendlyAuthErrorMessage } from "@/lib/authErrors";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Check if phone number already exists in profiles
      const { data: existingPhoneData, error: phoneCheckError } = await supabase
        .from("profiles")
        .select("phone")
        .eq("phone", phone);

      if (phoneCheckError) throw phoneCheckError;

      if (existingPhoneData && existingPhoneData.length > 0) {
        setError("Phone number already exists");
        setLoading(false);
        return;
      }

      // 2. Attempt signup
      const signUpResult = await supabase.auth.signUp({
        email,
        password,
      });

      const data = signUpResult.data;
      const signUpError = signUpResult.error;

      if (signUpError) {
        throw signUpError;
      }

      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError("Email already exists");
        setLoading(false);
        return;
      }

      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          has_accepted_terms: true,
          full_name: fullName,
          phone: phone,
          role: "student"
        });
        window.location.href = "/dashboard";
      } else {
        setError("Success! Check your email for a verification link.");
      }
    } catch (err: unknown) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full min-h-screen sm:min-h-fit sm:max-w-[430px] bg-white rounded-none sm:rounded-[32px] border-0 sm:border sm:border-neutral-100 shadow-none sm:shadow-[0_15px_50px_-15px_rgba(0,0,0,0.04)] p-6 sm:p-10 flex flex-col justify-center items-stretch relative">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-2 mb-6 select-none">
            <Image
              src="/img/Matrixroot_onlyimglogo-removebg-preview.png"
              alt="Matrix Root Logo"
              width={42}
              height={42}
              className="object-contain animate-fade-in"
              priority
            />
            <span className="font-extrabold text-xl tracking-tight text-neutral-900">
              Matrix Root
            </span>
          </div>

          <h2 className="text-[32px] font-extrabold tracking-tight text-neutral-900 leading-none mb-2">
            Student Sign Up
          </h2>
          <p className="text-xs text-neutral-500 font-semibold leading-relaxed">
            Hey, Enter your details to get started with your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          
          {/* Full Name */}
          <div className="relative">
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-white border border-neutral-200 focus:border-neutral-400 focus:outline-none rounded-[14px] px-4 py-3.5 text-sm text-neutral-800 placeholder-neutral-400 font-semibold transition-all"
              placeholder="Full Name"
            />
          </div>

          {/* Email Address */}
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-neutral-200 focus:border-neutral-400 focus:outline-none rounded-[14px] px-4 py-3.5 text-sm text-neutral-800 placeholder-neutral-400 font-semibold transition-all"
              placeholder="Email Address"
            />
          </div>

          {/* Password (Passcode) */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-neutral-200 focus:border-neutral-400 focus:outline-none rounded-[14px] pl-4 pr-12 py-3.5 text-sm text-neutral-800 placeholder-neutral-400 font-semibold transition-all"
              placeholder="Password (Min 6 chars)"
              minLength={6}
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

          {/* Phone Number */}
          <div className="relative flex items-center">
            {/* Prefix indicator styled nicely inside input */}
            <div className="absolute left-4 text-xs font-bold text-neutral-700 select-none">
              +91
            </div>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white border border-neutral-200 focus:border-neutral-400 focus:outline-none rounded-[14px] pl-12 pr-4 py-3.5 text-sm text-neutral-800 placeholder-neutral-400 font-semibold transition-all"
              placeholder="Phone Number (10 digits)"
              pattern="[0-9]{10}"
            />
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

          {/* Error / Success Message */}
          {error && (
            <div className={`p-3 text-xs font-semibold rounded-[14px] flex items-center gap-2 ${error.includes('Success') ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-neutral-800 bg-[#FDBF84]/15 border border-[#FDBF84]/35'}`}>
              <ShieldCheck size={16} className={`shrink-0 ${error.includes('Success') ? 'text-emerald-600' : 'text-neutral-700'}`} />
              <span>{error}</span>
            </div>
          )}

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={!agreedToTerms || loading}
            className="w-full bg-[#FDBF84] hover:bg-[#FCAE68] text-neutral-900 font-extrabold py-3.5 px-6 rounded-[14px] transition-all shadow-[0_4px_14px_rgba(253,191,132,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center text-sm mt-2 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-neutral-800" />
            ) : (
              "Sign up"
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-xs text-neutral-500 font-semibold text-center mt-8 select-none">
          Already have an account?
          <Link href="/" className="text-neutral-800 font-bold hover:underline ml-1">
            Log In
          </Link>
        </p>

      </div>
    </AuthLayout>
  );
}
