/**
 * Utility to get the site URL, prioritizing the NEXT_PUBLIC_SITE_URL environment variable.
 * This ensures that links (like forgot password and QR codes) point to production
 * even when triggered from local development.
 */
export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  if (envUrl) {
    // Ensure it doesn't have a trailing slash for consistency
    return envUrl.replace(/\/$/, "");
  }

  // Fallback to window.location.origin if available, or a default
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "https://matrixroot.vercel.app";
}
