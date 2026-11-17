import type { Product } from '../types';

// Referencias visuales provisionales: sustituir por fotografías propias de Fiori.
// Los valores nulos evitan mostrar precios comerciales que aún no han sido confirmados.
export const demoProducts: Product[] = [
  {
    id: 'demo-1',
    name: 'Ramo Aurora',
    slug: 'ramo-aurora',
    description: 'Una composición delicada de rosas eternas para decir mucho sin palabras.',
    price: null,
    category: 'Ramos',
    image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1100&q=85',
    is_featured: true,
    is_active: true,
  },
  {
    id: 'demo-2',
    name: 'Jardín de Abril',
    slug: 'jardin-de-abril',
    description: 'Tonos suaves y detalles hechos a mano para un regalo lleno de intención.',
    price: null,
    category: 'Detalles',
    image_url: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=1100&q=85',
    is_featured: true,
    is_active: true,
  },
  {
    id: 'demo-3',
    name: 'Edición Especial',
    slug: 'edicion-especial',
    description: 'Un arreglo pensado para celebrar fechas que merecen quedarse para siempre.',
    price: null,
    category: 'Temporada',
    image_url: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=1100&q=85',
    is_featured: true,
    is_active: true,
  },
  {
    id: 'demo-4',
    name: 'A tu manera',
    slug: 'a-tu-manera',
    description: 'Diseñamos contigo una combinación especial de colores, flores y emociones.',
    price: null,
    category: 'Personalizados',
    image_url: 'https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&w=1100&q=85',
    is_featured: false,
    is_active: true,
  },
];
