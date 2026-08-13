const AuthService = require('../services/AuthService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

class AuthController {
  register = asyncHandler(async (req, res) => {
    const result = await AuthService.register(req.body);
    return ApiResponse.created(res, result, 'Registered successfully');
  });

  login = asyncHandler(async (req, res) => {
    const result = await AuthService.login(req.body);
    return ApiResponse.success(res, result, 'Logged in');
  });

  me = asyncHandler(async (req, res) => {
    const user = await AuthService.me(req.user._id);
    return ApiResponse.success(res, user);
  });

  listUsers = asyncHandler(async (req, res) => {
    const users = await AuthService.listUsers();
    return ApiResponse.success(res, users);
  });
}

module.exports = new AuthController();
