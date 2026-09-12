const express = require('express');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const Proposal = require('../models/Proposal');
const Order = require('../models/Order');
const { getNextOrderNumber } = require('../models/Counter');
const { calculateOrderPricing, PricingError, round2 } = require('../utils/pricingEngine');
const { requireAdminAuth } = require('../middleware/auth');

const router = express.Router();

function generatePublicId() {
  return crypto.randomBytes(4).toString('hex').toUpperCase(); // ej. "A1B2C3D4"
}

// ---- ADMIN: crear oferta de box / propuesta (secciones 32-33) ----
router.post(
  '/',
  requireAdminAuth,
  [
    body('boxId').notEmpty(),
    body('products').isArray({ min: 1 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg || 'Datos inválidos.' });

    try {
      const { products, companions = [], boxId, decorationIds = [], customization = {}, referenceImageUrl } =
        req.body;

      // Reutilizamos el motor de precios con deliveryWanted=false: el
      // delivery de una propuesta lo decide el CLIENTE al confirmarla,
      // no el admin al crearla.
      const priced = await calculateOrderPricing({
        products,
        companions,
        boxId,
        decorationIds,
        deliveryWanted: false,
      });

      let publicId = generatePublicId();
      // Evita colisiones (muy improbable, pero por seguridad).
      while (await Proposal.findOne({ publicId })) publicId = generatePublicId();

      const proposal = await Proposal.create({
        publicId,
        products: priced.resolvedProducts,
        companions: priced.resolvedCompanions,
        box: {
          boxId: priced.box.boxId,
          name: priced.box.name,
          costAtProposal: priced.box.costAtOrder,
        },
        decorations: priced.resolvedDecorations.map((d) => ({
          decorationId: d.decorationId,
          name: d.name,
          costAtProposal: d.costAtOrder,
        })),
        customization,
        pricing: {
          baseCost: priced.pricing.baseCost,
          profitPercentageAtProposal: priced.pricing.profitPercentageAtOrder,
          profitAmount: priced.pricing.profitAmount,
          boxPrice: priced.pricing.boxPrice,
        },
        referenceImageUrl: referenceImageUrl || '',
      });

      res.status(201).json({
        proposal,
        publicUrl: `${process.env.FRONTEND_URL}/propuesta/${publicId}`,
      });
    } catch (err) {
      if (err instanceof PricingError) return res.status(400).json({ error: err.message });
      console.error(err);
      res.status(500).json({ error: 'Error creando la propuesta.' });
    }
  }
);

router.get('/', requireAdminAuth, async (req, res) => {
  const proposals = await Proposal.find().sort({ createdAt: -1 });
  res.json({ proposals });
});

// ---- PÚBLICO: el cliente abre el link y revisa la propuesta ----
router.get('/:publicId', async (req, res) => {
  const proposal = await Proposal.findOne({ publicId: req.params.publicId });
  if (!proposal) return res.status(404).json({ error: 'Propuesta no encontrada.' });
  res.json({ proposal });
});

// ---- PÚBLICO: el cliente confirma la propuesta -> se crea el pedido ----
router.post(
  '/:publicId/confirm',
  [
    body('fromName').notEmpty(),
    body('fromPhone').notEmpty(),
    body('toName').notEmpty(),
    body('toPhone').notEmpty(),
    body('deliveryTime').notEmpty(),
    body('deliveryZoneName').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg || 'Datos inválidos.' });

    const proposal = await Proposal.findOne({ publicId: req.params.publicId });
    if (!proposal) return res.status(404).json({ error: 'Propuesta no encontrada.' });
    if (proposal.status !== 'ACTIVA') {
      return res.status(400).json({ error: 'Esta propuesta ya no está disponible.' });
    }

    const { fromName, fromPhone, toName, toPhone, deliveryZoneName, deliveryAddress, deliveryTime, deliveryReferences } =
      req.body;

    // El precio del box viene de la propuesta ya calculada (y validada en
    // backend al crearla). Aquí se resuelve el costo real de la zona de
    // entrega elegida, igual que en el flujo normal.
    const Configuration = require('../models/Configuration');
    const config = await Configuration.getSingleton();
    const zone = (config.delivery.zones || []).find((z) => z.name === deliveryZoneName);
    if (!zone) return res.status(400).json({ error: 'La zona de entrega seleccionada ya no está disponible.' });

    if (zone.cost > 0 && !deliveryAddress) {
      return res.status(400).json({ error: 'Falta la dirección de entrega.' });
    }

    const deliveryCostAtOrder = zone.cost;
    const finalPrice = round2(proposal.pricing.boxPrice + deliveryCostAtOrder);

    const orderNumber = await getNextOrderNumber();

    const order = await Order.create({
      orderNumber,
      fromName,
      fromPhone,
      toName,
      toPhone,
      delivery: {
        zoneName: zone.name,
        address: zone.cost > 0 ? deliveryAddress : '',
        time: deliveryTime,
        references: deliveryReferences || '',
      },
      products: proposal.products,
      companions: proposal.companions,
      box: { boxId: proposal.box.boxId, name: proposal.box.name, costAtOrder: proposal.box.costAtProposal },
      decorations: proposal.decorations.map((d) => ({
        decorationId: d.decorationId,
        name: d.name,
        costAtOrder: d.costAtProposal,
      })),
      customization: proposal.customization,
      pricing: {
        baseCost: proposal.pricing.baseCost,
        profitPercentageAtOrder: proposal.pricing.profitPercentageAtProposal,
        profitAmount: proposal.pricing.profitAmount,
        boxPrice: proposal.pricing.boxPrice,
        deliveryCostAtOrder,
        finalPrice,
      },
      advanceAmount: round2(finalPrice / 2),
      referenceImageUrl: proposal.referenceImageUrl,
      proposalId: proposal._id,
      checklist: [
        ...proposal.products.map((p) => ({ label: p.name, checked: false })),
        ...proposal.companions.map((c) => ({ label: c.name, checked: false })),
        { label: 'Caja', checked: false },
        ...proposal.decorations.map((d) => ({ label: d.name, checked: false })),
      ],
    });

    proposal.status = 'CONVERTIDA';
    proposal.convertedOrderId = order._id;
    await proposal.save();

    require('../utils/whatsappService').notifyAdminNewOrder(order).catch(() => {});

    res.status(201).json({ order });
  }
);

// PUT /api/proposals/:id — edita una propuesta existente (CRUD completo).
// Solo se permite mientras sigue ACTIVA: una propuesta ya CONVERTIDA ya
// generó su pedido con su propio snapshot de precios (sección 38), así
// que editarla después no tendría sentido ni afectaría a ese pedido.
router.put(
  '/:id',
  requireAdminAuth,
  [
    body('boxId').notEmpty(),
    body('products').isArray({ min: 1 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg || 'Datos inválidos.' });

    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ error: 'No encontrada.' });
    if (proposal.status !== 'ACTIVA') {
      return res.status(400).json({ error: 'Solo se pueden editar propuestas que sigan ACTIVAS.' });
    }

    try {
      const { products, companions = [], boxId, decorationIds = [], customization = {}, referenceImageUrl } =
        req.body;

      const priced = await calculateOrderPricing({ products, companions, boxId, decorationIds });

      proposal.products = priced.resolvedProducts;
      proposal.companions = priced.resolvedCompanions;
      proposal.box = {
        boxId: priced.box.boxId,
        name: priced.box.name,
        costAtProposal: priced.box.costAtOrder,
      };
      proposal.decorations = priced.resolvedDecorations.map((d) => ({
        decorationId: d.decorationId,
        name: d.name,
        costAtProposal: d.costAtOrder,
      }));
      proposal.customization = customization;
      if (referenceImageUrl !== undefined) proposal.referenceImageUrl = referenceImageUrl;
      proposal.pricing = {
        baseCost: priced.pricing.baseCost,
        profitPercentageAtProposal: priced.pricing.profitPercentageAtOrder,
        profitAmount: priced.pricing.profitAmount,
        boxPrice: priced.pricing.boxPrice,
      };

      await proposal.save();
      res.json({ proposal, publicUrl: `${process.env.FRONTEND_URL}/propuesta/${proposal.publicId}` });
    } catch (err) {
      if (err instanceof PricingError) return res.status(400).json({ error: err.message });
      console.error(err);
      res.status(500).json({ error: 'Error editando la propuesta.' });
    }
  }
);

// DELETE /api/proposals/:id — elimina una propuesta. No afecta a los
// pedidos ya creados a partir de ella: cada pedido guarda su propio
// snapshot completo (sección 38), independiente de la propuesta original.
router.delete('/:id', requireAdminAuth, async (req, res) => {
  const proposal = await Proposal.findById(req.params.id);
  if (!proposal) return res.status(404).json({ error: 'No encontrada.' });
  await proposal.deleteOne();
  res.json({ ok: true });
});

module.exports = router;
