import rateLimit from 'express-rate-limit';

export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Recibimos varias solicitudes desde tu conexión. Espera unos minutos e inténtalo de nuevo.' },
});

export const assistantLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'La asistente necesita una pequeña pausa. Intenta de nuevo en un minuto.' },
});
