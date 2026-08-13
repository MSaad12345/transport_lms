const mongoose = require('mongoose');
const {
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PRIORITIES,
} = require('../utils/constants');

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String },
    at: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    customerName: { type: String, required: true },
    product: { type: String, required: true },
    items: { type: Number, default: 1, min: 1 },
    weightKg: { type: Number, default: 1 },
    priority: { type: String, enum: PRIORITIES, default: 'Standard' },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'Pending',
      index: true,
    },
    pickupCity: { type: String, required: true },
    dropoffCity: { type: String, required: true },
    zone: { type: String, default: 'Central' },
    instructions: { type: String },
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null, index: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, default: 'Card' },
    isPaid: { type: Boolean, default: false },
    eta: { type: Date },
    deliveredAt: { type: Date },
    rating: { type: Number, min: 1, max: 5 },
    statusHistory: [statusHistorySchema],
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ customerName: 'text', product: 'text', orderNumber: 'text' });

module.exports = mongoose.model('Order', orderSchema);
