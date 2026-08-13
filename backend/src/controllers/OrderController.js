const OrderService = require('../services/OrderService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

class OrderController {
  list = asyncHandler(async (req, res) => {
    const result = await OrderService.list(req.query, req.user);
    return ApiResponse.success(res, result.items, 'Orders fetched', 200, result.meta);
  });

  get = asyncHandler(async (req, res) => {
    const order = await OrderService.findById(req.params.id, 'driverId warehouseId customerId');
    return ApiResponse.success(res, order);
  });

  create = asyncHandler(async (req, res) => {
    const order = await OrderService.createOrder(req.body, req.user);
    return ApiResponse.created(res, order, 'Order created');
  });

  advance = asyncHandler(async (req, res) => {
    const order = await OrderService.advanceStatus(req.params.id, req.user, req.body?.note);
    return ApiResponse.success(res, order, 'Status advanced');
  });

  assign = asyncHandler(async (req, res) => {
    const order = await OrderService.assignDriver(req.params.id, req.body.driverId, req.user);
    return ApiResponse.success(res, order, 'Driver assigned');
  });

  autoAssign = asyncHandler(async (req, res) => {
    const order = await OrderService.autoAssign(req.params.id, req.user);
    return ApiResponse.success(res, order, 'Driver auto-assigned');
  });

  autoAssignAll = asyncHandler(async (req, res) => {
    const orders = await OrderService.autoAssignAll(req.user, Number(req.body?.limit || 10));
    return ApiResponse.success(res, orders, `Auto-assigned ${orders.length} orders`);
  });

  dashboard = asyncHandler(async (req, res) => {
    const stats = await OrderService.getDashboardStats(req.user);
    return ApiResponse.success(res, stats);
  });
}

module.exports = new OrderController();
