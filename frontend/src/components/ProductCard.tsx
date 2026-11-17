import { ArrowUpRight, Heart } from 'lucide-react';
import type { Product } from '../types';
import { formatPrice, whatsappUrl } from '../utils';

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const message = `Hola, Fiori. Me interesa ${product.name}. ¿Me comparten disponibilidad y detalles?`;
  return (
    <article className="product-card" style={{ animationDelay: `${index * 80}ms` }}>
      <a className="product-image-wrap" href={whatsappUrl(message)} target="_blank" rel="noreferrer" aria-label={`Consultar por ${product.name}`}>
        <img src={product.image_url} alt={product.name} loading="lazy" />
        <span className="product-category">{product.category}</span>
        <span className="product-heart"><Heart size={16} /></span>
      </a>
      <div className="product-info">
        <div><h3>{product.name}</h3><p>{product.description}</p></div>
        <div className="product-meta"><span>{formatPrice(product.price)}</span><a href={whatsappUrl(message)} target="_blank" rel="noreferrer" aria-label={`Consultar ${product.name}`}><ArrowUpRight size={18} /></a></div>
      </div>
    </article>
  );
}
