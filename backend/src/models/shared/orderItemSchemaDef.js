// Definición de sub-schema compartida (no un modelo, solo el objeto de
// definición) para evitar duplicar la forma de "producto snapshot" entre
// Order.js y Proposal.js.
const OrderItemSchemaDef = {
  productId: { type: require('mongoose').Schema.Types.ObjectId },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitCostAtOrder: { type: Number, required: true },
  totalCost: { type: Number, required: true },
};

module.exports = { OrderItemSchemaDef };
