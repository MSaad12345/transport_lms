const FinanceService = require('../services/FinanceService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

class FinanceController {
  list = asyncHandler(async (req, res) => {
    const result = await FinanceService.listInvoices(req.query);
    return ApiResponse.success(res, result.items, 'Invoices fetched', 200, result.meta);
  });

  summary = asyncHandler(async (req, res) => {
    const data = await FinanceService.summary();
    return ApiResponse.success(res, data);
  });
}

module.exports = new FinanceController();
