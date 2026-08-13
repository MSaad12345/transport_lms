const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const Driver = require('../models/Driver');
const BaseService = require('./BaseService');

class FinanceService extends BaseService {
  constructor() {
    super(Invoice, 'Invoice');
  }

  async listInvoices(query = {}) {
    const filter = {};
    if (query.status) filter.status = query.status;
    return this.findAll(filter, {
      page: query.page,
      limit: query.limit || 50,
      sort: '-issuedAt',
    });
  }

  async summary() {
    const [paid, pending, overdue] = await Promise.all([
      Invoice.aggregate([
        { $match: { status: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
      Invoice.aggregate([
        { $match: { status: 'Pending' } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
      Invoice.aggregate([
        { $match: { status: 'Overdue' } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
    ]);

    const payouts = await Driver.aggregate([
      { $group: { _id: null, total: { $sum: '$earnings' } } },
    ]);

    const codPending = await Order.countDocuments({
      paymentMethod: 'Cash on Delivery',
      isPaid: false,
    });

    const methods = await Order.aggregate([
      { $group: { _id: '$paymentMethod', count: { $sum: 1 } } },
    ]);

    return {
      revenue: paid[0]?.total || 0,
      paidCount: paid[0]?.count || 0,
      outstanding: (pending[0]?.total || 0) + (overdue[0]?.total || 0),
      pendingCount: pending[0]?.count || 0,
      overdueCount: overdue[0]?.count || 0,
      driverPayouts: payouts[0]?.total || 0,
      codPending,
      paymentMethods: methods.map((m) => ({ method: m._id, count: m.count })),
    };
  }
}

module.exports = new FinanceService();
