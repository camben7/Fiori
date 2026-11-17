import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_ORIGINS: z.string().default('http://localhost:5173,http://localhost:4173'),
});
const parsed = schema.safeParse(process.env);
if (!parsed.success) throw new Error('Configuración inválida del backend.');

export const env = {
  ...parsed.data,
  allowedOrigins: parsed.data.FRONTEND_ORIGINS.split(',').map((value) => value.trim()).filter(Boolean),
};
