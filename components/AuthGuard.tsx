"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getFriendlyAuthErrorMessage } from "@/lib/authErrors";

export function AuthGuard() {
  useEffect(() => {
    // Listen for auth changes to catch refresh errors
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
        // Clear any potentially stale local storage if session is invalid
        console.log("Auth session cleared or invalid. Redirecting to clean state.");
        // We don't force redirect here to avoid interrupting guest users
      }
    });

    // Initial check to clear broken sessions
    supabase.auth.getSession()
      .then(({ error }) => {
        if (error) {
          const friendlyMsg = getFriendlyAuthErrorMessage(error);
          console.warn("Session check returned error:", friendlyMsg);
          if (error.message?.includes("Refresh Token Not Found") || error.status === 400 || error.status === 401) {
            console.warn("Stale session detected. Cleaning up...");
            supabase.auth.signOut().catch((e) => {
              console.error("SignOut cleanup failed:", getFriendlyAuthErrorMessage(e));
            });
          }
        }
      })
      .catch((err) => {
        console.error("Unhandled exception in session fetch:", getFriendlyAuthErrorMessage(err));
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
