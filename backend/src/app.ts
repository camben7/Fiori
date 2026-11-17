import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
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
  app.use((_request, response) => response.status(404).json({ message: 'La ruta solicitada no existe.' }));
  return app;
}
