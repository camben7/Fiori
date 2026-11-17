const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || '573018062359').replace(/\D/g, '');

export function whatsappUrl(message: string): string {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function formatPrice(price: number | null): string {
  if (price === null || !Number.isFinite(price)) return 'Consultar valor';
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
}

export function slugify(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
