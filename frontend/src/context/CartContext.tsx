import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import type { ReactNode } from 'react';
import type { CartItem, Product } from '../types';
import { cartTotals } from '../services/order';

const STORAGE_KEY = 'fiori:cart:v1';
export const MAX_QUANTITY = 20;

type Action =
  | { type: 'add'; item: CartItem }
  | { type: 'setQuantity'; key: string; quantity: number }
  | { type: 'remove'; key: string }
  | { type: 'clear' };

const clampQuantity = (value: number) => Math.min(MAX_QUANTITY, Math.max(1, Math.round(value)));

/**
 * Reducer puro: toda la lógica del carrito vive aquí, sin efectos secundarios.
 * Decisión técnica: useReducer en lugar de varios useState porque las acciones
 * (agregar, fusionar líneas iguales, límites de cantidad) comparten reglas.
 */
function cartReducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case 'add': {
      const existing = state.find((item) => item.key === action.item.key);
      if (!existing) return [...state, { ...action.item, quantity: clampQuantity(action.item.quantity) }];
      // Mismo producto con las mismas opciones: se suma a la línea existente.
      return state.map((item) => (item.key === existing.key ? { ...item, quantity: clampQuantity(item.quantity + action.item.quantity) } : item));
    }
    case 'setQuantity':
      return state.map((item) => (item.key === action.key ? { ...item, quantity: clampQuantity(action.quantity) } : item));
    case 'remove':
      return state.filter((item) => item.key !== action.key);
    case 'clear':
      return [];
  }
}

/** Lee el carrito guardado y descarta cualquier dato que no tenga la forma esperada. */
function loadCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is CartItem => {
      const candidate = item as Partial<CartItem> | null;
      return Boolean(candidate && typeof candidate.key === 'string' && typeof candidate.name === 'string'
        && typeof candidate.quantity === 'number' && (candidate.unitPrice === null || typeof candidate.unitPrice === 'number'));
    }).map((item) => ({ ...item, quantity: clampQuantity(item.quantity) }));
  } catch {
    // localStorage puede estar bloqueado (modo privado): el carrito funciona igual, solo sin persistencia.
    return [];
  }
}

export interface AddItemInput {
  product: Product;
  quantity: number;
  ribbonColor?: string;
  size?: string;
  dedication?: string;
}

interface Toast { id: number; text: string }

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  unpricedCount: number;
  isOpen: boolean;
  toast: Toast | null;
  openCart: () => void;
  closeCart: () => void;
  addItem: (input: AddItemInput) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  dismissToast: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, loadCart);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  // Persistimos cada cambio. Es un efecto (no parte del reducer) para mantener el reducer puro.
  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* sin persistencia */ }
  }, [items]);

  const addItem = useCallback(({ product, quantity, ribbonColor, size, dedication }: AddItemInput) => {
    const sizeExtra = product.sizes?.find((option) => option.label === size)?.price_delta ?? 0;
    const unitPrice = product.price === null ? null : product.price + sizeExtra;
    const cleanDedication = dedication?.trim() || undefined;
    const key = [product.id, ribbonColor ?? '', size ?? '', cleanDedication ?? ''].join('|');
    dispatch({
      type: 'add',
      item: { key, productId: product.id, name: product.name, image_url: product.image_url, category: String(product.category),
        unitPrice, quantity, ribbonColor, size, dedication: cleanDedication },
    });
    setToast({ id: Date.now(), text: `${product.name} se añadió a tu carrito` });
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => dispatch({ type: 'setQuantity', key, quantity }), []);
  const removeItem = useCallback((key: string) => dispatch({ type: 'remove', key }), []);
  const clear = useCallback(() => dispatch({ type: 'clear' }), []);
  const openCart = useCallback(() => { setToast(null); setIsOpen(true); }, []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const dismissToast = useCallback(() => setToast(null), []);

  const value = useMemo<CartContextValue>(() => {
    const { count, subtotal, unpricedCount } = cartTotals(items);
    return { items, count, subtotal, unpricedCount, isOpen, toast, openCart, closeCart, addItem, setQuantity, removeItem, clear, dismissToast };
  }, [items, isOpen, toast, openCart, closeCart, addItem, setQuantity, removeItem, clear, dismissToast]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de <CartProvider>.');
  return context;
}
