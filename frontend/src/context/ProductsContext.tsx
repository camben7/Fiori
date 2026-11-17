import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { getProducts } from '../services/catalog';
import type { Product } from '../types';

type Status = 'loading' | 'ready' | 'error';

interface ProductsContextValue {
  products: Product[];
  status: Status;
  error: string;
  reload: () => void;
  /** Producto abierto en el modal de detalle (null = cerrado). */
  selected: Product | null;
  openProduct: (product: Product) => void;
  closeProduct: () => void;
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

/**
 * Carga el catálogo UNA sola vez y lo comparte.
 * Decisión técnica: antes el catálogo y el asistente tenían cada uno su copia (el asistente
 * usaba datos de muestra). Con un contexto compartido, el asistente conoce exactamente los
 * mismos productos y precios que ve el cliente, y cualquier parte de la página (catálogo o
 * asistente) puede abrir el mismo modal de detalle.
 */
export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true; // evita actualizar estado si el componente se desmontó
    setStatus('loading');
    getProducts()
      .then((data) => { if (active) { setProducts(data); setStatus('ready'); } })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : 'No pudimos cargar el catálogo.');
        setStatus('error');
      });
    return () => { active = false; };
  }, [attempt]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);
  const openProduct = useCallback((product: Product) => setSelected(product), []);
  const closeProduct = useCallback(() => setSelected(null), []);

  const value = useMemo(
    () => ({ products, status, error, reload, selected, openProduct, closeProduct }),
    [products, status, error, reload, selected, openProduct, closeProduct],
  );
  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts(): ProductsContextValue {
  const context = useContext(ProductsContext);
  if (!context) throw new Error('useProducts debe usarse dentro de <ProductsProvider>.');
  return context;
}
