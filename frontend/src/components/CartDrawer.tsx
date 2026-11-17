import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, Copy, Instagram, MessageCircle, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useModalBehavior } from '../hooks/useModalBehavior';
import { buildOrderMessage, copyToClipboard, instagramDmUrl, lineTotal, whatsappOrderUrl } from '../services/order';
import { formatPrice } from '../utils';

/** Panel lateral del carrito. Se monta una sola vez en App y se muestra solo cuando `isOpen`. */
export function CartDrawer() {
  const { isOpen, closeCart } = useCart();
  return isOpen ? <DrawerPanel onClose={closeCart} /> : null;
}

function DrawerPanel({ onClose }: { onClose: () => void }) {
  const { items, count, subtotal, unpricedCount, setQuantity, removeItem, clear } = useCart();
  const panelRef = useRef<HTMLElement>(null);
  const [handoff, setHandoff] = useState(false);   // true = ya se copió el pedido y se muestran las instrucciones
  const [copied, setCopied] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  useModalBehavior(panelRef, onClose);

  // Al cambiar de vista el botón pulsado desaparece; devolvemos el foco al panel para no perder la navegación con teclado.
  useEffect(() => { panelRef.current?.focus(); }, [handoff]);

  const message = buildOrderMessage(items);

  /**
   * "Finalizar pedido por Instagram".
   * Decisión técnica: copiar y abrir la pestaña ocurren dentro del MISMO clic del usuario
   * (los navegadores bloquean window.open si se espera una promesa antes de llamarlo).
   */
  function finishOnInstagram() {
    void copyToClipboard(message).then(setCopied);
    window.open(instagramDmUrl(), '_blank', 'noopener,noreferrer');
    setHandoff(true);
  }

  async function copyAgain() {
    setCopied(await copyToClipboard(message));
  }

  function goToCatalog() {
    onClose();
    // Esperamos un frame para que el modal libere el bloqueo de scroll antes de desplazar la página.
    window.requestAnimationFrame(() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' }));
  }

  return (
    <div className="cart-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Tu carrito" ref={panelRef} tabIndex={-1}>
        <header className="cart-head">
          <div><span className="eyebrow">Tu pedido</span><h2>{handoff ? 'Casi listo' : 'Carrito'}</h2></div>
          <button type="button" className="icon-button cart-close" onClick={onClose} aria-label="Cerrar carrito"><X size={20} aria-hidden="true" /></button>
        </header>

        {items.length === 0 ? (
          <div className="cart-empty">
            <span className="cart-empty-icon"><ShoppingBag size={28} aria-hidden="true" /></span>
            <h3>Tu carrito está vacío</h3>
            <p>Elige un arreglo, personaliza la cinta y la dedicatoria, y arma tu pedido aquí.</p>
            <button type="button" className="button button--primary" onClick={goToCatalog}>Ver catálogo</button>
          </div>
        ) : handoff ? (
          <div className="cart-handoff">
            <p className="cart-handoff-title"><Check size={18} aria-hidden="true" /> {copied ? 'Copiamos tu pedido' : 'Tu pedido está listo'}</p>
            <p className="cart-handoff-text">
              {copied
                ? 'Abrimos el chat de Instagram de Fiori. Pega el mensaje (mantén presionado el campo de texto y elige “Pegar”) y envíalo.'
                : 'No pudimos copiarlo automáticamente. Selecciona el mensaje de abajo, cópialo y pégalo en el chat de Instagram de Fiori.'}
            </p>
            <textarea className="cart-handoff-message" readOnly value={message} rows={12} aria-label="Resumen de tu pedido" onFocus={(event) => event.currentTarget.select()} />
            <div className="cart-actions">
              <button type="button" className="button button--olive button--full" onClick={() => void copyAgain()}><Copy size={16} aria-hidden="true" /> {copied ? '¡Copiado!' : 'Copiar mensaje'}</button>
              <a className="button button--outline button--full" href={instagramDmUrl()} target="_blank" rel="noreferrer"><Instagram size={16} aria-hidden="true" /> Abrir Instagram <ArrowUpRight size={15} aria-hidden="true" /></a>
              <button type="button" className="text-link cart-back" onClick={() => setHandoff(false)}>Volver al carrito</button>
            </div>
          </div>
        ) : (
          <>
            <ul className="cart-items">
              {items.map((item) => {
                const total = lineTotal(item);
                return (
                  <li className="cart-item" key={item.key}>
                    <img src={item.image_url} alt="" />
                    <div className="cart-item-body">
                      <div className="cart-item-top">
                        <strong>{item.name}</strong>
                        <button type="button" className="cart-remove" onClick={() => removeItem(item.key)} aria-label={`Quitar ${item.name} del carrito`}><Trash2 size={15} aria-hidden="true" /></button>
                      </div>
                      <p className="cart-item-options">
                        {[item.size, item.ribbonColor && `Cinta ${item.ribbonColor.toLowerCase()}`].filter(Boolean).join(' · ')}
                      </p>
                      {item.dedication && <p className="cart-item-dedication">“{item.dedication}”</p>}
                      <div className="cart-item-bottom">
                        <div className="qty qty--small" role="group" aria-label={`Cantidad de ${item.name}`}>
                          <button type="button" onClick={() => setQuantity(item.key, item.quantity - 1)} disabled={item.quantity <= 1} aria-label="Disminuir cantidad"><Minus size={13} aria-hidden="true" /></button>
                          <output>{item.quantity}</output>
                          <button type="button" onClick={() => setQuantity(item.key, item.quantity + 1)} aria-label="Aumentar cantidad"><Plus size={13} aria-hidden="true" /></button>
                        </div>
                        <span className="cart-item-price">{total === null ? 'Por cotizar' : formatPrice(total)}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <footer className="cart-summary">
              <div className="cart-row"><span>Productos</span><span>{count}</span></div>
              <div className="cart-row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="cart-row cart-row--total"><span>Total estimado</span><strong>{formatPrice(subtotal)}</strong></div>
              {unpricedCount > 0 && <p className="cart-note">{unpricedCount === 1 ? '1 producto está' : `${unpricedCount} productos están`} por cotizar y no se suma{unpricedCount === 1 ? '' : 'n'} al total. Te confirmamos el valor final.</p>}
              <div className="cart-actions">
                <button type="button" className="button button--olive button--full" onClick={finishOnInstagram}><Instagram size={17} aria-hidden="true" /> Finalizar pedido por Instagram</button>
                <a className="button button--outline button--full" href={whatsappOrderUrl(items)} target="_blank" rel="noreferrer"><MessageCircle size={17} aria-hidden="true" /> Prefiero WhatsApp</a>
                {confirmClear ? (
                  <p className="cart-confirm">¿Vaciar el carrito? <button type="button" onClick={() => { clear(); setConfirmClear(false); }}>Sí, vaciar</button><button type="button" onClick={() => setConfirmClear(false)}>No</button></p>
                ) : (
                  <button type="button" className="text-link cart-back" onClick={() => setConfirmClear(true)}>Vaciar carrito</button>
                )}
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
