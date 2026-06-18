const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    salePrice: { type: Number, default: null },
    unit: { type: String, default: 'piece' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    image: { type: String, default: '' },
    tags: [{ type: String }],
    stock: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    isVisible: { type: Boolean, default: true },
    isJarProduct: { type: Boolean, default: false },
    depositAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ isAvailable: 1, isVisible: 1 });

module.exports = mongoose.model('Product', productSchema);
