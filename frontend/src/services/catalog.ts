import { demoProducts } from '../data/demoProducts';
import type { Product, ProductSize } from '../types';
import { isSupabaseReady, supabase } from './supabase';

const toPriceOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toStringList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim() !== '').map((item) => item.trim()) : [];

function toSizes(value: unknown): ProductSize[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): ProductSize[] => {
    if (typeof item !== 'object' || item === null) return [];
    const { label, price_delta } = item as { label?: unknown; price_delta?: unknown };
    if (typeof label !== 'string' || label.trim() === '') return [];
    const delta = Number(price_delta ?? 0);
    // El extra nunca resta: así "Desde $X" siempre es el precio más bajo.
    return [{ label: label.trim(), price_delta: Number.isFinite(delta) && delta > 0 ? delta : 0 }];
  });
}

/**
 * Convierte una fila cruda de Supabase en un Product confiable.
 * Decisión técnica: PostgREST puede devolver `numeric` como texto y las columnas nuevas
 * pueden no existir si la migración aún no se ejecutó, así que normalizamos en un solo
 * lugar (catálogo público y panel admin comparten esta función).
 */
export function normalizeProduct(row: Record<string, unknown>): Product {
  return {
    ...(row as unknown as Product),
    price: toPriceOrNull(row.price),
    ribbon_colors: toStringList(row.ribbon_colors),
    sizes: toSizes(row.sizes),
    allows_dedication: row.allows_dedication !== false,
  };
}

export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseReady || !supabase) return demoProducts;

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw new Error('No pudimos cargar el catálogo. Intenta de nuevo.');
  return (data ?? []).map((row) => normalizeProduct(row as Record<string, unknown>));
}
