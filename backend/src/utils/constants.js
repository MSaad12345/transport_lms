const ROLES = {
  ADMIN: 'admin',
  BUSINESS: 'business',
  DISPATCHER: 'dispatcher',
  WAREHOUSE: 'warehouse',
  FINANCE: 'finance',
  DRIVER: 'driver',
  CUSTOMER: 'customer',
};

const ALL_ROLES = Object.values(ROLES);

const ORDER_STATUSES = [
  'Draft',
  'Pending',
  'Confirmed',
  'Warehouse Received',
  'Packing',
  'Ready for Dispatch',
  'Driver Assigned',
  'Picked Up',
  'In Transit',
  'Out for Delivery',
  'Delivered',
  'Failed',
  'Returned',
  'Cancelled',
];

const ORDER_STATUS_FLOW = {
  Draft: ['Pending', 'Cancelled'],
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Warehouse Received', 'Cancelled'],
  'Warehouse Received': ['Packing', 'Cancelled'],
  Packing: ['Ready for Dispatch', 'Cancelled'],
  'Ready for Dispatch': ['Driver Assigned', 'Cancelled'],
  'Driver Assigned': ['Picked Up', 'Ready for Dispatch', 'Cancelled'],
  'Picked Up': ['In Transit', 'Failed'],
  'In Transit': ['Out for Delivery', 'Failed'],
  'Out for Delivery': ['Delivered', 'Failed'],
  Delivered: ['Returned'],
  Failed: ['Returned', 'Out for Delivery'],
  Returned: [],
  Cancelled: [],
};

const VEHICLE_STATUSES = ['Available', 'On Route', 'Maintenance', 'Out of Service'];
const DRIVER_STATUSES = ['Available', 'On Delivery', 'On Break', 'Offline'];
const PAYMENT_METHODS = ['Card', 'Wallet', 'Cash on Delivery'];
const INVOICE_STATUSES = ['Paid', 'Pending', 'Overdue', 'Refunded'];
const PRIORITIES = ['Standard', 'Express', 'Same-Day'];

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: ['*'],
  [ROLES.BUSINESS]: [
    'dashboard:read',
    'orders:read',
    'orders:write',
    'warehouse:read',
    'fleet:read',
    'drivers:read',
    'tracking:read',
    'finance:read',
    'analytics:read',
    'customers:read',
    'customers:write',
    'ai:read',
    'notifications:read',
  ],
  [ROLES.DISPATCHER]: [
    'dashboard:read',
    'orders:read',
    'orders:write',
    'orders:assign',
    'fleet:read',
    'drivers:read',
    'tracking:read',
    'dispatch:write',
    'customers:read',
    'ai:read',
    'notifications:read',
  ],
  [ROLES.WAREHOUSE]: [
    'dashboard:read',
    'orders:read',
    'orders:write',
    'warehouse:read',
    'warehouse:write',
    'notifications:read',
  ],
  [ROLES.FINANCE]: [
    'dashboard:read',
    'finance:read',
    'finance:write',
    'analytics:read',
    'notifications:read',
  ],
  [ROLES.DRIVER]: [
    'dashboard:read',
    'orders:read',
    'tracking:read',
    'notifications:read',
  ],
  [ROLES.CUSTOMER]: [
    'dashboard:read',
    'orders:read',
    'orders:write',
    'tracking:read',
    'notifications:read',
  ],
};

module.exports = {
  ROLES,
  ALL_ROLES,
  ORDER_STATUSES,
  ORDER_STATUS_FLOW,
  VEHICLE_STATUSES,
  DRIVER_STATUSES,
  PAYMENT_METHODS,
  INVOICE_STATUSES,
  PRIORITIES,
  ROLE_PERMISSIONS,
};
