import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function cleanSupabaseUrl(url?: string): string {
  if (!url) return "";
  let cleaned = url.trim().replace(/\/+$/, "");
  // Remove /rest/v1 or /auth/v1 if user accidentally copied the full REST endpoint
  cleaned = cleaned.replace(/\/(rest|auth)\/v1\/?$/, "");
  return cleaned.replace(/\/+$/, "");
}

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseUrl = cleanSupabaseUrl(rawSupabaseUrl);
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      supabaseUrl.startsWith("http") &&
      !supabaseUrl.includes("your-project") &&
      !supabaseAnonKey.includes("your-anon-key"),
  );
}

let clientInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!clientInstance && supabaseUrl && supabaseAnonKey) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return clientInstance;
}

export const supabase = isSupabaseConfigured() && supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
