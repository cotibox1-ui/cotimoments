const PDFDocument = require('pdfkit');

const MARGIN = 36;
const PAGE_WIDTH = 595.28; // A4 en puntos
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LEFT_X = MARGIN;

// Layout de dos columnas asimétrico, como en la referencia: la columna
// izquierda (productos/costos) es más ancha que la derecha (resumen de
// precios y estados).
const GAP = 16;
const LEFT_W = 330;
const RIGHT_W = CONTENT_WIDTH - LEFT_W - GAP;
const RIGHT_X = LEFT_X + LEFT_W + GAP;

const PINK = '#C42A63';
const PINK_LIGHT = '#F9CEE0';
const INK = '#2B2330';
const GRAY = '#8A8390';
const LINE = '#EFE3EA';

/**
 * Genera el PDF de un pedido, pensado para imprimir en A4 y usarlo como
 * hoja de trabajo real durante la preparación (sección 22-23 del brief de
 * diseño): tabla de costos, resumen de precios, estados, y checklist con
 * casillas grandes para marcar con lapicero.
 *
 * Todo se dibuja con coordenadas x/y explícitas — pdfkit no debe usarse
 * con cursor implícito aquí, o el checklist termina "escalonado".
 */
function streamOrderPdf(order, res, businessName = '') {
  const doc = new PDFDocument({ size: 'A4', margin: MARGIN });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=${order.orderNumber}.pdf`);
  doc.pipe(res);

  // ---------- helpers ----------
  const box = (x, y, w, h, { fill } = {}) => {
    doc
      .roundedRect(x, y, w, h, 8)
      .lineWidth(1)
      .strokeColor(LINE);
    if (fill) doc.fillAndStroke(fill, LINE);
    else doc.stroke();
  };

  const label = (text, x, y, w, opts = {}) =>
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(GRAY).text(text.toUpperCase(), x, y, { width: w, ...opts });

  const heading = (text, x, y, w) => {
    doc.font('Helvetica-Bold').fontSize(9).fillColor(PINK).text(text.toUpperCase(), x, y, { width: w, characterSpacing: 0.4 });
    return y + 12;
  };

  const kv = (text, val, x, y, w) => {
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(GRAY).text(text.toUpperCase(), x, y, { width: w });
    const valueY = y + 10;
    const str = val && String(val).trim() ? String(val) : '-';
    doc.font('Helvetica').fontSize(10).fillColor(INK).text(str, x, valueY, { width: w });
    const h = doc.heightOfString(str, { width: w, font: 'Helvetica', size: 10 });
    return valueY + h + 4;
  };

  const money = (n) => `S/ ${Number(n).toFixed(2)}`;

  // Altura real que ocupará un campo "ETIQUETA + valor" dado un ancho —
  // se usa para calcular el alto de la caja ANTES de dibujar su borde,
  // así el texto nunca se sale ni se monta con la sección de abajo.
  const kvHeight = (val, w) => {
    const str = val && String(val).trim() ? String(val) : '-';
    return 10 + doc.heightOfString(str, { width: w, font: 'Helvetica', size: 10 }) + 4;
  };

  // Tabla simple: Producto | Cant | Costo unit | Subtotal
  const costTable = (items, x, y, w) => {
    const colProduct = w * 0.46;
    const colQty = w * 0.14;
    const colUnit = w * 0.2;
    const colSub = w * 0.2;

    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(GRAY);
    doc.text('PRODUCTO', x, y, { width: colProduct });
    doc.text('CANT.', x + colProduct, y, { width: colQty, align: 'right' });
    doc.text('COSTO UNIT.', x + colProduct + colQty, y, { width: colUnit, align: 'right' });
    doc.text('SUBTOTAL', x + colProduct + colQty + colUnit, y, { width: colSub, align: 'right' });
    y += 11;
    doc.strokeColor(LINE).moveTo(x, y).lineTo(x + w, y).stroke();
    y += 4;

    items.forEach((item) => {
      doc.font('Helvetica').fontSize(9.5).fillColor(INK);
      doc.text(item.name, x, y, { width: colProduct });
      doc.text(String(item.quantity), x + colProduct, y, { width: colQty, align: 'right' });
      doc.text(money(item.unitCostAtOrder), x + colProduct + colQty, y, { width: colUnit, align: 'right' });
      doc.text(money(item.totalCost), x + colProduct + colQty + colUnit, y, { width: colSub, align: 'right' });
      y += 13.5;
    });
    return y;
  };

  const priceRow = (text, val, x, y, w, opts = {}) => {
    doc.font(opts.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(opts.big ? 13 : 9.5).fillColor(opts.color || INK);
    doc.text(text, x, y, { width: w * 0.55 });
    doc
      .font(opts.bold ? 'Helvetica-Bold' : 'Helvetica')
      .fontSize(opts.big ? 13 : 9.5)
      .fillColor(opts.color || INK)
      .text(val, x + w * 0.45, y, { width: w * 0.55, align: 'right' });
    return y + (opts.big ? 18 : 13);
  };

  // ==================================================
  // ENCABEZADO
  // ==================================================
  let y = MARGIN;
  doc.font('Helvetica-Bold').fontSize(17).fillColor(PINK).text(businessName || 'Pedido', LEFT_X, y);
  doc.font('Helvetica').fontSize(8).fillColor(GRAY).text('Detalles que enamoran', LEFT_X, y + 20);

  doc.font('Helvetica-Bold').fontSize(9).fillColor(GRAY).text('N° PEDIDO', RIGHT_X, y, { width: RIGHT_W, align: 'right' });
  doc.font('Helvetica-Bold').fontSize(12).fillColor(INK).text(order.orderNumber, RIGHT_X, y + 11, { width: RIGHT_W, align: 'right' });
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor(GRAY)
    .text(`Fecha: ${new Date(order.createdAt).toLocaleDateString('es-PE')}`, RIGHT_X, y + 27, { width: RIGHT_W, align: 'right' });
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor(GRAY)
    .text(`Hora: ${new Date(order.createdAt).toLocaleTimeString('es-PE')}`, RIGHT_X, y + 38, { width: RIGHT_W, align: 'right' });

  y += 56;
  doc.strokeColor(PINK_LIGHT).lineWidth(2).moveTo(LEFT_X, y).lineTo(LEFT_X + CONTENT_WIDTH, y).stroke();
  y += 10;

  // ==================================================
  // CLIENTE / ENTREGA (dos cajas lado a lado)
  // ==================================================
  const isDelivery = order.pricing.deliveryCostAtOrder > 0;

  const clienteContentH =
    12 +
    kvHeight(order.fromName, LEFT_W - 24) +
    kvHeight(order.fromPhone, LEFT_W - 24) +
    kvHeight(order.toName, LEFT_W - 24) +
    kvHeight(order.toPhone, LEFT_W - 24);

  const entregaContentH =
    12 +
    kvHeight(order.delivery.zoneName, RIGHT_W - 20) +
    (isDelivery ? kvHeight(order.delivery.address, RIGHT_W - 20) : 0) +
    kvHeight(order.delivery.time, RIGHT_W - 20);

  const clienteBoxH = Math.max(clienteContentH, entregaContentH) + 14;

  box(LEFT_X, y, LEFT_W, clienteBoxH);
  box(RIGHT_X, y, RIGHT_W, clienteBoxH);

  let cy = heading('Cliente', LEFT_X + 12, y + 10, LEFT_W - 24);
  cy = kv('De', order.fromName, LEFT_X + 12, cy, LEFT_W - 24);
  cy = kv('Teléfono de quien envía', order.fromPhone, LEFT_X + 12, cy, LEFT_W - 24);
  cy = kv('Para', order.toName, LEFT_X + 12, cy, LEFT_W - 24);
  kv('Teléfono de quien recibe', order.toPhone, LEFT_X + 12, cy, LEFT_W - 24);

  let ey = heading('Entrega', RIGHT_X + 10, y + 10, RIGHT_W - 20);
  ey = kv('Zona', `${order.delivery.zoneName}${isDelivery ? ` (S/ ${order.pricing.deliveryCostAtOrder.toFixed(2)})` : ' (gratis)'}`, RIGHT_X + 10, ey, RIGHT_W - 20);
  if (isDelivery) {
    ey = kv('Dirección', order.delivery.address, RIGHT_X + 10, ey, RIGHT_W - 20);
  }
  kv('Hora', order.delivery.time, RIGHT_X + 10, ey, RIGHT_W - 20);

  y += clienteBoxH + 10;

  // ==================================================
  // PRODUCTOS + ACOMPAÑANTES + CAJA (izq) | RESUMEN DE PRECIOS (der)
  // ==================================================
  const sectionTop = y;
  let leftY = heading('Productos', LEFT_X, y, LEFT_W);
  leftY = costTable(order.products, LEFT_X, leftY, LEFT_W);

  if (order.companions.length) {
    leftY += 6;
    leftY = heading('Acompañantes', LEFT_X, leftY, LEFT_W);
    leftY = costTable(order.companions, LEFT_X, leftY, LEFT_W);
  }

  leftY += 6;
  leftY = heading('Caja', LEFT_X, leftY, LEFT_W);
  doc.font('Helvetica').fontSize(9.5).fillColor(INK).text(order.box.name, LEFT_X, leftY, { width: LEFT_W * 0.7 });
  doc
    .font('Helvetica')
    .fontSize(9.5)
    .fillColor(INK)
    .text(money(order.box.costAtOrder), LEFT_X + LEFT_W * 0.7, leftY, { width: LEFT_W * 0.3, align: 'right' });
  leftY += 14;
  if (order.decorations.length) {
    order.decorations.forEach((d) => {
      doc.font('Helvetica').fontSize(9.5).fillColor(INK).text(d.name, LEFT_X, leftY, { width: LEFT_W * 0.7 });
      doc
        .font('Helvetica')
        .fontSize(9.5)
        .fillColor(INK)
        .text(money(d.costAtOrder), LEFT_X + LEFT_W * 0.7, leftY, { width: LEFT_W * 0.3, align: 'right' });
      leftY += 15;
    });
  }

  // ---- Resumen de precios (columna derecha) ----
  const resumenH = 12 + 16 + 4 * 13 + 6 + 18 + 14; // heading + top pad + 4 filas + divisor + fila TOTAL + pad inferior
  box(RIGHT_X, sectionTop, RIGHT_W, resumenH, { fill: '#FFFBFC' });
  let ry = heading('Resumen de precios', RIGHT_X + 10, sectionTop + 10, RIGHT_W - 20);
  ry = priceRow('Costo base', money(order.pricing.baseCost), RIGHT_X + 10, ry, RIGHT_W - 20);
  ry = priceRow(`Ganancia (${order.pricing.profitPercentageAtOrder}%)`, money(order.pricing.profitAmount), RIGHT_X + 10, ry, RIGHT_W - 20);
  ry = priceRow('Precio del box', money(order.pricing.boxPrice), RIGHT_X + 10, ry, RIGHT_W - 20);
  ry = priceRow('Delivery', money(order.pricing.deliveryCostAtOrder), RIGHT_X + 10, ry, RIGHT_W - 20);
  doc.strokeColor(LINE).moveTo(RIGHT_X + 10, ry).lineTo(RIGHT_X + RIGHT_W - 10, ry).stroke();
  ry += 6;
  priceRow('TOTAL', money(order.pricing.finalPrice), RIGHT_X + 10, ry, RIGHT_W - 20, { bold: true, big: true, color: PINK });

  // ---- Estado de pago ----
  let sy = sectionTop + resumenH + 8;
  const saldoPendiente = Math.max(0, order.pricing.finalPrice - order.amountPaid);
  const estadoPagoContentH =
    12 + kvHeight(order.paymentStatus.replace(/_/g, ' '), RIGHT_W - 20) + kvHeight(money(saldoPendiente), RIGHT_W - 20);
  const estadoPagoH = estadoPagoContentH + 12;
  box(RIGHT_X, sy, RIGHT_W, estadoPagoH);
  let py = heading('Estado de pago', RIGHT_X + 10, sy + 8, RIGHT_W - 20);
  py = kv('Estado', order.paymentStatus.replace(/_/g, ' '), RIGHT_X + 10, py, RIGHT_W - 20);
  kv('Saldo pendiente', money(saldoPendiente), RIGHT_X + 10, py, RIGHT_W - 20);

  // ---- Estado del pedido ----
  sy += estadoPagoH + 8;
  const estadoPedidoH = 32;
  box(RIGHT_X, sy, RIGHT_W, estadoPedidoH);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(PINK).text('ESTADO DEL PEDIDO', RIGHT_X + 10, sy + 8, { width: RIGHT_W - 20 });
  doc.font('Helvetica-Bold').fontSize(10).fillColor(INK).text(order.orderStatus.replace('_', ' '), RIGHT_X + 10, sy + 19, { width: RIGHT_W - 20 });

  y = Math.max(leftY + 8, sy + estadoPedidoH + 10);

  // ==================================================
  // PERSONALIZACIÓN (caja completa)
  // ==================================================
  const custH =
    12 +
    kvHeight(order.customization.theme, CONTENT_WIDTH - 24) +
    kvHeight(order.customization.predominantColors, CONTENT_WIDTH - 24) +
    kvHeight(order.customization.hasDedication ? order.customization.dedicationText : 'No', CONTENT_WIDTH - 24) +
    kvHeight(order.customization.cardStyleDescription, CONTENT_WIDTH - 24);
  const personaH = custH + 14;
  box(LEFT_X, y, CONTENT_WIDTH, personaH);
  let pz = heading('Personalización', LEFT_X + 12, y + 10, CONTENT_WIDTH - 24);
  pz = kv('Temática', order.customization.theme, LEFT_X + 12, pz, CONTENT_WIDTH - 24);
  pz = kv('Colores predominantes', order.customization.predominantColors, LEFT_X + 12, pz, CONTENT_WIDTH - 24);
  pz = kv('Dedicatoria', order.customization.hasDedication ? order.customization.dedicationText : 'No', LEFT_X + 12, pz, CONTENT_WIDTH - 24);
  kv('Estilo de tarjeta', order.customization.cardStyleDescription, LEFT_X + 12, pz, CONTENT_WIDTH - 24);

  y += personaH + 10;

  // ==================================================
  // CHECKLIST DE PREPARACIÓN — 3 columnas
  // ==================================================
  const checklistRows = Math.ceil(order.checklist.length / 3);
  const checklistH = 24 + checklistRows * 17;
  box(LEFT_X, y, CONTENT_WIDTH, checklistH);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(PINK).text('CHECKLIST DE PREPARACIÓN', LEFT_X + 12, y + 10);

  const colW = (CONTENT_WIDTH - 24) / 3;
  const CHECKBOX = 11;
  order.checklist.forEach((c, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cx = LEFT_X + 12 + col * colW;
    const cy2 = y + 24 + row * 17;
    doc.rect(cx, cy2, CHECKBOX, CHECKBOX).lineWidth(1).strokeColor(INK).stroke();
    doc.font('Helvetica').fontSize(9.5).fillColor(INK).text(c.label, cx + CHECKBOX + 6, cy2 - 1, { width: colW - CHECKBOX - 10 });
  });

  y += checklistH + 10;

  // ==================================================
  // OBSERVACIONES
  // ==================================================
  doc.font('Helvetica-Bold').fontSize(9).fillColor(GRAY).text('OBSERVACIONES', LEFT_X, y);
  y += 12;
  for (let i = 0; i < 3; i++) {
    doc.strokeColor(LINE).moveTo(LEFT_X, y).lineTo(LEFT_X + CONTENT_WIDTH, y).stroke();
    y += 13;
  }

  y += 6;
  doc.font('Helvetica-Bold').fontSize(10).fillColor(PINK).text('Gracias por confiar en nosotros', LEFT_X, y, {
    width: CONTENT_WIDTH,
    align: 'center',
  });

  doc.end();
}

module.exports = { streamOrderPdf };
