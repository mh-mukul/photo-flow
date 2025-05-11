import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Can use anon key if RLS is set up for users
    // For admin actions needing elevated privileges, you might use service_role here or in a dedicated service_role client
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}


export function createSupabaseServiceRoleClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        // Service role client typically doesn't need to manage cookies for auth itself
        // as it operates with full privileges.
        // Providing stub cookie handlers to satisfy createServerClient requirements.
        get() { return undefined; },
        set() {},
        remove() {},
      },
      auth: {
        // Prevents the service role client from trying to auto-refresh tokens or persist sessions
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      }
    }
  );
}
