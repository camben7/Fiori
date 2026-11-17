/**
 * Colores de cinta.
 * El administrador escribe nombres libres ("Lila lavanda", "Verde salvia"…) y aquí
 * los convertimos en un color visible para el selector. Decisión técnica: guardar
 * solo el nombre en la base de datos (simple de editar) y deducir el tono por
 * palabras clave, en lugar de pedirle a la persona un código hexadecimal.
 */

/** Opciones que se ofrecen cuando un producto no tiene colores configurados. */
export const DEFAULT_RIBBON_COLORS = ['Lila lavanda', 'Marfil', 'Verde oliva', 'Rosa empolvado'];

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// Orden importa: la primera coincidencia gana ("lila profundo" debe ir antes que "lila").
const KEYWORDS: Array<[string[], string]> = [
  [['profundo', 'morado', 'violeta'], '#8E7A9C'],
  [['lila', 'lavanda', 'lavender'], '#C8B6D1'],
  [['oliva', 'musgo'], '#4A5340'],
  [['verde', 'salvia', 'menta'], '#A9B79B'],
  [['rosa', 'palo', 'rubor', 'fucsia'], '#E6C9CB'],
  [['rojo', 'vino', 'burdeos', 'borgona'], '#9A4A55'],
  [['marfil', 'crema', 'beige', 'champan'], '#EFE6D6'],
  [['blanco', 'perla'], '#FFFFFF'],
  [['dorado', 'oro', 'mostaza'], '#C9A96A'],
  [['azul', 'celeste'], '#9DB4CE'],
  [['negro', 'carbon', 'grafito'], '#2D312E'],
  [['gris', 'plata'], '#B9BBB6'],
  [['naranja', 'terracota', 'durazno', 'coral'], '#E2A98B'],
  [['amarillo'], '#E8D58A'],
];

/** Devuelve un color hexadecimal para mostrar el muestrario; si no lo reconoce, usa un lila neutro. */
export function ribbonSwatch(name: string): string {
  const text = normalize(name);
  const match = KEYWORDS.find(([words]) => words.some((word) => text.includes(word)));
  return match ? match[1] : '#D9CFDD';
}
