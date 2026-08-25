const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const { getNextOrderNumber } = require('../models/Counter');
const { calculateOrderPricing, PricingError, round2 } = require('../utils/pricingEngine');
const { requireAdminAuth } = require('../middleware/auth');

const router = express.Router();

const DEFAULT_CHECKLIST_LABELS = (products, companions, decorations) => [
  ...products.map((p) => p.name),
  ...companions.map((c) => c.name),
  'Caja',
  ...decorations.map((d) => d.name),
  'Tarjeta',
];

// POST /api/orders — crear pedido directamente desde el flujo "armar-box"
// (sección 16). El cliente SOLO manda ids y cantidades: el precio se
// calcula aquí, nunca se confía en un precio recibido del frontend.
router.post(
  '/',
  [
    body('fromName').notEmpty().withMessage('Falta el nombre de quien envía.'),
    body('toName').notEmpty().withMessage('Falta el nombre del destinatario.'),
    body('contactPhone').notEmpty().withMessage('Falta el número de contacto.'),
    body('boxId').notEmpty().withMessage('Falta seleccionar la caja.'),
    body('products').isArray({ min: 1 }).withMessage('Debes seleccionar al menos un producto.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const {
        fromName,
        toName,
        contactPhone,
        products,
        companions = [],
        boxId,
        decorationIds = [],
        deliveryWanted,
        deliveryAddress,
        deliveryTime,
        deliveryReferences,
        customization = {},
        referenceImageUrl,
      } = req.body;

      if (deliveryWanted && !deliveryAddress) {
        return res.status(400).json({ error: 'Falta la dirección de entrega.' });
      }
      if (!deliveryTime) {
        return res.status(400).json({ error: 'Falta la hora de entrega.' });
      }

      const priced = await calculateOrderPricing({
        products,
        companions,
        boxId,
        decorationIds,
        deliveryWanted: !!deliveryWanted,
      });

      const orderNumber = await getNextOrderNumber();

      const order = await Order.create({
        orderNumber,
        fromName,
        toName,
        contactPhone,
        delivery: {
          wanted: !!deliveryWanted,
          address: deliveryWanted ? deliveryAddress : '',
          freeLocationName: priced.freeLocationName,
          time: deliveryTime,
          references: deliveryReferences || '',
        },
        products: priced.resolvedProducts,
        companions: priced.resolvedCompanions,
        box: priced.box,
        decorations: priced.resolvedDecorations,
        customization: {
          theme: customization.theme || '',
          predominantColors: customization.predominantColors || '',
          hasDedication: !!customization.hasDedication,
          dedicationText: customization.hasDedication ? customization.dedicationText || '' : '',
          cardStyleDescription: customization.cardStyleDescription || '',
        },
        pricing: priced.pricing,
        advanceAmount: round2(priced.pricing.finalPrice / 2),
        referenceImageUrl: referenceImageUrl || '',
        checklist: DEFAULT_CHECKLIST_LABELS(
          priced.resolvedProducts,
          priced.resolvedCompanions,
          priced.resolvedDecorations
        ).map((label) => ({ label, checked: false })),
      });

      // Sección 19: notificación al administrador. El envío automático por
      // WhatsApp Business API queda preparado en whatsappService.js pero
      // solo se activa si WHATSAPP_API_TOKEN está configurado.
      require('../utils/whatsappService').notifyAdminNewOrder(order).catch((e) =>
        console.warn('No se pudo notificar por WhatsApp:', e.message)
      );

      res.status(201).json({ order });
    } catch (err) {
      if (err instanceof PricingError) return res.status(400).json({ error: err.message });
      console.error(err);
      res.status(500).json({ error: 'Error creando el pedido.' });
    }
  }
);

// GET /api/orders/:orderNumber/public — para la pantalla de pago del cliente
router.get('/:orderNumber/public', async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber });
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado.' });
  res.json({ order });
});

// ---- RUTAS ADMIN ----

router.get('/', requireAdminAuth, async (req, res) => {
  const { paymentStatus, orderStatus } = req.query;
  const filter = {};
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (orderStatus) filter.orderStatus = orderStatus;
  const orders = await Order.find(filter).sort({ createdAt: -1 });
  res.json({ orders });
});

router.get('/:id', requireAdminAuth, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'No encontrado.' });
  res.json({ order });
});

router.patch('/:id/payment-status', requireAdminAuth, async (req, res) => {
  const { paymentStatus, amountPaid } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'No encontrado.' });
  if (paymentStatus) order.paymentStatus = paymentStatus;
  if (amountPaid !== undefined) order.amountPaid = amountPaid;
  await order.save();
  res.json({ order });
});

router.patch('/:id/order-status', requireAdminAuth, async (req, res) => {
  const { orderStatus } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'No encontrado.' });
  order.orderStatus = orderStatus;
  await order.save();
  res.json({ order });
});

router.patch('/:id/checklist', requireAdminAuth, async (req, res) => {
  const { checklist } = req.body; // array [{label, checked}]
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'No encontrado.' });
  order.checklist = checklist;
  await order.save();
  res.json({ order });
});

module.exports = router;
