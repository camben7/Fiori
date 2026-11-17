import { demoProducts } from '../data/demoProducts';
import type { Product } from '../types';
import { isSupabaseReady, supabase } from './supabase';

export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseReady || !supabase) return demoProducts;

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw new Error('No pudimos cargar el catálogo. Intenta de nuevo.');
  return (data ?? []) as Product[];
}
