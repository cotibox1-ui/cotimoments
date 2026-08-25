const mongoose = require('mongoose');

// Documento único (singleton) con toda la configuración editable desde el
// Dashboard: ganancia, delivery, WhatsApp, pago, mensajes, datos del negocio.
const ConfigurationSchema = new mongoose.Schema(
  {
    singletonKey: { type: String, default: 'main', unique: true },

    business: {
      name: { type: String, default: 'Momentos Divertidos' },
      logoUrl: { type: String, default: '' },
      contactPhone: { type: String, default: '51975335798' },
      contactEmail: { type: String, default: '' },
    },

    whatsapp: {
      phoneNumber: { type: String, default: '51975335798' }, // formato: 51987654321
    },

    payment: {
      instructions: { type: String, default: '' }, // ej. "Yape/Plin al 987654321 - Juan Pérez"
      accountData: { type: String, default: '' },
    },

    pricing: {
      profitPercentage: { type: Number, default: 100, min: 0 }, // % de ganancia sobre costo base
    },

    delivery: {
      cost: { type: Number, default: 10, min: 0 }, // S/ 10 por defecto
      freeLocationName: { type: String, default: 'Parque Alameda' },
    },

    messages: {
      welcomeTitle: { type: String, default: 'Prepárate para armar tu box' },
      welcomeSubtitle: {
        type: String,
        default:
          'Selecciona tus productos favoritos y personaliza cada detalle para crear un regalo único.',
      },
      welcomeButton: { type: String, default: 'COMENZAR A ARMAR MI BOX' },
    },

    referenceImageUrl: { type: String, default: '' }, // foto referencial general del box
  },
  { timestamps: true }
);

// Garantiza que solo exista un documento de configuración.
ConfigurationSchema.statics.getSingleton = async function () {
  let config = await this.findOne({ singletonKey: 'main' });
  if (!config) {
    config = await this.create({ singletonKey: 'main' });
  }
  return config;
};

module.exports = mongoose.model('Configuration', ConfigurationSchema);
