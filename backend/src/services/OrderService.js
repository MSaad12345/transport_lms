const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Driver = require('../models/Driver');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');
const BaseService = require('./BaseService');
const AppError = require('../utils/AppError');
const { ORDER_STATUS_FLOW, ROLES } = require('../utils/constants');

class OrderService extends BaseService {
  constructor() {
    super(Order, 'Order');
  }

  async nextOrderNumber() {
    const count = await Order.countDocuments();
    return `ORD-${10000 + count + 1}`;
  }

  async list(query = {}, user) {
    const {
      page = 1,
      limit = 20,
      status,
      filter,
      q,
      sort = '-createdAt',
    } = query;

    const mongoFilter = {};

    if (user.role === ROLES.CUSTOMER) {
      mongoFilter.customerName = user.name;
    }
    if (user.role === ROLES.DRIVER) {
      const driver = await Driver.findOne({ userId: user._id });
      if (driver) mongoFilter.driverId = driver._id;
      else mongoFilter.driverId = null;
    }

    if (status && status !== 'All') mongoFilter.status = status;

    if (filter && filter !== 'All') {
      const groups = {
        Active: ['Driver Assigned', 'Picked Up', 'In Transit', 'Out for Delivery'],
        Pending: [
          'Draft',
          'Pending',
          'Confirmed',
          'Warehouse Received',
          'Packing',
          'Ready for Dispatch',
        ],
        Delivered: ['Delivered'],
        Issues: ['Failed', 'Returned', 'Cancelled'],
      };
      if (groups[filter]) mongoFilter.status = { $in: groups[filter] };
    }

    if (q) {
      mongoFilter.$or = [
        { orderNumber: new RegExp(q, 'i') },
        { customerName: new RegExp(q, 'i') },
        { product: new RegExp(q, 'i') },
        { pickupCity: new RegExp(q, 'i') },
        { dropoffCity: new RegExp(q, 'i') },
      ];
    }

    return this.findAll(mongoFilter, {
      page,
      limit,
      sort,
      populate: 'driverId warehouseId customerId',
    });
  }

  async createOrder(payload, user) {
    let customer = null;
    if (payload.customerId) {
      customer = await Customer.findById(payload.customerId);
    }
    if (!customer) {
      customer = await Customer.findOneAndUpdate(
        { name: payload.customerName },
        {
          $setOnInsert: {
            name: payload.customerName,
            email: payload.customerEmail,
            phone: payload.phone,
            tier: 'Bronze',
          },
        },
        { upsert: true, new: true }
      );
    }

    const orderNumber = await this.nextOrderNumber();
    const etaHours = payload.priority === 'Same-Day' ? 6 : payload.priority === 'Express' ? 18 : 36;

    const order = await Order.create({
      orderNumber,
      customerId: customer._id,
      customerName: customer.name,
      product: payload.product,
      items: payload.items || 1,
      weightKg: payload.weightKg || 1,
      priority: payload.priority || 'Standard',
      status: 'Pending',
      pickupCity: payload.pickupCity,
      dropoffCity: payload.dropoffCity,
      zone: payload.zone || 'Central',
      instructions: payload.instructions,
      warehouseId: payload.warehouseId || null,
      amount: payload.amount,
      paymentMethod: payload.paymentMethod || 'Card',
      isPaid: payload.paymentMethod !== 'Cash on Delivery' ? false : false,
      eta: new Date(Date.now() + etaHours * 3600 * 1000),
      statusHistory: [{ status: 'Pending', note: 'Order created', by: user._id }],
      createdBy: user._id,
    });

    await Customer.findByIdAndUpdate(customer._id, {
      $inc: { totalOrders: 1 },
    });

    await Notification.create({
      event: 'Order Created',
      channel: 'In-App',
      message: `Order ${orderNumber} created for ${customer.name}`,
      orderNumber,
      customerName: customer.name,
      userId: user._id,
    });

    return order.toObject();
  }

  async advanceStatus(orderId, user, note) {
    const order = await Order.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);

    const allowed = ORDER_STATUS_FLOW[order.status] || [];
    // Prefer next progressive status if available
    const preferredOrder = [
      'Confirmed',
      'Warehouse Received',
      'Packing',
      'Ready for Dispatch',
      'Driver Assigned',
      'Picked Up',
      'In Transit',
      'Out for Delivery',
      'Delivered',
    ];
    let next = preferredOrder.find((s) => allowed.includes(s));
    if (!next && allowed.length) next = allowed[0];
    if (!next) throw new AppError(`Cannot advance from status "${order.status}"`, 400);

    order.status = next;
    order.statusHistory.push({
      status: next,
      note: note || `Advanced by ${user.name}`,
      by: user._id,
    });

    if (next === 'Delivered') {
      order.isPaid = true;
      order.deliveredAt = new Date();
      await this.ensureInvoice(order);
      await Customer.findByIdAndUpdate(order.customerId, {
        $inc: { lifetimeSpend: order.amount },
      });
    }

    await order.save();

    await Notification.create({
      event: `Status: ${next}`,
      channel: 'Push',
      message: `${order.orderNumber} is now ${next}`,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      userId: user._id,
    });

    return order.toObject();
  }

  async assignDriver(orderId, driverId, user, auto = false) {
    const order = await Order.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);

    const driver = await Driver.findById(driverId);
    if (!driver) throw new AppError('Driver not found', 404);

    order.driverId = driver._id;
    order.status = 'Driver Assigned';
    order.statusHistory.push({
      status: 'Driver Assigned',
      note: auto
        ? `AI auto-assigned ${driver.name}`
        : `Assigned ${driver.name} by ${user.name}`,
      by: user._id,
    });
    await order.save();

    if (driver.status === 'Available' || driver.status === 'Offline') {
      driver.status = 'On Delivery';
      await driver.save();
    }

    await Notification.create({
      event: 'Driver Assigned',
      channel: 'SMS',
      message: `${driver.name} assigned to ${order.orderNumber}`,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      userId: user._id,
    });

    return order.populate('driverId');
  }

  async autoAssign(orderId, user) {
    const order = await Order.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);

    const driver = await Driver.findOne({
      status: { $in: ['Available', 'On Break'] },
      zone: order.zone,
    }).sort({ onTimeRate: -1, rating: -1 });

    const fallback =
      driver ||
      (await Driver.findOne({ status: { $ne: 'Offline' } }).sort({
        onTimeRate: -1,
      }));

    if (!fallback) throw new AppError('No available drivers', 409);
    return this.assignDriver(orderId, fallback._id, user, true);
  }

  async autoAssignAll(user, limit = 10) {
    const unassigned = await Order.find({
      driverId: null,
      status: {
        $in: [
          'Pending',
          'Confirmed',
          'Warehouse Received',
          'Packing',
          'Ready for Dispatch',
        ],
      },
    })
      .sort({ priority: -1, createdAt: 1 })
      .limit(limit);

    const results = [];
    for (const o of unassigned) {
      try {
        const updated = await this.autoAssign(o._id, user);
        results.push(updated);
      } catch {
        // skip if no driver
      }
    }
    return results;
  }

  async ensureInvoice(order) {
    const existing = await Invoice.findOne({ orderId: order._id });
    if (existing) return existing;

    const count = await Invoice.countDocuments();
    const tax = +(order.amount * 0.08).toFixed(2);
    return Invoice.create({
      invoiceNumber: `INV-${5000 + count + 1}`,
      orderId: order._id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      amount: order.amount,
      tax,
      total: +(order.amount + tax).toFixed(2),
      status: 'Paid',
      method: order.paymentMethod,
      paidAt: new Date(),
    });
  }

  async getDashboardStats(user) {
    const base = {};
    if (user.role === ROLES.CUSTOMER) base.customerName = user.name;

    const [
      total,
      delivered,
      active,
      pending,
      failed,
      revenueAgg,
    ] = await Promise.all([
      Order.countDocuments(base),
      Order.countDocuments({ ...base, status: 'Delivered' }),
      Order.countDocuments({
        ...base,
        status: { $in: ['Driver Assigned', 'Picked Up', 'In Transit', 'Out for Delivery'] },
      }),
      Order.countDocuments({
        ...base,
        status: {
          $in: [
            'Pending',
            'Confirmed',
            'Warehouse Received',
            'Packing',
            'Ready for Dispatch',
          ],
        },
      }),
      Order.countDocuments({ ...base, status: 'Failed' }),
      Invoice.aggregate([
        { $match: { status: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    const recent = await Order.find(base)
      .sort('-createdAt')
      .limit(8)
      .populate('driverId', 'name code')
      .lean();

    // last 7 days volume
    const since = new Date();
    since.setDate(since.getDate() - 6);
    since.setHours(0, 0, 0, 0);
    const volume = await Order.aggregate([
      { $match: { createdAt: { $gte: since }, ...base } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      kpis: {
        totalOrders: total,
        delivered,
        activeDeliveries: active,
        pending,
        failed,
        revenue: revenueAgg[0]?.total || 0,
      },
      recentOrders: recent,
      volume,
    };
  }
}

module.exports = new OrderService();
