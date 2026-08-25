const mongoose = require('mongoose');
const { OrderItemSchemaDef } = require('./shared/orderItemSchemaDef');

// Una propuesta es un box armado por el ADMINISTRADOR (no por el cliente)
// que se comparte mediante un link público /propuesta/:publicId.
// El cliente solo revisa, elige delivery, pone sus datos y confirma:
// no vuelve a armar nada.
const ProposalSchema = new mongoose.Schema(
  {
    publicId: { type: String, required: true, unique: true }, // ej. "ABC123", usado en la URL

    products: [OrderItemSchemaDef],
    companions: [OrderItemSchemaDef],

    box: {
      boxId: { type: mongoose.Schema.Types.ObjectId },
      name: { type: String, required: true },
      costAtProposal: { type: Number, required: true },
    },

    decorations: [
      {
        decorationId: { type: mongoose.Schema.Types.ObjectId },
        name: String,
        costAtProposal: Number,
        _id: false,
      },
    ],

    customization: {
      theme: { type: String, default: '' },
      predominantColors: { type: String, default: '' },
      hasDedication: { type: Boolean, default: false },
      dedicationText: { type: String, default: '' },
      cardStyleDescription: { type: String, default: '' },
    },

    // Precio ya calculado al crear la propuesta (con el % de ganancia vigente
    // en ese momento). El backend lo vuelve a validar al confirmar el pedido.
    pricing: {
      baseCost: { type: Number, required: true },
      profitPercentageAtProposal: { type: Number, required: true },
      profitAmount: { type: Number, required: true },
      boxPrice: { type: Number, required: true },
    },

    referenceImageUrl: { type: String, default: '' },

    status: { type: String, enum: ['ACTIVA', 'CONVERTIDA', 'EXPIRADA'], default: 'ACTIVA' },
    convertedOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Proposal', ProposalSchema);
