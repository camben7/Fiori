
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

const CARE_GUIDE =
  'Las flores eternas de Fiori no necesitan agua ni cuidados especiales. No las riegues ni las sumerjas en agua.';

const FIORI_INFO = `
IDENTIDAD DE FIORI:
- Fiori es un emprendimiento colombiano de arreglos florales eternos.
- Sus flores son elaboradas con cintas y tela.
- IMPORTANTE: Fiori no vende flores naturales ni arreglos de flores realistas.
- Su estilo de atención es cercano, elegante, amable y orientado a ayudar al cliente a comprar.

PRODUCTOS:
- Ramos.
- Cajas de flores.
- Arreglos en bases decorativas.
- Flores individuales.
- Arreglos personalizados.
- La mayoría de los pedidos se elaboran bajo encargo.

COMPLEMENTOS:
- Chocolates.
- Peluches.
- Tarjetas con mensajes.
- Luces decorativas.
- Globos.

FORMULARIO DE PERSONALIZACIÓN:
- El cliente selecciona un producto del catálogo.
- Al seleccionar el producto se abre su formulario de personalización.
- Allí puede elegir complementos y opciones disponibles.
- También puede escribir instrucciones especiales.
- Puede personalizar colores, cantidad de flores, empaque y mensaje de la tarjeta.
- El precio de los complementos y el valor personalizado se calculan al finalizar el proceso.
- No inventes ni anticipes el precio final de los complementos.
- Cuando el cliente pregunte cómo agregar algo, oriéntalo para completar el formulario del producto seleccionado.
- No inventes opciones que no estén disponibles en el formulario.

PRECIOS:
- Algunos productos tienen precios establecidos en el catálogo.
- Otros requieren cotización personalizada.
- El cliente puede consultar el catálogo, solicitar una cotización o indicar su presupuesto.
- El precio mostrado en el catálogo no necesariamente representa el total de un pedido personalizado.
- El precio final se calcula después de seleccionar las opciones y complementos.
- Nunca inventes precios, descuentos ni costos adicionales.

ENTREGAS:
- Cobertura: Barranquilla y Soledad, Colombia.
- La modalidad de entrega es a domicilio.
- El costo del domicilio depende de la ubicación.
- Tiempo habitual de elaboración: 3 a 5 días.
- Los pedidos para el mismo día tienen un recargo de $10.000 COP y están sujetos a disponibilidad.
- Nunca prometas una entrega para el mismo día sin confirmar disponibilidad.

PAGOS:
- Medios aceptados: transferencia bancaria, Nequi y efectivo.
- Para programar un pedido se requiere un anticipo del 50%.
- El 50% restante se paga cuando el cliente recibe su arreglo.
- No inventes números de cuenta, datos bancarios ni números de teléfono.

CAMBIOS Y CANCELACIONES:
- Se permiten cambios antes de que comience la elaboración del arreglo.
- No prometas cambios una vez iniciada la elaboración.

CUIDADOS:
- Las flores eternas no necesitan agua ni cuidados especiales.

ATENCIÓN Y CONTACTO:
- Instagram: @fioribaq.
- Si no puedes resolver una consulta, invita al cliente a comunicarse con Fiori por WhatsApp o Instagram.
- No inventes horarios de atención ni números de contacto.

INFORMACIÓN PARA ORIENTAR UN PEDIDO:
- Producto o diseño deseado.
- Colores.
- Presupuesto aproximado.
- Fecha en que necesita recibirlo.
- No solicites todos estos datos de golpe: pregunta solamente lo necesario según la conversación.
`;

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

  if (/(cuid|limpi|polvo|agua|sol|conserv)/.test(normalized)) {
    return `${CARE_GUIDE}\n\n¡Así podrás disfrutar de tu arreglo por mucho tiempo! 🌷`;
  }

  if (/(complement|chocolate|peluche|tarjeta|globo|luces|agregar|anadir|añadir)/.test(normalized)) {
    return '¡Claro que puedes personalizar tu detalle! En el formulario que aparece al seleccionar un producto del catálogo puedes elegir complementos como chocolates, peluches, tarjetas, luces y globos. También puedes escribir instrucciones especiales. El precio final se calcula al terminar la personalización.';
  }

  if (/(entrega|domicilio|envio|envío|barranquilla|soledad)/.test(normalized)) {
    return 'Realizamos entregas a domicilio en Barranquilla y Soledad. El costo depende de la ubicación. ¿En qué zona necesitas recibir tu arreglo?';
  }

  if (/(mismo dia|hoy|urgente|inmediato)/.test(normalized)) {
    return 'Los pedidos para el mismo día tienen un recargo de $10.000 COP y están sujetos a disponibilidad. Te recomendamos confirmar primero con nuestro equipo por WhatsApp.';
  }

  if (/(tiempo|demora|cuanto tarda|cuánto tarda|dias|días|cuando estaria|cuándo estaría)/.test(normalized)) {
    return 'El tiempo habitual de elaboración de nuestros arreglos es de 3 a 5 días. La mayoría de los pedidos se realizan bajo encargo.';
  }

  if (/(pago|pagar|nequi|transferencia|efectivo|anticipo|abono)/.test(normalized)) {
    return 'Aceptamos transferencia bancaria, Nequi y efectivo. Para programar tu pedido se requiere un anticipo del 50%; el 50% restante se paga cuando recibes tu arreglo.';
  }

  if (/(cambio|cancel|modificar)/.test(normalized)) {
    return 'Puedes solicitar cambios antes de que comience la elaboración de tu arreglo. Una vez iniciada, no podemos garantizar modificaciones.';
  }

  if (/(precio|valor|cu[aá]nto|presupuesto|barat)/.test(normalized)) {
    return '¡Con gusto te ayudamos! Algunos arreglos tienen precio establecido en el catálogo y otros requieren cotización. Si personalizas tu producto con complementos, el precio final se calcula al terminar el formulario. ¿Qué presupuesto tienes en mente?';
  }

  const matching = products.filter((product) => {
    const text = `${product.name} ${product.description} ${product.category}`.toLocaleLowerCase('es');
    return normalized.split(/\W+/).some((word) => word.length > 4 && text.includes(word));
  });

  if (matching.length) {
    return `¡Mira estas opciones de nuestro catálogo!\n${matching.slice(0, 3).map((product) => `• ${product.name}: ${product.description}${product.price !== null ? ` Precio de catálogo: ${product.price}` : ' Precio por cotizar.'}`).join('\n')}\n\nPuedes seleccionar el producto y personalizarlo en su formulario. ¿Para qué ocasión lo buscas?`;
  }

  if (/(cumple|anivers|amor|amistad|grado|regal|sorprend)/.test(normalized)) {
    return '¡Qué bonito preparar un detalle para esa ocasión! En Fiori tenemos ramos, cajas y arreglos personalizados de flores eternas. ¿Qué colores le gustan a esa persona?';
  }

  return '¡Hola! Soy el Asesor Floral de Fiori 🌷 Tenemos arreglos de flores eternas elaboradas con cintas y tela. Puedo ayudarte a encontrar un diseño, conocer el catálogo y orientarte con la personalización. ¿Qué ocasión tienes en mente?';
}

export async function createAssistantReply(
  message: string,
  history: ConversationEntry[],
  fallback: PublicProduct[],
): Promise<string> {
  const products = await getCatalog(fallback);

  if (!openai) return makeDemoReply(message, products);

  const catalogText = products.map((product) => ({
    name: product.name,
    category: product.category,
    description: product.description,
    price: product.price,
  }));

  const systemPrompt = `
Eres la asistente virtual oficial de Fiori.

${FIORI_INFO}

CATÁLOGO ACTUAL:
${JSON.stringify(catalogText)}

CÓMO DEBES ATENDER:
1. Habla en español colombiano neutro, con un tono cálido, elegante, cercano y profesional.
2. Sé amable, persuasiva y comercial, pero nunca insistente.
3. Usa máximo un emoji por mensaje.
4. Recomienda productos que existan en el catálogo recibido.
5. Utiliza los precios del catálogo únicamente como precios publicados del producto.
6. Nunca presentes el precio de catálogo como precio final de una personalización.
7. Explica que los complementos se calculan al finalizar el formulario.
8. Cuando el cliente quiera agregar un complemento, indícale que seleccione el producto y use su formulario de personalización.
9. No inventes productos, materiales, colores disponibles, existencias, precios, descuentos ni disponibilidad.
10. No prometas entregas ni disponibilidad para el mismo día sin confirmación.
11. No inventes costos de domicilio: dependen de la ubicación.
12. No inventes horarios, teléfonos ni datos bancarios.
13. Nunca describas los productos de Fiori como flores naturales o realistas.
14. Si el cliente quiere hacer un pedido, oriéntalo para elegir el producto y completar su formulario.
15. Si necesitas información adicional, haz una sola pregunta concreta por mensaje.
16. No solicites datos sensibles ni información de tarjetas bancarias.
17. Si no puedes resolver una consulta, invita al cliente a contactar a Fiori por WhatsApp o Instagram (@fioribaq).

Tu objetivo es ayudar al cliente a elegir un arreglo, resolver sus dudas y acompañarlo durante la personalización y compra, sin inventar información.
`;

  const recentHistory = history.slice(-8).map((entry) => ({
    role: entry.role,
    content: entry.content,
  }));

  const response = await openai.responses.create({
    model: env.OPENAI_MODEL,
    input: [
      { role: 'system', content: systemPrompt },
      ...recentHistory,
      { role: 'user', content: message },
    ],
    max_output_tokens: 650,
  });

  return response.output_text?.trim() || makeDemoReply(message, products);
}
