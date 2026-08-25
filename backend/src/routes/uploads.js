const express = require('express');
const { upload } = require('../config/cloudinary');
const { requireAdminAuth } = require('../middleware/auth');

const router = express.Router();

// Subida genérica protegida (fotos referenciales de propuestas, etc.)
router.post('/', requireAdminAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo.' });
  res.json({ url: req.file.path, publicId: req.file.filename });
});

// Subida pública SOLO para comprobantes de pago del cliente — sin auth,
// pero limitada a este único propósito y con tamaño acotado por multer.
router.post('/receipt', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo.' });
  res.json({ url: req.file.path, publicId: req.file.filename });
});

module.exports = router;
