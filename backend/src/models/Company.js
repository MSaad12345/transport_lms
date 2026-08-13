const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    plan: {
      type: String,
      enum: ['Startup', 'Growth', 'Enterprise'],
      default: 'Growth',
    },
    branches: { type: Number, default: 1 },
    monthlyVolume: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Trial'],
      default: 'Active',
    },
    contactEmail: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
