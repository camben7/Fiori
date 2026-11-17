-- Fiori: esquema inicial para Supabase PostgreSQL.
-- Ejecutar en Supabase SQL Editor antes de configurar el panel de administración.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 3 and 100),
  slug text not null unique,
  description text not null check (char_length(description) between 10 and 500),
  price numeric(12, 2) check (price is null or price >= 0),
  category text not null check (category in ('Ramos', 'Detalles', 'Temporada', 'Personalizados')),
  image_url text not null,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  occasion text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'in_progress', 'closed')),
  created_at timestamptz not null default now()
);

-- Trigger para crear un perfil básico cada vez que se registra una cuenta en Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Helper RLS: el rol se comprueba en el servidor de PostgreSQL, nunca desde el navegador.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.contact_messages enable row level security;

-- Un usuario puede leer su propio perfil; un admin puede consultar todos.
drop policy if exists "Users read own profile or admins read all" on public.profiles;
create policy "Users read own profile or admins read all"
on public.profiles for select to authenticated
using (id = (select auth.uid()) or public.is_admin());

drop policy if exists "Admins update profiles" on public.profiles;
create policy "Admins update profiles"
on public.profiles for update to authenticated
using (public.is_admin()) with check (public.is_admin());

-- Los visitantes solo ven productos activos. Los administradores pueden administrarlos.
drop policy if exists "Public reads active products" on public.products;
create policy "Public reads active products"
on public.products for select to anon, authenticated
using (is_active = true or public.is_admin());

drop policy if exists "Admins insert products" on public.products;
create policy "Admins insert products"
on public.products for insert to authenticated
with check (public.is_admin());

drop policy if exists "Admins update products" on public.products;
create policy "Admins update products"
on public.products for update to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins delete products" on public.products;
create policy "Admins delete products"
on public.products for delete to authenticated
using (public.is_admin());

-- Los mensajes se insertan solo desde el backend con service_role (bypassa RLS).
-- El navegador no recibe permiso de insertar directamente.
drop policy if exists "Admins read contact messages" on public.contact_messages;
create policy "Admins read contact messages"
on public.contact_messages for select to authenticated
using (public.is_admin());

drop policy if exists "Admins update contact messages" on public.contact_messages;
create policy "Admins update contact messages"
on public.contact_messages for update to authenticated
using (public.is_admin()) with check (public.is_admin());

-- Bucket público para mostrar fotos del catálogo. Escritura restringida a administradores.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public reads Fiori product images" on storage.objects;
create policy "Public reads Fiori product images"
on storage.objects for select to anon, authenticated
using (bucket_id = 'product-images');

drop policy if exists "Admins upload Fiori product images" on storage.objects;
create policy "Admins upload Fiori product images"
on storage.objects for insert to authenticated
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins update Fiori product images" on storage.objects;
create policy "Admins update Fiori product images"
on storage.objects for update to authenticated
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins delete Fiori product images" on storage.objects;
create policy "Admins delete Fiori product images"
on storage.objects for delete to authenticated
using (bucket_id = 'product-images' and public.is_admin());

-- IMPORTANTE: después de crear tu usuario administrador en Supabase Auth,
-- sustituye el UUID por el id real de Authentication > Users:
-- update public.profiles set role = 'admin' where id = 'UUID-DEL-USUARIO';
