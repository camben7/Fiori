import { useId, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { Leaf, Minus, Plus, ShoppingBag, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import { CARE_TIPS } from '../data/careTips';
import { DEFAULT_RIBBON_COLORS, ribbonSwatch } from '../data/ribbons';
import { useModalBehavior } from '../hooks/useModalBehavior';
import type { Product } from '../types';
import { formatPrice } from '../utils';

const MAX_DEDICATION = 140;
const MAX_MODAL_QUANTITY = 10;

/** Se monta una sola vez en App; muestra el producto que el catálogo o el asistente hayan abierto. */
export function ProductModal() {
  const { selected, closeProduct } = useProducts();
  // `key` = id del producto: al abrir otro producto el diálogo se reinicia (opciones y zoom vuelven a su estado inicial).
  return selected ? <ProductDialog key={selected.id} product={selected} onClose={closeProduct} /> : null;
}

function ProductDialog({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addItem } = useCart();
  const dialogRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  useModalBehavior(dialogRef, onClose);

  // Si el administrador no configuró colores, se ofrecen unos por defecto; los tamaños, en cambio,
  // solo aparecen si existen (no inventamos tamaños ni precios que el negocio no definió).
  const colors = product.ribbon_colors?.length ? product.ribbon_colors : DEFAULT_RIBBON_COLORS;
  const sizes = product.sizes ?? [];
  const canDedicate = product.allows_dedication !== false;

  const [ribbon, setRibbon] = useState(colors[0]);
  const [size, setSize] = useState(sizes[0]?.label ?? '');
  const [dedication, setDedication] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [chocolates, setChocolates] = useState(0);
  const [plushToy, setPlushToy] = useState(false);
  const [card, setCard] = useState(false);
  const [lights, setLights] = useState(false);
  const [balloons, setBalloons] = useState(false);
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });

  // Precio unitario = base + extra del tamaño elegido. Sin precio base, queda "por cotizar".
  const extra = sizes.find((option) => option.label === size)?.price_delta ?? 0;
  const unitPrice = product.price === null ? null : product.price + extra;
  const total = unitPrice === null ? null : unitPrice * quantity;

  /**
   * Convierte la posición del puntero en porcentajes para que el zoom siga al cursor.
   * IMPORTANTE: se llama ANTES de setZoom y no dentro de su función: React deja `currentTarget` en null
   * cuando termina el manejador, así que leerlo después (al aplicar el estado) rompería el modal.
   */
  function pointer(event: MouseEvent<HTMLButtonElement>) {
    // Un clic generado por teclado (detail 0) no trae posición: ampliamos desde el centro.
    if (event.detail === 0) return { x: 50, y: 50 };
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 };
  }

 function addToCart() {
  addItem({
    product,
    quantity,
    ribbonColor: ribbon,
    size: sizes.length ? size : undefined,
    dedication: canDedicate ? dedication : undefined,
    extras: {
      chocolates,
      plushToy,
      card,
      lights,
      balloons,
    },
  });

  onClose();
}

  const titleId = `${uid}-title`;
  const previewStyle = { '--ribbon': ribbonSwatch(ribbon) } as CSSProperties;

  return (
    // onMouseDown (no onClick): si alguien arrastra para seleccionar texto y suelta fuera, el modal no se cierra por accidente.
    <div className="modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={dialogRef} tabIndex={-1}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar detalle"><X size={20} aria-hidden="true" /></button>

        <div className="modal-media">
          <button
            type="button"
            className={`modal-zoom${zoom.active ? ' is-zoomed' : ''}`}
            aria-label={zoom.active ? 'Reducir foto' : 'Ampliar foto'}
            onClick={(event) => { const point = pointer(event); setZoom((current) => ({ active: !current.active, ...point })); }}
            onMouseMove={(event) => { if (!zoom.active) return; const point = pointer(event); setZoom((current) => ({ ...current, ...point })); }}
          >
            <img src={product.image_url} alt={product.name} style={{ transformOrigin: `${zoom.x}% ${zoom.y}%` }} draggable={false} />
          </button>
          <span className="modal-zoom-hint" aria-hidden="true">{zoom.active ? <ZoomOut size={14} /> : <ZoomIn size={14} />}{zoom.active ? 'Toca para reducir' : 'Toca para ampliar'}</span>
        </div>

        <div className="modal-body">
          <div className="modal-scroll">
            <span className="eyebrow">{product.category}</span>
            <h2 id={titleId}>{product.name}</h2>
            <p className="modal-price">
              {unitPrice === null ? 'Consultar valor' : formatPrice(unitPrice)}
              {unitPrice !== null && quantity > 1 && <small> × {quantity} = {formatPrice(total)}</small>}
            </p>
            {unitPrice === null && <p className="modal-price-note">Te confirmamos el valor cuando envíes tu pedido.</p>}
            <p className="modal-desc">{product.description}</p>
            <ul className="modal-tags" aria-label="Características">
              <li>Hecho a mano</li><li>Flores eternas</li><li>Personalizable</li>
            </ul>

            <fieldset className="option-group">
              <legend>Color de la cinta <span>{ribbon}</span></legend>
              <div className="swatches">
                {colors.map((color) => (
                  <label key={color} className={`swatch${ribbon === color ? ' is-selected' : ''}`} title={color}>
                    <input type="radio" name={`${uid}-ribbon`} value={color} checked={ribbon === color} onChange={() => setRibbon(color)} />
                    <span className="swatch-dot" style={{ background: ribbonSwatch(color) }} />
                    <span className="swatch-name">{color}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {sizes.length > 0 && (
              <fieldset className="option-group">
                <legend>Tamaño <span>{size}</span></legend>
                <div className="size-options">
                  {sizes.map((option) => (
                    <label key={option.label} className={`size-chip${size === option.label ? ' is-selected' : ''}`}>
                      <input type="radio" name={`${uid}-size`} value={option.label} checked={size === option.label} onChange={() => setSize(option.label)} />
                      <strong>{option.label}</strong>
                      <small>{option.price_delta > 0 ? `+ ${formatPrice(option.price_delta)}` : 'Incluido'}</small>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {canDedicate && (
              <div className="option-group">
                <label className="option-label" htmlFor={`${uid}-dedication`}>Dedicatoria <span>(opcional)</span></label>
                <textarea
                  id={`${uid}-dedication`}
                  className="dedication-input"
                  rows={2}
                  maxLength={MAX_DEDICATION}
                  value={dedication}
                  onChange={(event) => setDedication(event.target.value)}
                  placeholder="Escribe el mensaje que acompañará tu detalle…"
                />
                <div className="dedication-meta"><span>Aparece en una tarjetica con tu cinta.</span><span>{dedication.length}/{MAX_DEDICATION}</span></div>
                {/* Vista previa en vivo: la tarjeta toma el color de la cinta elegida. */}
                <div className="dedication-card" style={previewStyle} aria-hidden="true">
                  <span className="dedication-ribbon" />
                  <p className={dedication.trim() ? '' : 'is-placeholder'}>{dedication.trim() || 'Tu mensaje aparecerá aquí…'}</p>
                </div>
              </div>
            )}

<fieldset className="option-group">
  <legend>Complementa tu detalle</legend>

  <div className="option-group">
    <label className="option-label" htmlFor={`${uid}-chocolates`}>
      Chocolates
    </label>
    <select
      id={`${uid}-chocolates`}
      value={chocolates}
      onChange={(event) => setChocolates(Number(event.target.value))}
    >
      <option value={0}>Ninguno</option>
      {[1, 3, 5, 7, 10].map((amount) => (
        <option key={amount} value={amount}>
          {amount} chocolates
        </option>
      ))}
    </select>
  </div>

  <label className="option-label">
    <input type="checkbox" checked={plushToy}
      onChange={(event) => setPlushToy(event.target.checked)} />
    Peluche
  </label>

  <label className="option-label">
    <input type="checkbox" checked={card}
      onChange={(event) => setCard(event.target.checked)} />
    Tarjeta (+ $8.000)
  </label>

  <label className="option-label">
    <input type="checkbox" checked={lights}
      onChange={(event) => setLights(event.target.checked)} />
    Luces decorativas
  </label>

  <label className="option-label">
    <input type="checkbox" checked={balloons}
      onChange={(event) => setBalloons(event.target.checked)} />
    Globos
  </label>

  <p className="modal-price-note">
    Los complementos adicionales se cotizan por WhatsApp.
  </p>
</fieldset>


            <details className="modal-care">
              <summary><Leaf size={16} aria-hidden="true" /> Cuidados de tus flores eternas</summary>
              <ul>{CARE_TIPS.map((tip) => <li key={tip}>{tip}</li>)}</ul>
            </details>
          </div>

          <div className="modal-footer">
            <div className="qty" role="group" aria-label="Cantidad">
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1} aria-label="Disminuir cantidad"><Minus size={15} aria-hidden="true" /></button>
              <output aria-live="polite">{quantity}</output>
              <button type="button" onClick={() => setQuantity((value) => Math.min(MAX_MODAL_QUANTITY, value + 1))} disabled={quantity >= MAX_MODAL_QUANTITY} aria-label="Aumentar cantidad"><Plus size={15} aria-hidden="true" /></button>
            </div>
            <button type="button" className="button button--primary modal-add" onClick={addToCart}>
              <ShoppingBag size={17} aria-hidden="true" /> Añadir al carrito{total !== null && <span className="modal-add-total">{formatPrice(total)}</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
