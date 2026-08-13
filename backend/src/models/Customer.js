const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' },
    city: { type: String, required: true },
    zone: { type: String },
    line1: { type: String },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true, trim: true, index: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
    addresses: [addressSchema],
    loyaltyPoints: { type: Number, default: 0 },
    tier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold'],
      default: 'Bronze',
    },
    notes: { type: String },
    totalOrders: { type: Number, default: 0 },
    lifetimeSpend: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', customerSchema);
