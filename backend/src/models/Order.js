const mongoose = require('mongoose');

// Sub-documento reutilizado para productos y acompañantes: guarda el nombre
// y el costo AL MOMENTO DEL PEDIDO (snapshot), nunca una referencia que
// pueda cambiar después.
const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId }, // referencia informativa, no autoritativa
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitCostAtOrder: { type: Number, required: true },
    totalCost: { type: Number, required: true }, // unitCostAtOrder * quantity
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true }, // BOX-000001

    // ---- CLIENTE / ENTREGA ----
    fromName: { type: String, required: true }, // "De"
    toName: { type: String, required: true }, // "Para"
    contactPhone: { type: String, required: true },

    delivery: {
      wanted: { type: Boolean, default: false },
      address: { type: String, default: '' },
      freeLocationName: { type: String, default: 'Parque Alameda' },
      time: { type: String, default: '' },
      references: { type: String, default: '' },
    },

    // ---- PRODUCTOS Y ACOMPAÑANTES (snapshot) ----
    products: [OrderItemSchema],
    companions: [OrderItemSchema],

    // ---- CAJA (snapshot) ----
    box: {
      boxId: { type: mongoose.Schema.Types.ObjectId },
      name: { type: String, required: true },
      costAtOrder: { type: Number, required: true },
    },

    // ---- DECORACIÓN (snapshot) ----
    decorations: [
      {
        decorationId: { type: mongoose.Schema.Types.ObjectId },
        name: String,
        costAtOrder: Number,
        _id: false,
      },
    ],

    // ---- PERSONALIZACIÓN ----
    customization: {
      theme: { type: String, default: '' }, // "Cumpleaños de mi enamorada"
      predominantColors: { type: String, default: '' }, // "Rosado, blanco y dorado"
      hasDedication: { type: Boolean, default: false },
      dedicationText: { type: String, default: '' },
      cardStyleDescription: { type: String, default: '' },
    },

    // ---- PRECIO (snapshot obligatorio, sección 38) ----
    pricing: {
      baseCost: { type: Number, required: true },
      profitPercentageAtOrder: { type: Number, required: true },
      profitAmount: { type: Number, required: true },
      boxPrice: { type: Number, required: true }, // baseCost + profitAmount
      deliveryCostAtOrder: { type: Number, required: true, default: 0 },
      finalPrice: { type: Number, required: true }, // boxPrice + deliveryCostAtOrder
    },

    // ---- ORIGEN DEL PEDIDO ----
    proposalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal', default: null },

    // ---- ESTADOS (independientes entre sí) ----
    paymentStatus: {
      type: String,
      enum: ['PAGO_PENDIENTE', 'ADELANTO_50_CONFIRMADO', 'PAGO_COMPLETO_CONFIRMADO'],
      default: 'PAGO_PENDIENTE',
    },
    orderStatus: {
      type: String,
      enum: ['NUEVO', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'],
      default: 'NUEVO',
    },
    advanceAmount: { type: Number, default: 0 }, // 50% del total
    amountPaid: { type: Number, default: 0 },
    paymentReceiptUrl: { type: String, default: '' }, // comprobante subido, si aplica

    // ---- CHECKLIST DE PREPARACIÓN ----
    checklist: [
      {
        label: String,
        checked: { type: Boolean, default: false },
        _id: false,
      },
    ],

    referenceImageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
