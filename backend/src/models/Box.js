const mongoose = require('mongoose');

const BoxSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // ej. "Caja blanca de cartón"
    description: { type: String, default: '' },
    photoUrl: { type: String, default: '' },
    photoPublicId: { type: String, default: '' },
    cost: { type: Number, required: true, min: 0 },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Box', BoxSchema);
