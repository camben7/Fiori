import { Router } from 'express';
import { z } from 'zod';
import { contactLimiter } from '../middleware/rateLimits.js';
import { supabaseAdmin } from '../services/supabase.js';

export const contactRouter = Router();

const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().max(30).optional().default(''),
  occasion: z.string().trim().min(1).max(80),
  message: z.string().trim().min(10).max(1200),
  website: z.string().max(200).optional().default(''),
});

contactRouter.post('/', contactLimiter, async (request, response, next) => {
  try {
    const parsed = contactSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ message: 'Revisa los campos del formulario e inténtalo de nuevo.' });
      return;
    }

    // Campo trampa anti-spam: los usuarios reales no lo ven ni lo completan.
    if (parsed.data.website) {
      response.status(200).json({ success: true });
      return;
    }

    if (!supabaseAdmin) {
      response.status(503).json({ message: 'El formulario todavía no está conectado a la base de datos. Escríbenos por WhatsApp mientras lo configuramos.' });
      return;
    }

    const { error } = await supabaseAdmin.from('contact_messages').insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      occasion: parsed.data.occasion,
      message: parsed.data.message,
      status: 'new',
    });

    if (error) {
      console.error('No se pudo guardar la solicitud de contacto:', error.message);
      response.status(500).json({ message: 'No pudimos guardar tu mensaje. Intenta nuevamente o escríbenos por WhatsApp.' });
      return;
    }

    response.status(201).json({ success: true, message: 'Tu mensaje fue recibido. Gracias por escribirnos.' });
  } catch (error) {
    next(error);
  }
});
