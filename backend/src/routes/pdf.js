const express = require('express');
const Order = require('../models/Order');
const Configuration = require('../models/Configuration');
const { streamOrderPdf } = require('../utils/orderPdf');
const { requireAdminAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/orders/:id/pdf
router.get('/:id/pdf', requireAdminAuth, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'No encontrado.' });
  const config = await Configuration.getSingleton();
  streamOrderPdf(order, res, config.business.name);
});

module.exports = router;
