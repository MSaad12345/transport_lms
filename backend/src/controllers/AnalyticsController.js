const AnalyticsService = require('../services/AnalyticsService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

class AnalyticsController {
  overview = asyncHandler(async (req, res) => {
    const data = await AnalyticsService.overview();
    return ApiResponse.success(res, data);
  });

  ai = asyncHandler(async (req, res) => {
    const data = await AnalyticsService.aiInsights();
    return ApiResponse.success(res, data);
  });
}

module.exports = new AnalyticsController();
