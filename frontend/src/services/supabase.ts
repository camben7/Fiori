import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseReady = Boolean(supabaseUrl && supabaseKey);

// La clave del navegador es pública y está limitada por las políticas RLS.
// La service_role vive exclusivamente en backend/.env.
export const supabase = isSupabaseReady
  ? createClient(supabaseUrl!, supabaseKey!)
  : null;
