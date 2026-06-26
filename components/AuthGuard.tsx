"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getFriendlyAuthErrorMessage } from "@/lib/authErrors";

/**
 * Checks localStorage for a Supabase session key and removes it if the
 * refresh token is clearly expired/missing, BEFORE Supabase's internal
 * _initialize runs and tries to hit the network to refresh a dead token.
 */
function clearStaleLocalSession() {
  if (typeof window === "undefined") return;
  try {
    // Supabase stores the session under a key matching this pattern.
    const key = Object.keys(localStorage).find(
      (k) => k.startsWith("sb-") && k.endsWith("-auth-token")
    );
    if (!key) return;

    const raw = localStorage.getItem(key);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    const expiresAt: number | undefined = parsed?.expires_at;

    // If token has expired (with a 60s grace window), wipe it so Supabase
    // won't attempt a doomed refresh call on startup.
    if (expiresAt && Date.now() / 1000 > expiresAt - 60) {
      localStorage.removeItem(key);
      console.info("[AuthGuard] Removed expired local session before init.");
    }
  } catch {
    // Ignore JSON parse errors or storage access issues.
  }
}

export function AuthGuard() {
  useEffect(() => {
    // Step 1 — Proactively clear any obviously stale session from storage
    // so Supabase's internal token refresh never fires for dead tokens.
    clearStaleLocalSession();

    // Step 2 — Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        // Clear leftover storage entries when the user is signed out.
        console.info("[AuthGuard] User signed out — session cleared.");
      }
      if (event === "TOKEN_REFRESHED" && !session) {
        // Refresh completed but produced no session — sign out cleanly.
        console.warn("[AuthGuard] Token refresh returned no session. Signing out.");
        supabase.auth.signOut().catch(() => {/* best-effort */});
      }
    });

    // Step 3 — Validate the current session; clean up if it's broken
    supabase.auth
      .getSession()
      .then(({ error }) => {
        if (error) {
          const friendlyMsg = getFriendlyAuthErrorMessage(error);
          console.warn("[AuthGuard] Session check error:", friendlyMsg);

          const msg = error.message?.toLowerCase() ?? "";
          const isStale =
            msg.includes("refresh token not found") ||
            msg.includes("invalid refresh token") ||
            msg.includes("network request failed") ||
            error.status === 400 ||
            error.status === 401;

          if (isStale) {
            console.warn("[AuthGuard] Stale/invalid session — signing out.");
            supabase.auth.signOut().catch(() => {/* best-effort */});
          }
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        // Suppress expected network errors (offline / Supabase unreachable)
        // so the console doesn't fill up with red errors for guest users.
        if (msg.toLowerCase().includes("network request failed") ||
            msg.toLowerCase().includes("failed to fetch")) {
          console.warn("[AuthGuard] Supabase unreachable during session check (network offline?).");
        } else {
          console.error("[AuthGuard] Unexpected session error:", getFriendlyAuthErrorMessage(err));
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
