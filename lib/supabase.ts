import { createBrowserClient } from "@supabase/ssr";

export const supabaseClient = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const createSupabaseClient = (
  supabaseUrl: string,
  supabaseAnonKey: string,
) => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};
