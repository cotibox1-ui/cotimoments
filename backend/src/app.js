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

// En producción, se permite el dominio configurado en FRONTEND_URL (tu web
// en Vercel) MÁS los orígenes fijos que usa la APK generada con Capacitor
// — el WebView de Android sirve la app bajo "https://localhost" (por el
// androidScheme configurado en capacitor.config.json), que es un origen
// completamente distinto al de la web y por eso necesita su propia
// autorización explícita. Sin esto, la APK puede compilar bien pero cada
// petición al backend queda bloqueada por CORS silenciosamente.
// En desarrollo local (NODE_ENV distinto de "production"), se permite
// cualquier origen — incluyendo archivos locales (file://) y localhost en
// cualquier puerto — para no bloquearte mientras pruebas en tu máquina.
const isProduction = process.env.NODE_ENV === 'production';
const APK_ORIGINS = ['https://localhost', 'capacitor://localhost', 'http://localhost'];
app.use(
  cors({
    origin: isProduction
      ? (origin, callback) => {
          // Algunas peticiones desde la APK no envían header Origin en
          // absoluto — se permiten también, ya que no hay forma de
          // validarlas por origen y bloquearlas rompería la app nativa.
          if (!origin || origin === process.env.FRONTEND_URL || APK_ORIGINS.includes(origin)) {
            return callback(null, true);
          }
          return callback(new Error('Origen no permitido por CORS.'));
        }
      : true,
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
