const mongoose = require('mongoose');

const DecorationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // ej. "Cintas", "Lazos", "Tarjeta"
    description: { type: String, default: '' },
    photoUrl: { type: String, default: '' },
    photoPublicId: { type: String, default: '' },
    cost: { type: Number, required: true, min: 0 },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Decoration', DecorationSchema);
