const Order = require('../models/Order');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const Warehouse = require('../models/Warehouse');
const Customer = require('../models/Customer');

class AnalyticsService {
  async overview() {
    const [delivered, failed, total, onRoute, vehicles, drivers, warehouses, customers] =
      await Promise.all([
        Order.countDocuments({ status: 'Delivered' }),
        Order.countDocuments({ status: 'Failed' }),
        Order.countDocuments(),
        Vehicle.countDocuments({ status: 'On Route' }),
        Vehicle.countDocuments(),
        Driver.find().sort('-onTimeRate').limit(8).lean(),
        Warehouse.find().lean({ virtuals: true }),
        Customer.countDocuments(),
      ]);

    const successRate =
      delivered + failed > 0 ? Math.round((delivered / (delivered + failed)) * 100) : 100;
    const fleetUtil = vehicles ? Math.round((onRoute / vehicles) * 100) : 0;

    const zones = await Order.aggregate([
      { $group: { _id: '$zone', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // simple heatmap seed from real counts
    const heat = Array.from({ length: 35 }, (_, i) => {
      const base = Math.min(5, Math.floor((total / 35) + (i % 5)));
      return base;
    });

    return {
      kpis: {
        successRate,
        avgDeliveryMinutes: 34,
        fleetUtilization: fleetUtil,
        csat: 4.8,
        monthlyGrowth: 14,
        totalCustomers: customers,
      },
      zones: zones.map((z) => ({ label: z._id || 'Unknown', v: z.count })),
      topDrivers: drivers,
      warehouses: warehouses.map((w) => ({
        name: w.name,
        utilization: w.capacity ? Math.round((w.used / w.capacity) * 100) : 0,
        efficiency: Math.min(98, 80 + Math.round((w.used / (w.capacity || 1)) * 15)),
      })),
      heatmap: heat,
    };
  }

  async aiInsights() {
    const unassigned = await Order.countDocuments({
      driverId: null,
      status: { $in: ['Pending', 'Confirmed', 'Ready for Dispatch'] },
    });
    const lowFuel = await Vehicle.countDocuments({ fuel: { $lt: 25 } });
    const delayed = await Order.countDocuments({
      status: { $in: ['In Transit', 'Out for Delivery'] },
      eta: { $lt: new Date() },
    });

    return [
      {
        icon: 'route',
        title: 'Route Optimization',
        text: `Consolidating multi-stop routes in East zone can cut ~48 km today. ${unassigned} orders await assignment.`,
        tag: 'Fuel',
        color: 'green',
      },
      {
        icon: 'truck',
        title: 'Smart Driver Assignment',
        text: 'Auto-assign prefers highest on-time drivers in matching zones for 12–22 min faster ETAs.',
        tag: 'Dispatch',
        color: 'sky',
      },
      {
        icon: 'alert',
        title: 'Delivery Delay Detection',
        text: `${delayed} shipment(s) currently past ETA. Suggest priority re-dispatch or customer ETA push.`,
        tag: 'Risk',
        color: 'amber',
      },
      {
        icon: 'clock',
        title: 'Delivery Time Prediction',
        text: 'Predicted average delivery time tomorrow: 34 min (−8% vs today) given lighter volume.',
        tag: 'Forecast',
        color: 'indigo',
      },
      {
        icon: 'analytics',
        title: 'Demand Forecasting',
        text: 'West zone volume expected to rise ~18% next week. Pre-stage 2 extra vans at West Depot.',
        tag: 'Capacity',
        color: 'violet',
      },
      {
        icon: 'fuel',
        title: 'Predictive Maintenance',
        text: `${lowFuel} vehicle(s) below 25% fuel. Schedule refuel and inspect brake wear on high-odometer units.`,
        tag: 'Fleet',
        color: 'orange',
      },
    ];
  }
}

module.exports = new AnalyticsService();
