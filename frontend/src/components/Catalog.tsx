import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Flower2, LoaderCircle } from 'lucide-react';
import { demoProducts } from '../data/demoProducts';
import { getProducts } from '../services/catalog';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';

const categories = ['Todos', 'Ramos', 'Detalles', 'Temporada', 'Personalizados'];

export function Catalog() {
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    getProducts()
      .then((data) => { if (active) setProducts(data); })
      .catch((error: unknown) => { if (active) setLoadError(error instanceof Error ? error.message : 'Error cargando el catálogo'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(
    () => products.filter((product) => activeCategory === 'Todos' || product.category === activeCategory),
    [activeCategory, products],
  );

  return (
    <section className="section catalog-section" id="catalogo">
      <div className="container">
        <div className="section-heading section-heading--split">
          <div><span className="eyebrow"><Flower2 size={14} /> Hechos para recordar</span><h2>Encuentra ese detalle <em>especial.</em></h2></div>
          <p>Cada arreglo nace de manos artesanas y de la intención de convertir un momento bonito en un recuerdo que acompaña.</p>
        </div>
        <div className="catalog-toolbar">
          <div className="filter-list" role="group" aria-label="Filtrar por categoría">
            {categories.map((category) => (
              <button key={category} className={`filter-chip${activeCategory === category ? ' is-active' : ''}`} onClick={() => setActiveCategory(category)} type="button">{category}</button>
            ))}
          </div>
          <span className="catalog-count">{filtered.length} {filtered.length === 1 ? 'diseño' : 'diseños'}</span>
        </div>
        {loading ? (
          <div className="loading-state"><LoaderCircle className="spin" size={24} /> Preparando flores bonitas…</div>
        ) : loadError ? (
          <div className="empty-state"><p>{loadError}</p><button className="text-link" onClick={() => window.location.reload()}>Intentar de nuevo <ArrowRight size={15} /></button></div>
        ) : filtered.length ? (
          <div className="product-grid">{filtered.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>
        ) : (
          <div className="empty-state"><p>Aún no hay diseños en esta categoría. Pronto florecerán nuevas ideas.</p></div>
        )}
        <p className="catalog-footnote">Cada pieza puede personalizarse. Escríbenos para consultar colores, disponibilidad y valor.</p>
      </div>
    </section>
  );
}
