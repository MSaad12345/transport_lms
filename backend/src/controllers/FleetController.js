const FleetService = require('../services/FleetService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

class FleetController {
  listVehicles = asyncHandler(async (req, res) => {
    const result = await FleetService.listVehicles(req.query);
    return ApiResponse.success(res, result.items, 'Vehicles fetched', 200, result.meta);
  });

  createVehicle = asyncHandler(async (req, res) => {
    const vehicle = await FleetService.create(req.body);
    return ApiResponse.created(res, vehicle, 'Vehicle registered');
  });

  updateVehicle = asyncHandler(async (req, res) => {
    const vehicle = await FleetService.updateById(req.params.id, req.body);
    return ApiResponse.success(res, vehicle, 'Vehicle updated');
  });

  listDrivers = asyncHandler(async (req, res) => {
    const result = await FleetService.listDrivers(req.query);
    return ApiResponse.success(res, result.items, 'Drivers fetched', 200, result.meta);
  });

  createDriver = asyncHandler(async (req, res) => {
    const Driver = require('../models/Driver');
    const driver = await Driver.create(req.body);
    return ApiResponse.created(res, driver, 'Driver created');
  });

  updateDriverStatus = asyncHandler(async (req, res) => {
    const driver = await FleetService.updateDriverStatus(req.params.id, req.body.status);
    return ApiResponse.success(res, driver, 'Driver status updated');
  });

  updateLocation = asyncHandler(async (req, res) => {
    const driver = await FleetService.updateDriverLocation(
      req.params.id,
      req.body.lat,
      req.body.lng
    );
    return ApiResponse.success(res, driver, 'Location updated');
  });

  liveTracking = asyncHandler(async (req, res) => {
    const data = await FleetService.liveTracking();
    return ApiResponse.success(res, data);
  });
}

module.exports = new FleetController();
