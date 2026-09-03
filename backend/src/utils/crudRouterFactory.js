const express = require('express');
const { body, validationResult } = require('express-validator');
const { requireAdminAuth } = require('../middleware/auth');
const { upload, cloudinary } = require('../config/cloudinary');

/**
 * Genera un router CRUD estándar para catálogos simples
 * (Product, Box, Decoration, Companion) que comparten la forma:
 * name, description, photoUrl, photoPublicId, cost, available[, category].
 *
 * Rutas públicas (sin auth): GET / y GET /:id — solo devuelven items
 * disponibles, y JAMÁS exponen el campo "cost" al público.
 * Rutas protegidas (con auth): POST, PUT, PATCH /:id/toggle, DELETE.
 */
function buildCrudRouter(Model, { hasCategory = false } = {}) {
  const router = express.Router();

  // ---- PÚBLICO: solo catálogo disponible, sin costos ----
  router.get('/', async (req, res) => {
    const items = await Model.find({ available: true }).select('-cost').sort({ createdAt: -1 });
    res.json({ items });
  });

  // ---- ADMIN: catálogo completo con costos ----
  router.get('/admin', requireAdminAuth, async (req, res) => {
    const items = await Model.find().sort({ createdAt: -1 });
    res.json({ items });
  });

  router.get('/admin/:id', requireAdminAuth, async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'No encontrado.' });
    res.json({ item });
  });

  // ---- CREAR (con imagen opcional) ----
  const validators = [
    body('name').notEmpty().withMessage('El nombre es obligatorio.'),
    body('cost').isFloat({ min: 0 }).withMessage('El costo debe ser un número positivo.'),
  ];

  router.post('/', requireAdminAuth, upload.single('photo'), validators, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg || 'Datos inválidos.' });

    const payload = {
      name: req.body.name,
      description: req.body.description || '',
      cost: parseFloat(req.body.cost),
      available: req.body.available !== 'false',
    };
    if (hasCategory) payload.category = req.body.category || 'general';
    if (req.file) {
      payload.photoUrl = req.file.path;
      payload.photoPublicId = req.file.filename;
    }

    const created = await Model.create(payload);
    res.status(201).json({ item: created });
  });

  // ---- EDITAR ----
  router.put('/:id', requireAdminAuth, upload.single('photo'), async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'No encontrado.' });

    if (req.body.name !== undefined) item.name = req.body.name;
    if (req.body.description !== undefined) item.description = req.body.description;
    if (req.body.cost !== undefined) item.cost = parseFloat(req.body.cost);
    if (hasCategory && req.body.category !== undefined) item.category = req.body.category;
    if (req.body.available !== undefined) item.available = req.body.available !== 'false';

    if (req.file) {
      // Borra la imagen anterior en Cloudinary para no acumular basura.
      if (item.photoPublicId) {
        await cloudinary.uploader.destroy(item.photoPublicId).catch(() => {});
      }
      item.photoUrl = req.file.path;
      item.photoPublicId = req.file.filename;
    }

    await item.save();
    res.json({ item });
  });

  // ---- ACTIVAR/DESACTIVAR rápido ----
  router.patch('/:id/toggle', requireAdminAuth, async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'No encontrado.' });
    item.available = !item.available;
    await item.save();
    res.json({ item });
  });

  // ---- ELIMINAR ----
  router.delete('/:id', requireAdminAuth, async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'No encontrado.' });
    if (item.photoPublicId) {
      await cloudinary.uploader.destroy(item.photoPublicId).catch(() => {});
    }
    await item.deleteOne();
    res.json({ ok: true });
  });

  return router;
}

module.exports = { buildCrudRouter };
