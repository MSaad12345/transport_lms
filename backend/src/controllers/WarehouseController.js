const WarehouseService = require('../services/WarehouseService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

class WarehouseController {
  list = asyncHandler(async (req, res) => {
    const items = await WarehouseService.listWarehouses();
    return ApiResponse.success(res, items);
  });

  inventory = asyncHandler(async (req, res) => {
    const items = await WarehouseService.listInventory(req.query);
    return ApiResponse.success(res, items);
  });

  adjustStock = asyncHandler(async (req, res) => {
    const result = await WarehouseService.adjustStock(
      req.params.id,
      req.body.delta,
      req.body.reason
    );
    return ApiResponse.success(res, result, 'Stock updated');
  });

  transfer = asyncHandler(async (req, res) => {
    const result = await WarehouseService.transferStock(req.body);
    return ApiResponse.success(res, result, 'Stock transferred');
  });
}

module.exports = new WarehouseController();
