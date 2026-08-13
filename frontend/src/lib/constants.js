export const ROLES = {
  admin: 'Super Administrator',
  business: 'Business Manager',
  dispatcher: 'Dispatcher',
  warehouse: 'Warehouse Staff',
  finance: 'Finance Manager',
  driver: 'Driver',
  customer: 'Customer',
};

export const DEMO_ACCOUNTS = [
  { role: 'admin', email: 'admin@lms.io', label: 'Admin' },
  { role: 'business', email: 'manager@lms.io', label: 'Business' },
  { role: 'dispatcher', email: 'dispatch@lms.io', label: 'Dispatcher' },
  { role: 'warehouse', email: 'warehouse@lms.io', label: 'Warehouse' },
  { role: 'finance', email: 'finance@lms.io', label: 'Finance' },
  { role: 'driver', email: 'driver@lms.io', label: 'Driver' },
  { role: 'customer', email: 'customer@lms.io', label: 'Customer' },
];

export const DEMO_PASSWORD = 'Password123!';

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', roles: '*' },
  { href: '/orders', label: 'Orders', icon: 'Package', roles: ['admin', 'business', 'dispatcher', 'warehouse', 'customer'] },
  { href: '/warehouse', label: 'Warehouse', icon: 'Warehouse', roles: ['admin', 'business', 'warehouse'] },
  { href: '/fleet', label: 'Fleet', icon: 'Truck', roles: ['admin', 'business', 'dispatcher'] },
  { href: '/drivers', label: 'Drivers', icon: 'Users', roles: ['admin', 'business', 'dispatcher'] },
  { href: '/tracking', label: 'GPS Tracking', icon: 'MapPin', roles: ['admin', 'business', 'dispatcher', 'customer', 'driver'] },
  { href: '/dispatch', label: 'Dispatcher', icon: 'Radio', roles: ['admin', 'dispatcher'] },
  { href: '/finance', label: 'Finance', icon: 'Wallet', roles: ['admin', 'business', 'finance'] },
  { href: '/analytics', label: 'Analytics', icon: 'BarChart3', roles: ['admin', 'business', 'finance'] },
  { href: '/customers', label: 'Customers', icon: 'Contact', roles: ['admin', 'business', 'dispatcher'] },
  { href: '/ai', label: 'AI Insights', icon: 'Sparkles', roles: ['admin', 'business', 'dispatcher'] },
  { href: '/notifications', label: 'Notifications', icon: 'Bell', roles: '*' },
  { href: '/admin', label: 'Administration', icon: 'Shield', roles: ['admin'] },
];

export const STATUS_COLORS = {
  Draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  Confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  'Warehouse Received': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  Packing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  'Ready for Dispatch': 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  'Driver Assigned': 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  'Picked Up': 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  'In Transit': 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  'Out for Delivery': 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  Delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  Failed: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  Returned: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  Cancelled: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

export function money(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
}

export function money2(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(n || 0));
}

export function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function initials(name = '') {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
