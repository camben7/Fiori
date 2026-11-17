import { useState } from 'react';
import type { FormEvent } from 'react';
import { Bot, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { askFiori } from '../services/api';
import { demoProducts } from '../data/demoProducts';
import type { AssistantMessage } from '../types';

export function Assistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    { role: 'assistant', content: '¡Hola! Soy la asistente de Fiori 🌷 Puedo ayudarte a elegir un ramo, contarte cómo cuidar tus flores eternas o pensar un detalle para una ocasión especial. ¿Qué tienes en mente?' },
  ]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || loading) return;
    const history = [...messages, { role: 'user' as const, content: message }];
    setMessages(history);
    setDraft('');
    setLoading(true);
    try {
      const reply = await askFiori(message, messages, demoProducts);
      setMessages((current) => [...current, { role: 'assistant', content: reply }]);
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', content: error instanceof Error ? error.message : 'En este momento no pude responder. Escríbenos por WhatsApp y te ayudamos con mucho gusto.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="assistant-root">
      {open && <section className="assistant-panel" aria-label="Asistente Fiori">
        <div className="assistant-head"><span className="assistant-avatar"><Sparkles size={18} /></span><div><strong>Fiori te acompaña</strong><small>Asistente de arreglos y cuidados</small></div><button type="button" aria-label="Cerrar asistente" className="assistant-close" onClick={() => setOpen(false)}><X size={18} /></button></div>
        <div className="assistant-messages" aria-live="polite">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`assistant-message assistant-message--${message.role}`}>{message.content}</div>)}{loading && <div className="assistant-message assistant-message--assistant assistant-typing">Fiori está pensando…</div>}</div>
        <form className="assistant-form" onSubmit={submit}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Escribe tu pregunta…" aria-label="Tu pregunta" maxLength={700} /><button type="submit" aria-label="Enviar" disabled={loading || !draft.trim()}><Send size={17} /></button></form>
        <p className="assistant-disclaimer">La asistente puede equivocarse con disponibilidad y precios. Confirma tu pedido con Fiori.</p>
      </section>}
      <button className="assistant-launcher" type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Cerrar asistente' : 'Hablar con Fiori'}>{open ? <X size={22} /> : <><Bot size={21} /><span>¿Te ayudo a elegir?</span><MessageCircle size={17} /></>}</button>
    </div>
  );
}
