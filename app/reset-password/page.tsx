"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage("Password updated successfully! You can now log in.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 text-slate-900 font-sans">
      <div className="w-full max-w-md p-8 space-y-8 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
            New Password
          </h2>
          <p className="text-sm text-slate-600">Enter your new secure password.</p>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400"
              placeholder="At least 6 characters"
            />
          </div>

          {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
          {message && <div className="p-3 text-sm text-sky-700 bg-sky-50 border border-sky-200 rounded-lg">{message}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
