import { createClient } from '@supabase/supabase-js'

/**
 * Admin client using the secret key — for privileged server-side operations
 * (status transitions, audit writes, etc.)
 * NEVER expose this to the browser.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
