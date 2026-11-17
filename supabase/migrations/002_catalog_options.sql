-- Fiori · Migración 002: categorías nuevas y opciones de personalización.
--
-- CUÁNDO EJECUTARLA: una sola vez, en Supabase > SQL Editor, DESPUÉS de supabase/schema.sql.
-- Es idempotente: si la ejecutas dos veces no pasa nada.
--
-- Qué hace:
--   1. Amplía las categorías permitidas (Ramos Eternos, Cajas de Lujo, Aniversarios, Cumpleaños).
--   2. Renombra los productos que ya estaban en 'Ramos' a 'Ramos Eternos'.
--   3. Agrega las columnas que usa el modal del catálogo: colores de cinta, tamaños y dedicatoria.

-- 1 y 2. Categorías --------------------------------------------------------------------------
alter table public.products drop constraint if exists products_category_check;

update public.products set category = 'Ramos Eternos' where category = 'Ramos';

alter table public.products
  add constraint products_category_check
  check (category in (
    'Ramos Eternos', 'Cajas de Lujo', 'Aniversarios', 'Cumpleaños',
    'Temporada', 'Personalizados', 'Detalles'
  ));

-- 3. Opciones de personalización ---------------------------------------------------------------
-- Lista de nombres de color, p. ej. {"Lila lavanda","Marfil"}. Vacía = el sitio ofrece colores por defecto.
alter table public.products add column if not exists ribbon_colors text[] not null default '{}';

-- Tamaños con valor adicional sobre el precio base, p. ej. [{"label":"Mediano","price_delta":40000}].
alter table public.products add column if not exists sizes jsonb not null default '[]'::jsonb;

-- Si el cliente puede escribir una dedicatoria para este producto.
alter table public.products add column if not exists allows_dedication boolean not null default true;

-- Los tamaños deben ser una lista (evita guardar texto suelto por error).
alter table public.products drop constraint if exists products_sizes_is_array;
alter table public.products add constraint products_sizes_is_array check (jsonb_typeof(sizes) = 'array');
