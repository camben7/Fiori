import { z } from 'zod';

// Parse and validate environment variables once at process startup. Optional
// integrations remain disabled until their server-side secrets are supplied.
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_ORIGINS: z.string().default('http://localhost:5173,http://localhost:4173'),
  SUPABASE_URL: z.string().url().optional().or(z.literal('')),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),
  OPENAI_API_KEY: z.string().optional().default(''),
  OPENAI_MODEL: z.string().trim().min(1).default('gpt-6-astra'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // Do not print secrets or the raw environment object in startup errors.
  throw new Error('Configuración inválida del backend. Revisa las variables de entorno.');
}

const data = parsed.data;

export const env = {
  ...data,
  hasSupabase: Boolean(data.SUPABASE_URL && data.SUPABASE_SERVICE_ROLE_KEY),
  hasOpenAI: Boolean(data.OPENAI_API_KEY),
  allowedOrigins: data.FRONTEND_ORIGINS.split(',').map((value) => value.trim()).filter(Boolean),
};
