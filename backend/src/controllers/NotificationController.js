const NotificationService = require('../services/NotificationService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

class NotificationController {
  list = asyncHandler(async (req, res) => {
    const result = await NotificationService.listForUser(req.user._id, req.query);
    return ApiResponse.success(res, result.items, 'Notifications fetched', 200, result.meta);
  });

  markAllRead = asyncHandler(async (req, res) => {
    const data = await NotificationService.markAllRead(req.user._id);
    return ApiResponse.success(res, data, 'All marked as read');
  });

  unread = asyncHandler(async (req, res) => {
    const count = await NotificationService.unreadCount(req.user._id);
    return ApiResponse.success(res, { count });
  });
}

module.exports = new NotificationController();
