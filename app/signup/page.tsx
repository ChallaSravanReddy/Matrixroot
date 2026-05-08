"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

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
      // 1. Sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        console.error("Signup Error:", signUpError);
        throw signUpError;
      }

      if (data.user) {
        // 2. Create the profile record
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({ 
            id: data.user.id, 
            has_accepted_terms: true,
            full_name: fullName, 
            role: 'student'
          });

        if (profileError) {
          console.error("Profile sync error:", profileError);
          // If it's a critical error (like RLS), we might want to know
          if (profileError.code === '42P17') {
             throw new Error("Database configuration error (RLS Recursion). Please contact admin.");
          }
        }
        
        // 3. Redirect to onboarding
        window.location.href = "/onboarding";
      } else {
        setError("Signup successful! Please check your email to verify your account.");
      }
    } catch (err: any) {
      console.error("Caught error in handleSignup:", err);
      setError(err.message || "An error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 text-slate-900 font-sans">
      <div className="w-full max-w-md p-8 space-y-8 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200">
        <div className="flex justify-center mb-4">
          <Image src="/img/Matrixroot_onlyimglogo-removebg-preview.png" alt="Matrix Root Logo" width={60} height={60} className="object-contain drop-shadow-md" priority />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Create an Account
          </h2>
          <p className="text-sm text-slate-600">Begin your journey.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                className="w-full px-4 py-2.5 text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400"
                placeholder="At least 6 characters"
              />
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center h-5 mt-0.5">
              <input
                id="terms"
                type="checkbox"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 text-blue-500 bg-white border-slate-300 rounded focus:ring-blue-500 focus:ring-offset-slate-950"
              />
            </div>
            <label htmlFor="terms" className="text-sm text-slate-700 cursor-pointer">
              I agree to the <span className="text-blue-600 hover:text-blue-700 transition-colors">Matrix Root training terms and conditions</span>
            </label>
          </div>

          {error && (
            <div className={`p-3 text-sm rounded-lg flex items-center gap-2 ${error.includes('successful') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!agreedToTerms || loading}
            className={`w-full px-4 py-3 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
              !agreedToTerms || loading 
                ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-lg shadow-blue-500/20"
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </>
            ) : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
            Log in
          </a>
        </div>
      </div>
    </div>
  );
}
