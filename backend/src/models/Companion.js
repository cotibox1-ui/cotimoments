const mongoose = require('mongoose');

const CompanionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // ej. "Ramo de rosas", "Peluche"
    description: { type: String, default: '' },
    photoUrl: { type: String, default: '' },
    photoPublicId: { type: String, default: '' },
    cost: { type: Number, required: true, min: 0 },
    category: { type: String, default: 'general' },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Companion', CompanionSchema);
