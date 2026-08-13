const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    city: { type: String, required: true },
    capacity: { type: Number, required: true, min: 0 },
    used: { type: Number, default: 0, min: 0 },
    staff: { type: Number, default: 0 },
    dispatchQueue: { type: Number, default: 0 },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

warehouseSchema.virtual('utilization').get(function utilization() {
  if (!this.capacity) return 0;
  return Math.round((this.used / this.capacity) * 100);
});

warehouseSchema.set('toJSON', { virtuals: true });
warehouseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Warehouse', warehouseSchema);
