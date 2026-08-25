const PDFDocument = require('pdfkit');

/**
 * Genera el PDF de un pedido (sección 27). Diseñado para imprimir en A4:
 * incluye TODOS los datos del pedido y un checklist con casillas grandes
 * vacías para marcar con lapicero durante la preparación.
 *
 * @param {import('../models/Order')} order
 * @param {import('http').ServerResponse} res — se hace streaming directo a la respuesta
 */
function streamOrderPdf(order, res, businessName = '') {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=${order.orderNumber}.pdf`);
  doc.pipe(res);

  const line = () => doc.moveDown(0.3).strokeColor('#cccccc').moveTo(doc.x, doc.y).lineTo(555, doc.y).stroke().moveDown(0.5);
  const label = (text) => doc.font('Helvetica-Bold').fontSize(10).fillColor('#555555').text(text);
  const value = (text) => doc.font('Helvetica').fontSize(12).fillColor('#000000').text(text || '-');

  // ---- ENCABEZADO ----
  if (businessName) {
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#555555').text(businessName.toUpperCase());
    doc.moveDown(0.2);
  }
  doc.font('Helvetica-Bold').fontSize(20).fillColor('#000000').text(order.orderNumber, { align: 'left' });
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#555555')
    .text(`${new Date(order.createdAt).toLocaleDateString('es-PE')}  ${new Date(order.createdAt).toLocaleTimeString('es-PE')}`);
  line();

  // ---- CLIENTE ----
  doc.font('Helvetica-Bold').fontSize(13).fillColor('#000').text('DATOS DEL PEDIDO');
  doc.moveDown(0.3);
  label('DE'); value(order.fromName);
  label('PARA'); value(order.toName);
  label('TELÉFONO'); value(order.contactPhone);
  line();

  // ---- PRODUCTOS ----
  doc.font('Helvetica-Bold').fontSize(13).text('PRODUCTOS');
  order.products.forEach((p) => doc.font('Helvetica').fontSize(11).text(`• ${p.name}  x${p.quantity}`));
  if (order.companions.length) {
    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').fontSize(13).text('ACOMPAÑANTES');
    order.companions.forEach((c) => doc.font('Helvetica').fontSize(11).text(`• ${c.name}  x${c.quantity}`));
  }
  line();

  // ---- CAJA Y DECORACIÓN ----
  doc.font('Helvetica-Bold').fontSize(13).text('CAJA Y DECORACIÓN');
  doc.font('Helvetica').fontSize(11).text(`Caja: ${order.box.name}`);
  order.decorations.forEach((d) => doc.font('Helvetica').fontSize(11).text(`• ${d.name}`));
  line();

  // ---- PERSONALIZACIÓN ----
  doc.font('Helvetica-Bold').fontSize(13).text('PERSONALIZACIÓN');
  label('Temática'); value(order.customization.theme);
  label('Colores predominantes'); value(order.customization.predominantColors);
  label('Dedicatoria'); value(order.customization.hasDedication ? order.customization.dedicationText : 'No');
  label('Estilo de tarjeta'); value(order.customization.cardStyleDescription);
  line();

  // ---- ENTREGA ----
  doc.font('Helvetica-Bold').fontSize(13).text('ENTREGA');
  if (order.delivery.wanted) {
    label('Dirección'); value(order.delivery.address);
  } else {
    label('Punto de entrega'); value(`${order.delivery.freeLocationName} (GRATIS)`);
  }
  label('Hora'); value(order.delivery.time);
  label('Referencias'); value(order.delivery.references);
  line();

  // ---- PRECIO ----
  doc.font('Helvetica-Bold').fontSize(13).text('PRECIO');
  doc.font('Helvetica').fontSize(11).text(`Delivery: S/ ${order.pricing.deliveryCostAtOrder.toFixed(2)}`);
  doc.font('Helvetica-Bold').fontSize(14).text(`TOTAL: S/ ${order.pricing.finalPrice.toFixed(2)}`);
  doc.font('Helvetica').fontSize(10).fillColor('#555').text(`Estado de pago: ${order.paymentStatus}`);
  doc.text(`Estado del pedido: ${order.orderStatus}`);
  line();

  // ---- CHECKLIST DE PREPARACIÓN ----
  doc.font('Helvetica-Bold').fontSize(13).fillColor('#000').text('CHECKLIST DE PREPARACIÓN');
  doc.moveDown(0.3);
  order.checklist.forEach((c) => {
    const y = doc.y;
    doc.rect(doc.x, y + 1, 14, 14).stroke(); // casilla grande para lapicero
    doc.font('Helvetica').fontSize(12).text(c.label, doc.x + 22, y);
    doc.moveDown(0.2);
  });

  doc.moveDown(1);
  doc.font('Helvetica-Bold').fontSize(11).text('PREPARAR  →  REVISAR  →  ENTREGAR', { align: 'center' });

  doc.end();
}

module.exports = { streamOrderPdf };
