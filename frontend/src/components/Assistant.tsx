import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { MessageCircle, Send, ShoppingBag, X } from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import { askFiori } from '../services/api';
import type { AssistantMessage, Product } from '../types';
import { formatPrice } from '../utils';

/** Mensaje de la conversación. `productIds` son los arreglos que el asesor mencionó (para ofrecer "Ver y añadir"). */
interface ChatMessage extends AssistantMessage { productIds?: string[] }

const GREETING: ChatMessage = {
  role: 'assistant',
  content: '¡Hola! Soy el Asesor Floral de Fiori 🌷 Cuéntame para quién es el detalle, la ocasión y más o menos tu presupuesto, y te recomiendo el arreglo ideal. También puedo contarte cómo cuidar tus flores eternas.',
};

// Atajos para quien no sabe cómo empezar: bajan la barrera de escribir en el celular.
const QUICK_PROMPTS = ['Busco un regalo de cumpleaños', 'Ideas para un aniversario', '¿Cómo cuido mis flores eternas?'];

const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/**
 * Encuentra qué productos del catálogo nombra la respuesta del asesor.
 * Decisión técnica: el backend devuelve solo texto; detectar los nombres en el cliente nos permite
 * mostrar tarjetas con "Ver y añadir" sin cambiar el contrato de la API ni arriesgar respuestas inventadas
 * (solo aparecen productos que realmente existen en el catálogo).
 */
function findMentionedProducts(reply: string, products: Product[]): string[] {
  const text = normalize(reply);
  return products.filter((product) => product.name.length > 3 && text.includes(normalize(product.name))).slice(0, 3).map((product) => product.id);
}

export function Assistant() {
  const { products, openProduct } = useProducts();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const productsById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);

  // Mantiene la conversación a la vista y enfoca el campo al abrir.
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, loading, open]);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  useEffect(() => {
    if (!open) return;
    // Si hay un modal abierto (p. ej. el detalle de un producto), Escape cierra ese modal y no el asesor.
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && !document.querySelector('[aria-modal="true"]')) setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || loading) return;
    const history: AssistantMessage[] = messages.map(({ role, content }) => ({ role, content }));
    setMessages((current) => [...current, { role: 'user', content: message }]);
    setDraft('');
    setLoading(true);
    try {
      // El asesor recibe el catálogo REAL (el mismo que ve el cliente), en formato compacto.
      // El backend acepta máximo 30 productos y 100 kb por petición.
      const catalog = products.slice(0, 30).map(({ name, description, category, price, is_active }) => ({ name, description, category, price, is_active }));
      const reply = await askFiori(message, history, catalog);
      setMessages((current) => [...current, { role: 'assistant', content: reply, productIds: findMentionedProducts(reply, products) }]);
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', content: error instanceof Error ? error.message : 'En este momento no pude responder. Escríbenos por WhatsApp y te ayudamos con mucho gusto.' }]);
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(draft);
  }

  const showQuickPrompts = messages.length === 1 && !loading;

  return (
    <div className="assistant-root">
      {open && (
        <section className="assistant-panel" aria-label="Asesor Floral de Fiori">
          <div className="assistant-head">
            <span className="assistant-avatar"><img src={`${import.meta.env.BASE_URL}brand/fiori-mark.png`} alt="" /></span>
            <div><strong>Asesor Floral de Fiori</strong><small>Te ayudo a elegir tu detalle</small></div>
            <button type="button" aria-label="Cerrar asesor" className="assistant-close" onClick={() => setOpen(false)}><X size={18} aria-hidden="true" /></button>
          </div>

          <div className="assistant-messages" ref={listRef} aria-live="polite">
            {messages.map((message, index) => {
              const suggestions = (message.productIds ?? []).map((id) => productsById.get(id)).filter((product): product is Product => Boolean(product));
              return (
                <div key={`${message.role}-${index}`} className={`assistant-turn assistant-turn--${message.role}`}>
                  <div className={`assistant-message assistant-message--${message.role}`}>{message.content}</div>
                  {suggestions.map((product) => (
                    <div className="assistant-suggestion" key={product.id}>
                      <img src={product.image_url} alt="" loading="lazy" />
                      <div><strong>{product.name}</strong><small>{formatPrice(product.price)}</small></div>
                      <button type="button" onClick={() => openProduct(product)}><ShoppingBag size={14} aria-hidden="true" /> Ver y añadir</button>
                    </div>
                  ))}
                </div>
              );
            })}
            {loading && <div className="assistant-message assistant-message--assistant assistant-typing" role="status" aria-label="El asesor está escribiendo"><span /><span /><span /></div>}
            {showQuickPrompts && (
              <div className="assistant-chips">
                {QUICK_PROMPTS.map((prompt) => <button type="button" key={prompt} onClick={() => void send(prompt)}>{prompt}</button>)}
              </div>
            )}
          </div>

          <form className="assistant-form" onSubmit={submit}>
            <input ref={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Escribe tu pregunta…" aria-label="Tu pregunta" maxLength={700} />
            <button type="submit" aria-label="Enviar" disabled={loading || !draft.trim()}><Send size={17} aria-hidden="true" /></button>
          </form>
          <p className="assistant-disclaimer">El asesor puede equivocarse con disponibilidad y precios. Confirma tu pedido con Fiori.</p>
        </section>
      )}
      <button className="assistant-launcher" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? 'Cerrar asesor' : 'Hablar con el Asesor Floral de Fiori'}>
        {open ? <X size={22} aria-hidden="true" /> : <><MessageCircle size={20} aria-hidden="true" /><span>¿Te ayudo a elegir?</span></>}
      </button>
    </div>
  );
}
