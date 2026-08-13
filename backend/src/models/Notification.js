const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    event: { type: String, required: true },
    channel: {
      type: String,
      enum: ['Email', 'SMS', 'Push', 'WhatsApp', 'In-App'],
      default: 'In-App',
    },
    message: { type: String, required: true },
    orderNumber: { type: String },
    customerName: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    isRead: { type: Boolean, default: false, index: true },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
