const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

class AuthService {
  signToken(user) {
    return jwt.sign(
      { sub: user._id.toString(), role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  async register({ name, email, password, role, phone }) {
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) throw new AppError('Email already registered', 409);

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer',
      phone,
    });

    const token = this.signToken(user);
    return { user: user.toSafeJSON(), token };
  }

  async login({ email, password }) {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) throw new AppError('Invalid email or password', 401);

    const ok = await user.comparePassword(password);
    if (!ok) throw new AppError('Invalid email or password', 401);

    if (!user.isActive) throw new AppError('Account is inactive', 403);

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = this.signToken(user);
    return { user: user.toSafeJSON(), token };
  }

  async me(userId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return user.toSafeJSON();
  }

  async listUsers(filter = {}) {
    const users = await User.find(filter).sort('name');
    return users.map((u) => u.toSafeJSON());
  }
}

module.exports = new AuthService();
