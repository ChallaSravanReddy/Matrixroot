import { isAuthApiError } from "@supabase/supabase-js";

/**
 * Translates Supabase authentication errors into readable, user-friendly messages.
 * Maps standard API error codes and messages to helpful notices for students.
 */
export function getFriendlyAuthErrorMessage(err: unknown): string {
  if (!err) {
    return "An unexpected authentication error occurred.";
  }

  if (isAuthApiError(err)) {
    const status = err.status;
    const message = err.message.toLowerCase();

    // 1. Rate Limiting (Too many requests / email limits)
    if (status === 429 || message.includes("rate limit") || message.includes("too many requests")) {
      return "Too many requests. Please wait a few minutes before trying again.";
    }

    // 2. Bad Request / Client Errors (Invalid credentials, duplicates, redirects)
    if (status === 400) {
      if (
        message.includes("already registered") ||
        message.includes("already exists") ||
        message.includes("email already in use")
      ) {
        return "Gmail already exist";
      }
      if (message.includes("invalid credential") || message.includes("invalid grant")) {
        return "Invalid email address or password. Please verify your credentials and try again.";
      }
      if (message.includes("email not confirmed") || message.includes("confirm your email")) {
        return "Please confirm your email address by clicking the verification link sent to your inbox.";
      }
      if (message.includes("redirect")) {
        return "Invalid redirect URL configuration. Please check your Supabase Dashboard settings.";
      }
    }

    // 3. Validation / Entity Errors (Weak passwords, invalid format)
    if (status === 422 || message.includes("weak password") || message.includes("password should be")) {
      return "The password is too weak. It must be at least 6 characters long.";
    }

    // 4. Unauthorized / Expired Tokens (Refresh token issues, invalid session)
    if (status === 401 || message.includes("refresh token")) {
      return "Your authentication session is invalid or has expired. Please sign in again.";
    }

    // Return the raw API error message if no custom mapping is defined
    return err.message;
  }

  // Handle standard Javascript Error objects
  if (err instanceof Error) {
    return err.message;
  }

  // Fallback for objects with message properties
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as any).message);
  }

  // Fallback for raw string errors
  if (typeof err === "string") {
    return err;
  }

  return "A communication error occurred. Please try again.";
}
