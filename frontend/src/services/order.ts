import type { CartItem } from '../types';
import { formatPrice, whatsappUrl } from '../utils';

const instagramUrl = (import.meta.env.VITE_INSTAGRAM_URL || 'https://instagram.com/fioribaq').trim();

/** Totales del carrito. Los productos "por cotizar" (sin precio) no suman al total. */
export function cartTotals(items: CartItem[]) {
  let count = 0;
  let subtotal = 0;
  let unpricedCount = 0;
  for (const item of items) {
    count += item.quantity;
    if (item.unitPrice === null) unpricedCount += item.quantity;
    else subtotal += item.unitPrice * item.quantity;
  }
  return { count, subtotal, unpricedCount };
}

export const lineTotal = (item: CartItem): number | null => (item.unitPrice === null ? null : item.unitPrice * item.quantity);

/** Usuario de Instagram a partir de VITE_INSTAGRAM_URL (acepta "@usuario" o la URL completa). */
export function instagramHandle(): string {
  const parts = instagramUrl.replace(/[?#].*$/, '').split('/').filter(Boolean);
  return (parts[parts.length - 1] || 'fioribaq').replace(/^@/, '');
}

/**
 * Enlace al chat directo de Instagram.
 * Decisión técnica: Instagram NO permite prellenar el texto de un mensaje directo
 * desde un enlace (a diferencia de WhatsApp). Por eso el flujo es: copiar el pedido
 * al portapapeles, abrir el chat y pegarlo. El carrito explica esto con claridad.
 */
export const instagramDmUrl = () => `https://ig.me/m/${instagramHandle()}`;

/** Mensaje estructurado, listo para pegar en el chat. */
export function buildOrderMessage(items: CartItem[]): string {
  const { subtotal, unpricedCount } = cartTotals(items);
  const lines: string[] = ['Hola, Fiori 🌸 Quiero hacer este pedido:', ''];

  items.forEach((item, index) => {
    lines.push(`${index + 1}) ${item.name} × ${item.quantity}`);
    if (item.size) lines.push(`   • Tamaño: ${item.size}`);
    if (item.ribbonColor) lines.push(`   • Cinta: ${item.ribbonColor}`);
    if (item.dedication) lines.push(`   • Dedicatoria: “${item.dedication}”`);
    const total = lineTotal(item);
    lines.push(`   • Valor: ${total === null ? 'por cotizar' : formatPrice(total)}`);
    lines.push('');
  });

  lines.push(
    unpricedCount > 0
      ? `Total estimado: ${formatPrice(subtotal)} (sin contar ${unpricedCount} ${unpricedCount === 1 ? 'producto' : 'productos'} por cotizar)`
      : `Total: ${formatPrice(subtotal)}`,
  );
  lines.push('', '¿Me confirman disponibilidad y tiempo de entrega? ¡Gracias!');
  return lines.join('\n');
}

export const whatsappOrderUrl = (items: CartItem[]) => whatsappUrl(buildOrderMessage(items));

/** Copia texto al portapapeles. Devuelve false si el navegador lo impide (para mostrar el texto a mano). */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Seguimos con el método alternativo.
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}
