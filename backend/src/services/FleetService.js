const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const BaseService = require('./BaseService');
const AppError = require('../utils/AppError');

class FleetService extends BaseService {
  constructor() {
    super(Vehicle, 'Vehicle');
  }

  async listVehicles(query = {}) {
    const filter = {};
    if (query.status) filter.status = query.status;
    return this.findAll(filter, {
      page: query.page,
      limit: query.limit || 50,
      sort: 'code',
    });
  }

  async listDrivers(query = {}) {
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.zone) filter.zone = query.zone;
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 50);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Driver.find(filter)
        .populate('vehicleId', 'code plate type')
        .sort('name')
        .skip(skip)
        .limit(limit)
        .lean(),
      Driver.countDocuments(filter),
    ]);
    return {
      items,
      meta: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    };
  }

  async updateDriverStatus(id, status) {
    const driver = await Driver.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).lean();
    if (!driver) throw new AppError('Driver not found', 404);
    return driver;
  }

  async updateDriverLocation(id, lat, lng) {
    const driver = await Driver.findByIdAndUpdate(
      id,
      { location: { lat, lng, updatedAt: new Date() } },
      { new: true }
    ).lean();
    if (!driver) throw new AppError('Driver not found', 404);
    return driver;
  }

  async liveTracking() {
    const drivers = await Driver.find({
      status: { $in: ['On Delivery', 'Available'] },
      'location.lat': { $ne: null },
    })
      .select('name code status zone location vehicleId')
      .populate('vehicleId', 'plate type')
      .lean();

    return drivers;
  }
}

module.exports = new FleetService();
