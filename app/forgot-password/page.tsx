"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

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

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setMessage("Check your email for the password reset link!");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 text-slate-900 font-sans">
      <div className="w-full max-w-md p-8 space-y-8 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
            Reset Password
          </h2>
          <p className="text-sm text-slate-600">Enter your email and we'll send you a link.</p>
        </div>

        <form onSubmit={handleResetRequest} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400"
              placeholder="you@example.com"
            />
          </div>

          {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
          {message && <div className="p-3 text-sm text-sky-700 bg-sky-50 border border-sky-200 rounded-lg">{message}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="text-center">
          <a href="/login" className="text-sm text-slate-400 hover:text-blue-600 transition-colors">← Back to login</a>
        </div>
      </div>
    </div>
  );
}
