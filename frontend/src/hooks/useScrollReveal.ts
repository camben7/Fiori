import { useEffect } from 'react';

// Bloques de la página que aparecen suavemente al hacer scroll.
// El hero queda fuera a propósito: ya está a la vista al cargar y animarlo causaría un parpadeo (aparece, se oculta y reaparece).
const TARGETS = '.value-grid, .essence-grid, .season-inner, .section-heading, .care-grid, .contact-layout';

/**
 * Animación de aparición al hacer scroll, sin librerías.
 * Decisión técnica: IntersectionObserver + clases CSS pesan 0 KB frente a GSAP/AOS y se
 * apagan solas con `prefers-reduced-motion`. La clase `.reveal` se agrega desde JS (no desde
 * el HTML) para que, si JavaScript fallara, el contenido nunca quede invisible.
 */
export function useScrollReveal() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(TARGETS));
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('reveal--in');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    elements.forEach((element) => { element.classList.add('reveal'); observer.observe(element); });
    return () => {
      observer.disconnect();
      elements.forEach((element) => element.classList.remove('reveal', 'reveal--in'));
    };
  }, []);
}
