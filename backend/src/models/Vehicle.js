const mongoose = require('mongoose');
const { VEHICLE_STATUSES } = require('../utils/constants');

const vehicleSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    plate: { type: String, required: true, unique: true, uppercase: true },
    type: {
      type: String,
      enum: ['Van', 'Truck', 'Motorbike', 'Cargo Van', 'Refrigerated Truck'],
      default: 'Van',
    },
    status: {
      type: String,
      enum: VEHICLE_STATUSES,
      default: 'Available',
      index: true,
    },
    fuel: { type: Number, default: 100, min: 0, max: 100 },
    health: { type: Number, default: 100, min: 0, max: 100 },
    odometer: { type: Number, default: 0 },
    insuranceExp: { type: Date },
    nextService: { type: Date },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
