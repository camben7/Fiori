import { Router } from 'express';
import { z } from 'zod';
import { assistantLimiter } from '../middleware/rateLimits.js';
import { createAssistantReply } from '../services/assistant.js';

export const assistantRouter = Router();

const requestSchema = z.object({
  message: z.string().trim().min(1).max(700),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(700) })).max(8).default([]),
  products: z.array(z.object({
    name: z.string().max(100),
    description: z.string().max(500),
    category: z.string().max(60),
   price: z.number().nullable().default(null),

    is_active: z.boolean().optional(),
  })).max(30).default([]),
});

assistantRouter.post('/', assistantLimiter, async (request, response, next) => {
  try {
    const parsed = requestSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ message: 'Escribe una pregunta de hasta 700 caracteres.' });
      return;
    }

    const reply = await createAssistantReply(parsed.data.message, parsed.data.history, parsed.data.products);
    response.json({ reply });
  } catch (error) {
    next(error);
  }
});
