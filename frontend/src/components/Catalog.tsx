import { useMemo, useState } from 'react';
import { ArrowRight, Flower2 } from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import { CATALOG_FILTERS } from '../types';
import { ProductCard, ProductCardSkeleton } from './ProductCard';

/** Cuántos esqueletos mostrar mientras carga (una fila completa en escritorio). */
const SKELETON_COUNT = 4;

export function Catalog() {
  const { products, status, error, reload, openProduct } = useProducts();
  const [activeCategory, setActiveCategory] = useState('Todos');

  // Filtros: los cuatro fijos siempre aparecen; las categorías extra (Temporada, etc.)
  // aparecen solo si existen productos en ellas, para no esconder nada del catálogo.
  const filters = useMemo(() => {
    const extras = Array.from(new Set(products.map((product) => String(product.category))))
      .filter((category) => !CATALOG_FILTERS.includes(category))
      .sort((a, b) => a.localeCompare(b, 'es'));
    return ['Todos', ...CATALOG_FILTERS, ...extras];
  }, [products]);

  const filtered = useMemo(
    () => products.filter((product) => activeCategory === 'Todos' || product.category === activeCategory),
    [activeCategory, products],
  );

  return (
    <section className="section catalog-section" id="catalogo">
      <div className="container">
        <div className="section-heading section-heading--split">
          <div><span className="eyebrow"><Flower2 size={14} aria-hidden="true" /> Hechos para recordar</span><h2>Encuentra ese detalle <em>especial.</em></h2></div>
          <p>Cada arreglo nace de manos artesanas y de la intención de convertir un momento bonito en un recuerdo que acompaña.</p>
        </div>

        <div className="catalog-toolbar">
          <div className="filter-list" role="group" aria-label="Filtrar por categoría u ocasión">
            {filters.map((category) => (
              <button key={category} type="button" className={`filter-chip${activeCategory === category ? ' is-active' : ''}`} aria-pressed={activeCategory === category} onClick={() => setActiveCategory(category)}>{category}</button>
            ))}
          </div>
          {status === 'ready' && <span className="catalog-count" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'diseño' : 'diseños'}</span>}
        </div>

        {status === 'loading' ? (
          <div className="product-grid" aria-busy="true" aria-label="Cargando catálogo">
            {Array.from({ length: SKELETON_COUNT }, (_, index) => <ProductCardSkeleton key={index} />)}
          </div>
        ) : status === 'error' ? (
          <div className="empty-state" role="alert">
            <p>{error || 'No pudimos cargar el catálogo en este momento.'}</p>
            <button type="button" className="text-link" onClick={reload}>Intentar de nuevo <ArrowRight size={15} aria-hidden="true" /></button>
          </div>
        ) : filtered.length ? (
          // `key` cambia con el filtro: React remonta la grilla y las tarjetas vuelven a animarse al filtrar.
          <div className="product-grid" key={activeCategory}>
            {filtered.map((product, index) => <ProductCard key={product.id} product={product} index={index} onOpen={openProduct} />)}
          </div>
        ) : (
          <div className="empty-state">
            <p>Aún no hay diseños en “{activeCategory}”. Pronto florecerán nuevas ideas.</p>
            <button type="button" className="text-link" onClick={() => setActiveCategory('Todos')}>Ver todo el catálogo <ArrowRight size={15} aria-hidden="true" /></button>
          </div>
        )}
        <p className="catalog-footnote">Cada pieza puede personalizarse. Elige tus opciones, arma tu pedido y envíanoslo por Instagram.</p>
      </div>
    </section>
  );
}
