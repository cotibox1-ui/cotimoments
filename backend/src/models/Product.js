const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    photoUrl: { type: String, default: '' },
    photoPublicId: { type: String, default: '' }, // id de Cloudinary, para poder borrar la imagen
    cost: { type: Number, required: true, min: 0 }, // costo interno (nunca se muestra al cliente)
    category: { type: String, default: 'general' },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);
