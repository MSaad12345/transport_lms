const CustomerService = require('../services/CustomerService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

class CustomerController {
  list = asyncHandler(async (req, res) => {
    const result = await CustomerService.list(req.query);
    return ApiResponse.success(res, result.items, 'Customers fetched', 200, result.meta);
  });

  get = asyncHandler(async (req, res) => {
    const customer = await CustomerService.findById(req.params.id);
    return ApiResponse.success(res, customer);
  });

  create = asyncHandler(async (req, res) => {
    const customer = await CustomerService.upsertFromPayload(req.body);
    return ApiResponse.created(res, customer, 'Customer saved');
  });

  update = asyncHandler(async (req, res) => {
    const customer = await CustomerService.updateById(req.params.id, req.body);
    return ApiResponse.success(res, customer, 'Customer updated');
  });
}

module.exports = new CustomerController();
