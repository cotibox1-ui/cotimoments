const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const boxRoutes = require('./routes/boxes');
const decorationRoutes = require('./routes/decorations');
const companionRoutes = require('./routes/companions');
const configurationRoutes = require('./routes/configuration');
const orderRoutes = require('./routes/orders');
const orderPdfRoutes = require('./routes/pdf');
const proposalRoutes = require('./routes/proposals');
const uploadRoutes = require('./routes/uploads');

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/boxes', boxRoutes);
app.use('/api/decorations', decorationRoutes);
app.use('/api/companions', companionRoutes);
app.use('/api/configuration', configurationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/orders', orderPdfRoutes); // agrega GET /api/orders/:id/pdf
app.use('/api/proposals', proposalRoutes);
app.use('/api/uploads', uploadRoutes);

// Manejador de errores genérico (última red de seguridad)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({ error: err.message || 'Error interno del servidor.' });
});

module.exports = app;
