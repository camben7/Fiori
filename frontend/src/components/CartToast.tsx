import { useEffect } from 'react';
import { Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

/** Aviso breve al agregar un producto, con atajo para abrir el carrito. */
export function CartToast() {
  const { toast, dismissToast, openCart } = useCart();

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(dismissToast, 4500);
    return () => window.clearTimeout(timer); // `toast.id` cambia con cada aviso, así que el contador se reinicia
  }, [toast, dismissToast]);

  if (!toast) return null;
  return (
    <div className="toast" role="status" key={toast.id}>
      <span className="toast-icon"><Check size={15} aria-hidden="true" /></span>
      <span className="toast-text">{toast.text}</span>
      <button type="button" className="toast-action" onClick={openCart}>Ver carrito</button>
    </div>
  );
}
