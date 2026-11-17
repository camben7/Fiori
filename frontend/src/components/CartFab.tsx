import { useEffect, useRef, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

/** Botón flotante del carrito con contador en tiempo real. */
export function CartFab() {
  const { count, openCart } = useCart();
  const [bump, setBump] = useState(false);
  const previous = useRef(count);

  // Pequeño "salto" cuando se agrega algo: confirma visualmente la acción sin interrumpir.
  useEffect(() => {
    if (count > previous.current) {
      setBump(true);
      const timer = window.setTimeout(() => setBump(false), 650);
      previous.current = count;
      return () => window.clearTimeout(timer);
    }
    previous.current = count;
  }, [count]);

  return (
    <button type="button" className={`cart-fab${bump ? ' is-bump' : ''}`} onClick={openCart} aria-label={`Abrir carrito, ${count} ${count === 1 ? 'producto' : 'productos'}`}>
      <ShoppingBag size={22} aria-hidden="true" />
      {count > 0 && <span className="cart-badge" aria-hidden="true">{count > 99 ? '99+' : count}</span>}
    </button>
  );
}
