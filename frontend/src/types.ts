/**
 * Categorías que el panel de administración permite elegir.
 * Las cuatro primeras son los filtros "fijos" del catálogo público; las demás
 * existen para no romper productos que ya estaban cargados (Temporada, etc.).
 * IMPORTANTE: debe coincidir con el CHECK de la base de datos
 * (ver supabase/migrations/002_catalog_options.sql).
 */
export const PRODUCT_CATEGORIES = [
  'Ramos Eternos',
  'Cajas de Lujo',
  'Aniversarios',
  'Cumpleaños',
  'Temporada',
  'Personalizados',
  'Detalles',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/** Filtros que siempre aparecen en el catálogo, tenga o no productos cargados. */
export const CATALOG_FILTERS: readonly string[] = ['Ramos Eternos', 'Cajas de Lujo', 'Aniversarios', 'Cumpleaños'];

/** Tamaño elegible. `price_delta` es lo que se suma al precio base (nunca resta). */
export interface ProductSize {
  label: string;
  price_delta: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number | null;
  category: ProductCategory | string;
  image_url: string;
  is_featured: boolean;
  is_active: boolean;
  created_at?: string;
  /** Opciones de personalización editables desde el panel. Todas son opcionales. */
  ribbon_colors?: string[];
  sizes?: ProductSize[];
  allows_dedication?: boolean;
}

/**
 * Línea del carrito. Guardamos una "foto" del producto (nombre, imagen, precio
 * unitario) para poder mostrar el carrito aunque el catálogo aún esté cargando
 * o el producto cambie después.
 */
export interface CartItem {
  /** Identifica producto + opciones elegidas: dos ramos iguales con distinta cinta son líneas distintas. */
  key: string;
  productId: string;
  name: string;
  image_url: string;
  category: string;
  /** Precio base + extra del tamaño. `null` significa "por cotizar". */
  unitPrice: number | null;
  quantity: number;
  ribbonColor?: string;
  size?: string;
  dedication?: string;
}

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  occasion: string;
  message: string;
  website?: string;
}

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
}
