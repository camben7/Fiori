import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

export async function signInAdmin(email: string, password: string): Promise<Session> {
  if (!supabase) throw new Error('Supabase todavía no está configurado.');
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error || !data.session) throw new Error('No pudimos iniciar sesión. Verifica tus datos.');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.session.user.id)
    .maybeSingle();

  if (profileError || profile?.role !== 'admin') {
    await supabase.auth.signOut();
    throw new Error('Esta cuenta no tiene permisos de administrador de Fiori.');
  }
  return data.session;
}

export async function hasAdminRole(userId: string): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
  return !error && data?.role === 'admin';
}

export async function signOutAdmin(): Promise<void> {
  await supabase?.auth.signOut();
}
