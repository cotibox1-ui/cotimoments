/**
 * Ejecutar UNA VEZ con: node src/seed.js
 * Crea las cajas y productos de ejemplo mencionados en el spec, y la
 * configuración inicial (ganancia 100%, zonas de entrega de ejemplo).
 * No crea usuario admin: eso se hace con POST /api/auth/setup.
 */
require('dotenv').config();
const connectDB = require('./config/db');
const Box = require('./models/Box');
const Product = require('./models/Product');
const Companion = require('./models/Companion');
const Configuration = require('./models/Configuration');

const boxes = [
  { name: 'Caja blanca de cartón', cost: 8, description: 'Caja clásica de cartón blanco.' },
  { name: 'Bandeja', cost: 12, description: 'Bandeja decorativa.' },
  { name: 'Caja personalizada a mano', cost: 25, description: 'Caja hecha a mano según temática.' },
  { name: 'Arco de globos en bandeja', cost: 30, description: 'Presentación con arco de globos.' },
  { name: 'Globo burbuja transparente', cost: 35, description: 'Globo burbuja con contenido dentro.' },
];

const products = [
  { name: 'Yogurt', cost: 6, category: 'desayuno' },
  { name: 'Waffles', cost: 8, category: 'desayuno' },
  { name: 'Minitorta', cost: 15, category: 'postre' },
  { name: 'Alfajores', cost: 5, category: 'postre' },
  { name: 'Bowl de frutas', cost: 7, category: 'desayuno' },
  { name: 'Empanadas', cost: 6, category: 'salado' },
];

const companions = [
  { name: 'Ramo de rosas', cost: 20, category: 'regalo' },
  { name: 'Peluche', cost: 18, category: 'regalo' },
  { name: 'Hot Wheels', cost: 10, category: 'regalo' },
  { name: 'Chocolates', cost: 12, category: 'regalo' },
];

async function seed() {
  await connectDB();

  for (const b of boxes) {
    await Box.updateOne({ name: b.name }, { $setOnInsert: b }, { upsert: true });
  }
  for (const p of products) {
    await Product.updateOne({ name: p.name }, { $setOnInsert: p }, { upsert: true });
  }
  for (const c of companions) {
    await Companion.updateOne({ name: c.name }, { $setOnInsert: c }, { upsert: true });
  }

  await Configuration.getSingleton(); // crea el documento con defaults (ganancia 100%, zonas de entrega)

  console.log('✅ Seed completo: cajas, productos, acompañantes y configuración inicial creados.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
