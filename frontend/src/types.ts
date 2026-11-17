export type ProductCategory = 'Ramos' | 'Detalles' | 'Temporada' | 'Personalizados';

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
