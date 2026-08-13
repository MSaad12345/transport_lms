const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ROLE_PERMISSIONS } = require('../utils/constants');

class AuthMiddleware {
  authenticate = asyncHandler(async (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    req.user = user;
    next();
  });

  authorize(...roles) {
    return (req, res, next) => {
      if (!req.user) return next(new AppError('Authentication required', 401));
      if (roles.length && !roles.includes(req.user.role) && req.user.role !== 'admin') {
        return next(new AppError('Forbidden: insufficient role', 403));
      }
      return next();
    };
  }

  requirePermission(...permissions) {
    return (req, res, next) => {
      if (!req.user) return next(new AppError('Authentication required', 401));
      if (req.user.role === 'admin') return next();

      const granted = ROLE_PERMISSIONS[req.user.role] || [];
      const ok = permissions.every(
        (p) => granted.includes('*') || granted.includes(p)
      );
      if (!ok) return next(new AppError('Forbidden: missing permission', 403));
      return next();
    };
  }
}

module.exports = new AuthMiddleware();
