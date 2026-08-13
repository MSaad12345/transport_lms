const mongoose = require('mongoose');
const { INVOICE_STATUSES, PAYMENT_METHODS } = require('../utils/constants');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    orderNumber: { type: String, required: true },
    customerName: { type: String, required: true },
    amount: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, enum: INVOICE_STATUSES, default: 'Pending', index: true },
    method: { type: String, enum: PAYMENT_METHODS, default: 'Card' },
    issuedAt: { type: Date, default: Date.now },
    paidAt: { type: Date },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Invoice', invoiceSchema);
