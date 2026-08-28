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

// En producción, solo se permite el dominio configurado en FRONTEND_URL.
// En desarrollo local (NODE_ENV distinto de "production"), se permite
// cualquier origen — incluyendo archivos locales (file://) y localhost en
// cualquier puerto — para no bloquearte mientras pruebas en tu máquina.
const isProduction = process.env.NODE_ENV === 'production';
app.use(
  cors({
    origin: isProduction ? process.env.FRONTEND_URL : true,
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
