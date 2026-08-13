const mongoose = require('mongoose');
const { DRIVER_STATUSES } = require('../utils/constants');

const driverSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    code: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String, lowercase: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },
    status: {
      type: String,
      enum: DRIVER_STATUSES,
      default: 'Offline',
      index: true,
    },
    zone: { type: String, default: 'Central' },
    deliveries: { type: Number, default: 0 },
    rating: { type: Number, default: 5, min: 0, max: 5 },
    onTimeRate: { type: Number, default: 95, min: 0, max: 100 },
    earnings: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      updatedAt: { type: Date },
    },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Driver', driverSchema);
