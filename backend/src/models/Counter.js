const mongoose = require('mongoose');

// Contador atómico simple para generar números de pedido correlativos
// sin colisiones incluso con pedidos concurrentes.
const CounterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', CounterSchema);

async function getNextOrderNumber() {
  const counter = await Counter.findOneAndUpdate(
    { key: 'orderNumber' },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return `BOX-${String(counter.value).padStart(6, '0')}`;
}

module.exports = { Counter, getNextOrderNumber };
