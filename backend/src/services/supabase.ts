import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

// Este cliente usa service_role y solo existe en el servidor. Nunca exportarlo al frontend.
export const supabaseAdmin = env.hasSupabase
  ? createClient(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    })
  : null;
