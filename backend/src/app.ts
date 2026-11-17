import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { contactRouter } from './routes/contact.js';
import { healthRouter } from './routes/health.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin || env.allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Origen no autorizado por la política CORS.'));
    },
  }));
  app.use(express.json({ limit: '100kb' }));

  app.use('/api/health', healthRouter);
  app.use('/api/contact', contactRouter);

  app.use((_request, response) => response.status(404).json({ message: 'La ruta solicitada no existe.' }));
  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    // Keep internal details in server logs; return a friendly, non-sensitive error.
    console.error('Error no controlado en la API:', error instanceof Error ? error.message : 'desconocido');
    response.status(500).json({ message: 'Ocurrió un problema. Intenta nuevamente en unos momentos.' });
  });

  return app;
}
