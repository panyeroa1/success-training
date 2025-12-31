import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Perform anonymous authentication
 */
export async function signInAnonymously() {
  try {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error("Supabase anonymous auth error:", error);
      return { success: false, error: error.message };
    }
    return { success: true, user: data.user };
  } catch (e) {
    console.error("Unexpected auth error:", e);
    return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}
