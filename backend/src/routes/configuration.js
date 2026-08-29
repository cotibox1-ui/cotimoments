const express = require('express');
const Configuration = require('../models/Configuration');
const { requireAdminAuth } = require('../middleware/auth');

const router = express.Router();

// Público: el frontend cliente necesita textos de bienvenida, nombre del
// negocio, logo, y nombre del punto de entrega gratis — pero NUNCA el
// porcentaje de ganancia interno.
router.get('/public', async (req, res) => {
  const config = await Configuration.getSingleton();
  res.json({
    business: config.business,
    messages: config.messages,
    delivery: { zones: config.delivery.zones },
    referenceImageUrl: config.referenceImageUrl,
  });
});

// Admin: configuración completa, incluyendo % de ganancia y datos de pago.
router.get('/', requireAdminAuth, async (req, res) => {
  const config = await Configuration.getSingleton();
  res.json({ config });
});

router.put('/', requireAdminAuth, async (req, res) => {
  const config = await Configuration.getSingleton();
  const allowed = ['business', 'whatsapp', 'payment', 'pricing', 'delivery', 'messages', 'referenceImageUrl'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      if (typeof req.body[key] === 'object' && !Array.isArray(req.body[key])) {
        config[key] = { ...config[key].toObject?.() ?? config[key], ...req.body[key] };
      } else {
        config[key] = req.body[key];
      }
    }
  }
  await config.save();
  res.json({ config });
});

module.exports = router;
