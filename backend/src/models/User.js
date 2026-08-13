const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ALL_ROLES, ROLES } = require('../utils/constants');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ALL_ROLES,
      default: ROLES.CUSTOMER,
      index: true,
    },
    phone: { type: String, trim: true },
    avatar: { type: String },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    phone: this.phone,
    avatar: this.avatar,
    companyId: this.companyId,
    isActive: this.isActive,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('User', userSchema);
