const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate');
const auth = require('../middleware/authMiddleware');
const { ROLES, DRIVER_STATUSES, PRIORITIES, PAYMENT_METHODS } = require('../utils/constants');

const AuthController = require('../controllers/AuthController');
const OrderController = require('../controllers/OrderController');
const FleetController = require('../controllers/FleetController');
const WarehouseController = require('../controllers/WarehouseController');
const FinanceController = require('../controllers/FinanceController');
const AnalyticsController = require('../controllers/AnalyticsController');
const NotificationController = require('../controllers/NotificationController');
const CustomerController = require('../controllers/CustomerController');

const router = express.Router();

/* ---------- Auth ---------- */
router.post(
  '/auth/register',
  validate(
    z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(Object.values(ROLES)).optional(),
      phone: z.string().optional(),
    })
  ),
  AuthController.register
);

router.post(
  '/auth/login',
  validate(
    z.object({
      email: z.string().email(),
      password: z.string().min(1),
    })
  ),
  AuthController.login
);

router.get('/auth/me', auth.authenticate, AuthController.me);
router.get(
  '/admin/users',
  auth.authenticate,
  auth.authorize(ROLES.ADMIN),
  AuthController.listUsers
);

/* ---------- Dashboard ---------- */
router.get('/dashboard', auth.authenticate, OrderController.dashboard);

/* ---------- Orders ---------- */
router.get('/orders', auth.authenticate, auth.requirePermission('orders:read'), OrderController.list);
router.get('/orders/:id', auth.authenticate, auth.requirePermission('orders:read'), OrderController.get);
router.post(
  '/orders',
  auth.authenticate,
  auth.requirePermission('orders:write'),
  validate(
    z.object({
      customerName: z.string().min(2),
      customerEmail: z.string().email().optional(),
      phone: z.string().optional(),
      product: z.string().min(1),
      items: z.number().int().positive().optional(),
      weightKg: z.number().positive().optional(),
      priority: z.enum(PRIORITIES).optional(),
      pickupCity: z.string().min(1),
      dropoffCity: z.string().min(1),
      zone: z.string().optional(),
      instructions: z.string().optional(),
      warehouseId: z.string().optional(),
      amount: z.number().nonnegative(),
      paymentMethod: z.enum(PAYMENT_METHODS).optional(),
      customerId: z.string().optional(),
    })
  ),
  OrderController.create
);
router.post(
  '/orders/:id/advance',
  auth.authenticate,
  auth.requirePermission('orders:write'),
  OrderController.advance
);
router.post(
  '/orders/:id/assign',
  auth.authenticate,
  auth.requirePermission('orders:assign'),
  validate(z.object({ driverId: z.string().min(1) })),
  OrderController.assign
);
router.post(
  '/orders/:id/auto-assign',
  auth.authenticate,
  auth.requirePermission('orders:assign'),
  OrderController.autoAssign
);
router.post(
  '/dispatch/auto-assign',
  auth.authenticate,
  auth.requirePermission('dispatch:write'),
  OrderController.autoAssignAll
);

/* ---------- Fleet & Drivers ---------- */
router.get('/vehicles', auth.authenticate, auth.requirePermission('fleet:read'), FleetController.listVehicles);
router.post('/vehicles', auth.authenticate, auth.authorize(ROLES.ADMIN, ROLES.BUSINESS), FleetController.createVehicle);
router.patch('/vehicles/:id', auth.authenticate, auth.authorize(ROLES.ADMIN, ROLES.BUSINESS), FleetController.updateVehicle);

router.get('/drivers', auth.authenticate, auth.requirePermission('drivers:read'), FleetController.listDrivers);
router.post('/drivers', auth.authenticate, auth.authorize(ROLES.ADMIN, ROLES.BUSINESS), FleetController.createDriver);
router.patch(
  '/drivers/:id/status',
  auth.authenticate,
  validate(z.object({ status: z.enum(DRIVER_STATUSES) })),
  FleetController.updateDriverStatus
);
router.patch(
  '/drivers/:id/location',
  auth.authenticate,
  validate(z.object({ lat: z.number(), lng: z.number() })),
  FleetController.updateLocation
);
router.get('/tracking/live', auth.authenticate, auth.requirePermission('tracking:read'), FleetController.liveTracking);

/* ---------- Warehouse ---------- */
router.get('/warehouses', auth.authenticate, auth.requirePermission('warehouse:read'), WarehouseController.list);
router.get('/inventory', auth.authenticate, auth.requirePermission('warehouse:read'), WarehouseController.inventory);
router.post(
  '/inventory/:id/adjust',
  auth.authenticate,
  auth.requirePermission('warehouse:write'),
  validate(z.object({ delta: z.number(), reason: z.string().optional() })),
  WarehouseController.adjustStock
);
router.post(
  '/inventory/transfer',
  auth.authenticate,
  auth.requirePermission('warehouse:write'),
  validate(
    z.object({
      fromId: z.string(),
      toId: z.string(),
      quantity: z.number().positive(),
    })
  ),
  WarehouseController.transfer
);

/* ---------- Finance ---------- */
router.get('/invoices', auth.authenticate, auth.requirePermission('finance:read'), FinanceController.list);
router.get('/finance/summary', auth.authenticate, auth.requirePermission('finance:read'), FinanceController.summary);

/* ---------- Analytics & AI ---------- */
router.get('/analytics', auth.authenticate, auth.requirePermission('analytics:read'), AnalyticsController.overview);
router.get('/ai/insights', auth.authenticate, auth.requirePermission('ai:read'), AnalyticsController.ai);

/* ---------- Customers ---------- */
router.get('/customers', auth.authenticate, auth.requirePermission('customers:read'), CustomerController.list);
router.get('/customers/:id', auth.authenticate, auth.requirePermission('customers:read'), CustomerController.get);
router.post('/customers', auth.authenticate, auth.requirePermission('customers:write'), CustomerController.create);
router.patch('/customers/:id', auth.authenticate, auth.requirePermission('customers:write'), CustomerController.update);

/* ---------- Notifications ---------- */
router.get('/notifications', auth.authenticate, auth.requirePermission('notifications:read'), NotificationController.list);
router.get('/notifications/unread-count', auth.authenticate, NotificationController.unread);
router.post('/notifications/read-all', auth.authenticate, NotificationController.markAllRead);

/* ---------- Health ---------- */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'LMS API healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
