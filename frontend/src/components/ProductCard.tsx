import { Eye, ShoppingBag, Sparkles } from 'lucide-react';
import type { Product } from '../types';
import { formatPrice } from '../utils';

interface Props {
  product: Product;
  /** Posición en la grilla: escalona la animación de entrada. */
  index?: number;
  onOpen: (product: Product) => void;
}

/**
 * Tarjeta del catálogo.
 * Decisión técnica: la tarjeta NO decide cómo se compra. Solo informa y abre el modal de detalle,
 * donde viven las opciones (cinta, tamaño, dedicatoria). Así hay un único lugar donde se arma
 * una línea del carrito y las reglas de precio no se duplican.
 */
export function ProductCard({ product, index = 0, onOpen }: Props) {
  // Si algún tamaño cuesta más, el precio visible es el mínimo: lo decimos con "Desde".
  const hasPriceRange = product.price !== null && (product.sizes ?? []).some((size) => size.price_delta > 0);

  return (
    <article className="product-card" style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}>
      <button type="button" className="product-image-wrap" onClick={() => onOpen(product)} aria-label={`Ver detalles de ${product.name}`}>
        <img src={product.image_url} alt={product.name} loading="lazy" />
        <span className="product-category">{product.category}</span>
        {product.is_featured && <span className="product-badge"><Sparkles size={12} aria-hidden="true" /> Favorito</span>}
        <span className="product-quickview"><Eye size={15} aria-hidden="true" /> Ver detalle</span>
      </button>
      <div className="product-info">
        <div>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
        </div>
        <div className="product-meta">
          <span className="product-price">{hasPriceRange && <small>Desde</small>}{formatPrice(product.price)}</span>
          <button type="button" className="product-add" onClick={() => onOpen(product)} aria-label={`Personalizar y añadir ${product.name}`}>
            <ShoppingBag size={15} aria-hidden="true" /> Personalizar
          </button>
        </div>
      </div>
    </article>
  );
}

/** Esqueleto lila que ocupa el lugar de la tarjeta mientras carga el catálogo (evita saltos de diseño). */
export function ProductCardSkeleton() {
  return (
    <div className="product-card product-card--skeleton" aria-hidden="true">
      <div className="skeleton skeleton--image" />
      <div className="skeleton skeleton--line skeleton--title" />
      <div className="skeleton skeleton--line" />
      <div className="skeleton skeleton--line skeleton--short" />
    </div>
  );
}
