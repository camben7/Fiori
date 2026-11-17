import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowUpRight, CheckCircle2, LoaderCircle, MessageCircle, Send } from 'lucide-react';
import { sendContact } from '../services/api';
import { whatsappUrl } from '../utils';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Cuéntanos tu nombre.').max(80, 'El nombre es demasiado largo.'),
  email: z.string().trim().email('Escribe un correo válido.').max(120),
  phone: z.string().trim().max(30, 'Revisa el número de teléfono.').optional(),
  occasion: z.string().min(1, 'Selecciona la ocasión.'),
  message: z.string().trim().min(10, 'Cuéntanos un poquito más (mínimo 10 caracteres).').max(1200, 'El mensaje es demasiado largo.'),
  website: z.string().optional(),
});

type ContactValues = z.infer<typeof contactSchema>;

export function ContactSection() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', occasion: '', message: '', website: '' },
  });

  async function submit(values: ContactValues) {
    setStatus('idle');
    setServerError('');
    try {
      await sendContact(values);
      setStatus('success');
      reset();
    } catch (error) {
      setStatus('error');
      setServerError(error instanceof Error ? error.message : 'No pudimos enviar tu mensaje.');
    }
  }

  return (
    <section className="section contact-section" id="contacto">
      <div className="container contact-layout">
        <div className="contact-copy">
          <span className="eyebrow">Hablemos de tu idea</span>
          <h2>Cuéntanos a quién quieres <em>hacer sonreír.</em></h2>
          <p>Nos encanta crear detalles con historia. Déjanos los datos de tu idea y nos pondremos en contacto contigo.</p>
          <div className="contact-direct"><span className="contact-icon"><MessageCircle size={20} /></span><div><small>¿Prefieres hablar directamente?</small><a href={whatsappUrl('Hola, Fiori. Quiero diseñar un detalle especial.')} target="_blank" rel="noreferrer">Escríbenos por WhatsApp <ArrowUpRight size={15} /></a></div></div>
          <div className="contact-flower-note">Un detalle hecho especialmente para alguien especial. <span>♡</span></div>
        </div>
        <div className="contact-form-card">
          <div className="form-card-heading"><span className="eyebrow">Tu próximo detalle</span><h3>Empecemos a crear</h3><p>Todos los campos marcados son necesarios.</p></div>
          {status === 'success' && <div className="form-alert form-alert--success"><CheckCircle2 size={18} /> ¡Gracias por escribirnos! Tu mensaje fue recibido.</div>}
          {status === 'error' && <div className="form-alert form-alert--error">{serverError} También puedes escribirnos por WhatsApp.</div>}
          <form onSubmit={handleSubmit(submit)} noValidate>
            <div className="form-row">
              <label>Tu nombre<input {...register('name')} placeholder="¿Cómo te llamas?" autoComplete="name" aria-invalid={Boolean(errors.name)} />{errors.name && <small className="field-error">{errors.name.message}</small>}</label>
              <label>Correo electrónico<input {...register('email')} type="email" placeholder="tucorreo@ejemplo.com" autoComplete="email" aria-invalid={Boolean(errors.email)} />{errors.email && <small className="field-error">{errors.email.message}</small>}</label>
            </div>
            <div className="form-row">
              <label>WhatsApp (opcional)<input {...register('phone')} type="tel" placeholder="Tu número de contacto" autoComplete="tel" /></label>
              <label>¿Qué celebramos?<select {...register('occasion')} aria-invalid={Boolean(errors.occasion)}><option value="">Selecciona una ocasión</option><option>Cumpleaños</option><option>Aniversario</option><option>Amor y amistad</option><option>Grado o logro</option><option>Un detalle sin ocasión</option><option>Otra ocasión</option></select>{errors.occasion && <small className="field-error">{errors.occasion.message}</small>}</label>
            </div>
            <label>Cuéntanos tu idea<textarea {...register('message')} rows={4} placeholder="Colores, tipo de arreglo, fecha o esa idea que tienes en mente…" aria-invalid={Boolean(errors.message)} />{errors.message && <small className="field-error">{errors.message.message}</small>}</label>
            <label className="honeypot" aria-hidden="true">No completar<input {...register('website')} tabIndex={-1} autoComplete="off" /></label>
            <button type="submit" className="button button--dark button--full" disabled={isSubmitting}>{isSubmitting ? <><LoaderCircle size={17} className="spin" /> Enviando…</> : <>Enviar mi idea <Send size={16} /></>}</button>
            <p className="privacy-note">Tus datos se utilizarán únicamente para responder a tu solicitud.</p>
          </form>
        </div>
      </div>
    </section>
  );
}
