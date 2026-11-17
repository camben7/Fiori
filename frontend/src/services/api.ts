import type { AssistantMessage, ContactPayload, Product } from '../types';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as { message?: string } & T;
  if (!response.ok) throw new Error(payload.message || 'No pudimos completar la solicitud. Intenta nuevamente.');
  return payload;
}

export async function sendContact(payload: ContactPayload): Promise<void> {
  const response = await fetch(`${API_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  await parseResponse<{ success: boolean }>(response);
}

export async function askFiori(message: string, history: AssistantMessage[], products: Product[]): Promise<string> {
  const response = await fetch(`${API_URL}/api/assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history: history.slice(-8), products }),
  });
  const data = await parseResponse<{ reply: string }>(response);
  return data.reply;
}
