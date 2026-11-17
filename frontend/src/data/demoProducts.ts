import type { Product } from '../types';

// Referencias visuales provisionales: sustituir por fotografías propias de Fiori
// desde el panel de administración.
//
// Decisión técnica sobre los precios: en PRODUCCIÓN los productos de muestra salen
// sin precio ("Consultar valor") para no mostrar valores comerciales sin confirmar.
// En desarrollo (npm run dev) se muestran precios de ejemplo para poder probar el
// carrito y los totales sin tener Supabase configurado.
const demoPrice = (value: number): number | null => (import.meta.env.DEV ? value : null);

export const demoProducts: Product[] = [
  {
    id: 'demo-1',
    name: 'Ramo Aurora',
    slug: 'ramo-aurora',
    description: 'Una composición delicada de flores eternas para decir mucho sin palabras.',
    price: demoPrice(95000),
    category: 'Ramos Eternos',
    image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1100&q=85',
    is_featured: true,
    is_active: true,
    sizes: [
      { label: 'Pequeño', price_delta: 0 },
      { label: 'Mediano', price_delta: 40000 },
      { label: 'Grande', price_delta: 85000 },
    ],
  },
  {
    id: 'demo-2',
    name: 'Jardín de Abril',
    slug: 'jardin-de-abril',
    description: 'Una caja con tonos suaves y detalles hechos a mano para un regalo lleno de intención.',
    price: demoPrice(140000),
    category: 'Cajas de Lujo',
    image_url: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=1100&q=85',
    is_featured: true,
    is_active: true,
  },
  {
    id: 'demo-3',
    name: 'Siempre Tú',
    slug: 'siempre-tu',
    description: 'Un arreglo pensado para celebrar el amor que se queda, año tras año.',
    price: demoPrice(120000),
    category: 'Aniversarios',
    image_url: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=1100&q=85',
    is_featured: true,
    is_active: true,
    ribbon_colors: ['Lila lavanda', 'Marfil', 'Rosa empolvado'],
  },
  {
    id: 'demo-4',
    name: 'Día de Fiesta',
    slug: 'dia-de-fiesta',
    description: 'Colores alegres para un cumpleaños que merece recordarse mucho después.',
    price: demoPrice(80000),
    category: 'Cumpleaños',
    image_url: 'https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&w=1100&q=85',
    is_featured: false,
    is_active: true,
  },
  {
    id: 'demo-5',
    name: 'Edición Especial',
    slug: 'edicion-especial',
    description: 'Un arreglo de temporada para celebrar fechas que merecen quedarse para siempre.',
    price: demoPrice(110000),
    category: 'Temporada',
    image_url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1100&q=85',
    is_featured: false,
    is_active: true,
  },
  {
    id: 'demo-6',
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
