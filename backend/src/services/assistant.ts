import OpenAI from 'openai';
import { env } from '../config/env.js';
import { supabaseAdmin } from './supabase.js';

export interface PublicProduct {
  name: string;
  description: string;
  category: string;
  price: number | null;
  is_active?: boolean;
}

export interface ConversationEntry {
  role: 'user' | 'assistant';
  content: string;
}

const openai = env.hasOpenAI ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

const CARE_GUIDE = 'Para cuidar tus flores eternas de cinta o tela: mantenlas en un lugar seco, lejos del sol directo y de fuentes de calor; no las riegues ni las sumerjas; retira el polvo con una brocha limpia y muy suave; evita aplastarlas y guárdalas protegidas cuando no estén en exhibición.';

async function getCatalog(fallback: PublicProduct[]): Promise<PublicProduct[]> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('name, description, category, price, is_active')
      .eq('is_active', true)
      .limit(30);
    if (!error && data) return data as PublicProduct[];
  }
  return fallback.filter((product) => product.is_active !== false).slice(0, 30);
}

function makeDemoReply(message: string, products: PublicProduct[]): string {
  const normalized = message.toLocaleLowerCase('es');
  if (/(cuid|limpi|polvo|agua|sol|dur|conserv)/.test(normalized)) return `${CARE_GUIDE}\n\nAsí conservarás mejor la forma y los colores de tu arreglo. ♡`;

  const matching = products.filter((product) => {
    const text = `${product.name} ${product.description} ${product.category}`.toLocaleLowerCase('es');
    return normalized.split(/\W+/).some((word) => word.length > 4 && text.includes(word));
  });
  if (matching.length) {
    return `¡Mira estas ideas de Fiori!\n${matching.slice(0, 3).map((product) => `• ${product.name} (${product.category}): ${product.description}`).join('\n')}\n\nLos valores y la disponibilidad se confirman directamente con nuestro equipo. ¿Para qué ocasión lo estás buscando?`;
  }

  if (/(cumple|anivers|amor|amistad|grado|regal|sorprend)/.test(normalized)) {
    return '¡Qué bonito preparar un detalle para esa ocasión! 🌷 Podemos explorar un ramo romántico, una composición en tonos suaves o un diseño personalizado. Cuéntame qué colores le gustan a esa persona y qué quieres celebrar.';
  }
  if (/(precio|valor|cu[aá]nto|presupuesto|barat)/.test(normalized)) {
    return 'Con mucho gusto te ayudamos a encontrar una opción. Los precios dependen del tamaño, la cantidad de flores y los detalles del diseño. Cuéntame tu presupuesto aproximado y te orientamos; el valor final se confirma por WhatsApp.';
  }
  return '¡Me encanta ayudarte a elegir! 🌷 En Fiori hacemos flores eternas de cinta y tela, ramos y detalles personalizados. Cuéntame la ocasión, los colores que tienes en mente o el presupuesto y te propongo algunas ideas.';
}

export async function createAssistantReply(message: string, history: ConversationEntry[], fallback: PublicProduct[]): Promise<string> {
  const products = await getCatalog(fallback);
  if (!openai) return makeDemoReply(message, products);

  const catalogText = products.map((product) => ({
    name: product.name,
    category: product.category,
    description: product.description,
    price: product.price,
  }));

  const systemPrompt = `Eres la asistente virtual oficial de Fiori, un emprendimiento colombiano de arreglos florales artesanales especializado en flores eternas de cinta y tela, ramos y productos de temporada. Hablas español colombiano neutro, con tono cálido, cercano, elegante y acogedor; eres breve pero útil, no exageras los emojis (máximo uno por mensaje) y nunca suenas insistente.\n\nTu trabajo es recomendar arreglos del catálogo, preguntar por la ocasión, colores, tamaño y presupuesto cuando sea útil, y explicar cuidados. Catálogo actual en JSON: ${JSON.stringify(catalogText)}\n\nCuidados confirmados: ${CARE_GUIDE}\n\nReglas: no inventes existencias, tiempos de entrega, precios, materiales específicos, políticas ni descuentos. Si no hay precio informado, indícalo y recomienda confirmar por WhatsApp. No afirmes que un producto está disponible si el catálogo no lo especifica. No solicites datos sensibles ni pagos. Si falta información, haz una sola pregunta concreta. Para pedidos especiales, invita a contactar directamente a Fiori.`;

  const recentHistory = history.slice(-8).map((entry) => ({ role: entry.role, content: entry.content }));
  const response = await openai.responses.create({
    model: env.OPENAI_MODEL,
    input: [
      { role: 'system', content: systemPrompt },
      ...recentHistory,
      { role: 'user', content: message },
    ],
    max_output_tokens: 450,
  });

  return response.output_text?.trim() || makeDemoReply(message, products);
}
