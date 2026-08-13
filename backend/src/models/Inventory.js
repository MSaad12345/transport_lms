const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true, uppercase: true },
    product: { type: String, required: true },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
      index: true,
    },
    bin: { type: String, default: 'A-01' },
    stock: { type: Number, default: 0, min: 0 },
    reorderLevel: { type: Number, default: 50 },
    unitPrice: { type: Number, default: 0 },
  },
  { timestamps: true }
);

inventorySchema.virtual('isLow').get(function isLow() {
  return this.stock < this.reorderLevel;
});

inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Inventory', inventorySchema);
