import { useEffect, useState } from 'react';
import type { ReactNode, FormEvent } from 'react';
import { ArrowLeft, LoaderCircle, LogOut, ShieldCheck } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { BrandMark } from '../components/BrandMark';
import { isSupabaseReady, supabase } from '../services/supabase';
import { hasAdminRole, signInAdmin, signOutAdmin } from '../services/adminAuth';
import { AdminDashboard } from './AdminDashboard';

type AccessState = 'checking' | 'allowed' | 'denied';

/** Login y control de acceso; la gestión de productos vive en AdminDashboard. */
export function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [access, setAccess] = useState<AccessState>('checking');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => { if (active) setSession(data.session); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    let active = true;
    async function verifyAdmin() {
      if (!session || !supabase) { if (active) setAccess('denied'); return; }
      setAccess('checking');
      const allowed = await hasAdminRole(session.user.id);
      if (active) setAccess(allowed ? 'allowed' : 'denied');
    }
    void verifyAdmin();
    return () => { active = false; };
  }, [session]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setLoginError('');
    try {
      await signInAdmin(email, password);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'No pudimos iniciar sesión.');
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await signOutAdmin();
    setSession(null);
    setAccess('denied');
  }

  if (!isSupabaseReady || !supabase) {
    return <AdminShell><div className="admin-card"><span className="eyebrow"><ShieldCheck size={14} /> Área privada</span><h1>Administración</h1><p>Configura <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code> en <code>frontend/.env.local</code> y ejecuta el esquema SQL.</p><div className="admin-note">Nunca añadas la clave service_role al frontend.</div></div></AdminShell>;
  }

  return <AdminShell>
    {!session ? (
      <div className="admin-card">
        <span className="eyebrow"><ShieldCheck size={14} /> Acceso privado</span>
        <h1>Hola de nuevo.</h1>
        <p>Inicia sesión para gestionar los arreglos, fotografías y precios de Fiori.</p>
        {loginError && <div className="admin-error" role="alert">{loginError}</div>}
        <form className="admin-form" onSubmit={login}>
          <label>Correo electrónico<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu correo de administrador" /></label>
          <label>Contraseña<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Tu contraseña" /></label>
          <button className="button button--dark button--full" type="submit" disabled={busy}>{busy ? <LoaderCircle className="spin" size={16} /> : <ShieldCheck size={16} />} Entrar al panel</button>
        </form>
        <p className="privacy-note">El acceso se gestiona con Supabase Auth. No hay contraseñas predeterminadas.</p>
      </div>
    ) : access === 'checking' ? (
      <div className="admin-card"><LoaderCircle className="spin" /><p>Verificando permisos de administrador…</p></div>
    ) : access === 'denied' ? (
      <div className="admin-card"><span className="eyebrow"><ShieldCheck size={14} /> Acceso restringido</span><h1>Este espacio es privado.</h1><p>Tu cuenta no tiene el rol de administrador de Fiori. Asigna <code>role = 'admin'</code> en la tabla <code>profiles</code> y vuelve a entrar.</p><button className="button button--dark button--full" onClick={logout} type="button"><LogOut size={15} /> Cerrar sesión</button></div>
    ) : <AdminDashboard session={session} onLogout={logout} />}
  </AdminShell>;
}

function AdminShell({ children }: { children: ReactNode }) {
  return <div className="admin-shell"><div className="admin-wrap"><div className="admin-top"><BrandMark href={import.meta.env.BASE_URL} /><a className="admin-back" href={import.meta.env.BASE_URL}><ArrowLeft size={14} /> Volver a la tienda</a></div>{children}</div></div>;
}
