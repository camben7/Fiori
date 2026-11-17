import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), summary';

/**
 * Comportamiento accesible común de modales y paneles laterales:
 *  - Escape cierra,
 *  - el foco entra al panel al abrir, queda atrapado con Tab y vuelve al botón que lo abrió al cerrar,
 *  - la página de fondo no se desplaza mientras está abierto.
 * Decisión técnica: centralizarlo en un hook evita repetir (y olvidar) estas reglas en cada panel.
 */
export function useModalBehavior(ref: RefObject<HTMLElement | null>, onClose: () => void) {
  // Guardamos onClose en una ref para que cambiar su identidad no reinicie el efecto (y le robe el foco al usuario).
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusables = () => Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((element) => element.getClientRects().length > 0);
    (focusables()[0] ?? node).focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') { event.stopPropagation(); closeRef.current(); return; }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) { event.preventDefault(); return; }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      opener?.focus?.();
    };
  }, [ref]);
}
