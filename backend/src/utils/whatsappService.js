/**
 * Sección 18-19 del spec.
 *
 * Hay DOS mecanismos, deliberadamente separados:
 *
 * 1. buildClientWhatsappLink(order) — genera un link "https://wa.me/..."
 *    que el CLIENTE usa para enviar su comprobante. No requiere ninguna
 *    credencial, funciona siempre.
 *
 * 2. notifyAdminNewOrder(order) — notificación AUTOMÁTICA al administrador
 *    vía WhatsApp Business Cloud API. Esto SÍ requiere credenciales
 *    (WHATSAPP_API_TOKEN, WHATSAPP_PHONE_NUMBER_ID) que Fernand debe
 *    obtener en https://developers.facebook.com/docs/whatsapp/cloud-api
 *    Si no están configuradas, la función no falla: simplemente no envía
 *    nada y el pedido igual queda visible en el Dashboard (el Dashboard
 *    es la fuente de verdad, WhatsApp es un plus).
 */

function buildClientWhatsappLink(order) {
  const businessNumber = process.env.BUSINESS_WHATSAPP_NUMBER;
  const message =
    `Hola, envío el comprobante de pago de mi pedido ${order.orderNumber}.\n\n` +
    `De: ${order.fromName}\n` +
    `Para: ${order.toName}\n` +
    `Total: S/ ${order.pricing.finalPrice.toFixed(2)}`;

  const encoded = encodeURIComponent(message);
  if (!businessNumber) return null; // PENDIENTE DE CONFIGURAR CREDENCIAL
  return `https://wa.me/${businessNumber}?text=${encoded}`;
}

async function notifyAdminNewOrder(order) {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const adminNumber = process.env.BUSINESS_WHATSAPP_NUMBER;

  if (!token || !phoneNumberId || !adminNumber) {
    // PENDIENTE DE CONFIGURAR CREDENCIAL — no se envía nada automáticamente.
    return { sent: false, reason: 'Credenciales de WhatsApp Business API no configuradas.' };
  }

  const text =
    `🆕 Nuevo pedido ${order.orderNumber}\n` +
    `De: ${order.fromName} → Para: ${order.toName}\n` +
    `Total: S/ ${order.pricing.finalPrice.toFixed(2)}`;

  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: adminNumber,
      type: 'text',
      text: { body: text },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`WhatsApp API respondió ${res.status}: ${errText}`);
  }
  return { sent: true };
}

module.exports = { buildClientWhatsappLink, notifyAdminNewOrder };
