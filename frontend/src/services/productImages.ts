import { supabase } from './supabase';
import { slugify } from '../utils';

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

/**
 * Valida una fotografía ANTES de subirla. Se usa en el panel para avisar al instante
 * (al elegir el archivo) en lugar de esperar a que falle el guardado.
 */
export function validateProductImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) return 'Usa una imagen JPG, PNG o WEBP.';
  if (file.size > MAX_IMAGE_SIZE) return 'La imagen debe pesar menos de 8 MB.';
  return null;
}

/** Sube una fotografía al bucket público y devuelve su URL de lectura. */
export async function uploadProductImage(file: File, productName: string): Promise<string> {
  if (!supabase) throw new Error('Supabase todavía no está configurado.');
  const problem = validateProductImage(file);
  if (problem) throw new Error(problem);

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${Date.now()}-${slugify(productName)}.${extension}`;
  const { error } = await supabase.storage.from('product-images').upload(path, file, {
    upsert: true,
    contentType: file.type,
    cacheControl: '3600',
  });

  if (error) throw new Error('No pudimos subir la imagen. Verifica el bucket y sus permisos.');
  return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
}
