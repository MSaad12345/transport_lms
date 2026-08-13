const Customer = require('../models/Customer');
const BaseService = require('./BaseService');

class CustomerService extends BaseService {
  constructor() {
    super(Customer, 'Customer');
  }

  async list(query = {}) {
    const filter = {};
    if (query.q) {
      filter.$or = [
        { name: new RegExp(query.q, 'i') },
        { email: new RegExp(query.q, 'i') },
        { phone: new RegExp(query.q, 'i') },
      ];
    }
    return this.findAll(filter, {
      page: query.page,
      limit: query.limit || 50,
      sort: '-lifetimeSpend',
    });
  }

  async upsertFromPayload(data) {
    if (data.email) {
      return Customer.findOneAndUpdate(
        { email: data.email.toLowerCase() },
        { $set: data },
        { upsert: true, new: true, runValidators: true }
      ).lean();
    }
    return this.create(data);
  }
}

module.exports = new CustomerService();
