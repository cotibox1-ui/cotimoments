const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const AdminUser = require('../models/AdminUser');
const { requireAdminAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post(
  '/login',
  [body('email').isEmail(), body('password').isLength({ min: 6 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const admin = await AdminUser.findOne({ email: email.toLowerCase(), active: true });
    if (!admin) return res.status(401).json({ error: 'Credenciales inválidas.' });

    const valid = await admin.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas.' });

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '180d' }
    );

    res.json({
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  }
);

// GET /api/auth/me — verifica el token vigente
router.get('/me', requireAdminAuth, async (req, res) => {
  const admin = await AdminUser.findById(req.admin.id).select('-passwordHash');
  res.json({ admin });
});

// POST /api/auth/setup — crea el PRIMER usuario admin.
// Se autobloquea si ya existe algún admin, para que no quede una puerta
// abierta en producción.
router.post(
  '/setup',
  [body('name').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 })],
  async (req, res) => {
    const existing = await AdminUser.countDocuments();
    if (existing > 0) {
      return res.status(403).json({ error: 'Ya existe un administrador. Usa /login.' });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    const passwordHash = await AdminUser.hashPassword(password);
    const admin = await AdminUser.create({ name, email: email.toLowerCase(), passwordHash });

    res.status(201).json({ admin: { id: admin._id, name: admin.name, email: admin.email } });
  }
);

module.exports = router;
