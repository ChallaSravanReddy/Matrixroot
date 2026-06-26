import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please check your .env.local file.');
}

/**
 * A fetch wrapper that converts network-level failures (TypeError: Failed to fetch)
 * into proper Errors so Supabase auth internals can handle them gracefully
 * instead of crashing with an unhandled rejection in the browser console.
 */
async function resilientFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (err) {
    // "Failed to fetch" means the host is unreachable, offline, or CORS-blocked.
    // Re-throw with a clearer message so upstream callers can react.
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
    throw new Error(`Network request failed (offline or unreachable): ${url}`);
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://your-project.supabase.co',
  supabaseAnonKey || 'your-anon-key',
  {
    global: {
      // Custom fetch wrapper: converts "TypeError: Failed to fetch" (network offline /
      // unreachable host) into a plain Error with a clear message so Supabase internals
      // catch it gracefully instead of surfacing an unhandled rejection.
      fetch: resilientFetch,
    },
    auth: {
      // Only persist the session in the browser — prevents double-init on the server.
      persistSession: typeof window !== 'undefined',
      // Detect session from URL hash (magic links / OAuth) only in the browser.
      detectSessionInUrl: typeof window !== 'undefined',
    },
  }
);
