require('dotenv').config();
const database = require('../config/database');
const User = require('../models/User');
const Company = require('../models/Company');
const Customer = require('../models/Customer');
const Warehouse = require('../models/Warehouse');
const Inventory = require('../models/Inventory');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Order = require('../models/Order');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');

const CITIES = [
  { city: 'Downtown', zone: 'Central' },
  { city: 'Riverside', zone: 'West' },
  { city: 'Northgate', zone: 'North' },
  { city: 'Eastwood', zone: 'East' },
  { city: 'Harborview', zone: 'South' },
  { city: 'Midvale', zone: 'Central' },
  { city: 'Greenfield', zone: 'West' },
  { city: 'Lakeshore', zone: 'North' },
];

const PRODUCTS = [
  'Wireless Earbuds',
  'Office Chair',
  'LED Monitor',
  'Protein Powder',
  'Running Shoes',
  'Ceramic Cookware',
  'Yoga Mat',
  'Bluetooth Speaker',
  'Cotton Bedsheet',
  'Coffee Beans 1kg',
  'Vitamin Pack',
  'Desk Lamp',
  'Mechanical Keyboard',
  'Water Bottle',
  'Backpack',
];

const CUSTOMER_NAMES = [
  'Aisha Khan',
  'John Delgado',
  'Mei Lin',
  'Carlos Rivera',
  'Fatima Noor',
  'Liam OBrien',
  'Sofia Rossi',
  'David Park',
  'Nadia Haddad',
  'Ethan Wright',
  'Yuki Tanaka',
  'Grace Owusu',
  'Ahmed Aziz',
  'Hana Kim',
  'Tom Becker',
];

const STATUSES = [
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

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

async function runSeed(options = {}) {
  const doReset = options.reset ?? false;
  const shouldConnect = options.connect !== false;

  if (shouldConnect) {
    await database.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lms');
    if (database.usingMemory) {
      console.warn('[SEED] Using in-memory MongoDB — start mongod for persistent data.');
    }
  }

  if (doReset) {
    console.log('[SEED] Resetting collections…');
    await Promise.all([
      User.deleteMany({}),
      Company.deleteMany({}),
      Customer.deleteMany({}),
      Warehouse.deleteMany({}),
      Inventory.deleteMany({}),
      Vehicle.deleteMany({}),
      Driver.deleteMany({}),
      Order.deleteMany({}),
      Invoice.deleteMany({}),
      Notification.deleteMany({}),
    ]);
  }

  console.log('[SEED] Creating companies…');
  const companies = await Company.insertMany([
    { name: 'Swift Courier Co', slug: 'swift-courier', plan: 'Enterprise', branches: 12, monthlyVolume: 85000, status: 'Active', contactEmail: 'ops@swift.example' },
    { name: 'MegaMart E-com', slug: 'megamart', plan: 'Growth', branches: 6, monthlyVolume: 42000, status: 'Active', contactEmail: 'logistics@megamart.example' },
    { name: 'PharmaRoute', slug: 'pharmaroute', plan: 'Growth', branches: 4, monthlyVolume: 18000, status: 'Active', contactEmail: 'ops@pharmaroute.example' },
  ]);

  console.log('[SEED] Creating users…');
  const demoUsers = [
    { name: 'Sara Malik', email: 'admin@lms.io', password: 'Password123!', role: 'admin', phone: '+1 202 555 0101' },
    { name: 'Daniel Cho', email: 'manager@lms.io', password: 'Password123!', role: 'business', phone: '+1 202 555 0102' },
    { name: 'Priya Nair', email: 'dispatch@lms.io', password: 'Password123!', role: 'dispatcher', phone: '+1 202 555 0103' },
    { name: 'Omar Farooq', email: 'warehouse@lms.io', password: 'Password123!', role: 'warehouse', phone: '+1 202 555 0104' },
    { name: 'Lena Vogel', email: 'finance@lms.io', password: 'Password123!', role: 'finance', phone: '+1 202 555 0105' },
    { name: 'Marcus Reid', email: 'driver@lms.io', password: 'Password123!', role: 'driver', phone: '+1 202 555 0106' },
    { name: 'Aisha Khan', email: 'customer@lms.io', password: 'Password123!', role: 'customer', phone: '+1 202 555 0107' },
  ];

  const users = [];
  for (const u of demoUsers) {
    let user = await User.findOne({ email: u.email });
    if (!user) {
      user = await User.create({ ...u, companyId: companies[0]._id });
    }
    users.push(user);
  }

  console.log('[SEED] Creating warehouses…');
  const warehouseData = [
    { code: 'WH-001', name: 'Central Hub', city: 'Downtown', capacity: 12000, used: 8640, staff: 24, dispatchQueue: 46 },
    { code: 'WH-002', name: 'West Depot', city: 'Riverside', capacity: 8000, used: 5120, staff: 15, dispatchQueue: 28 },
    { code: 'WH-003', name: 'North Fulfillment', city: 'Northgate', capacity: 15000, used: 11400, staff: 31, dispatchQueue: 63 },
    { code: 'WH-004', name: 'Harbor Cold Store', city: 'Harborview', capacity: 6000, used: 4080, staff: 18, dispatchQueue: 19 },
  ];
  const warehouses = [];
  for (const w of warehouseData) {
    let doc = await Warehouse.findOne({ code: w.code });
    if (!doc) doc = await Warehouse.create({ ...w, companyId: companies[0]._id });
    warehouses.push(doc);
  }

  console.log('[SEED] Creating inventory…');
  const invCount = await Inventory.countDocuments();
  if (invCount === 0) {
    await Inventory.insertMany(
      PRODUCTS.map((p, i) => {
        const stock = randInt(20, 900);
        return {
          sku: `SKU-${String(i + 1).padStart(2, '0')}${randInt(10, 99)}`,
          product: p,
          warehouseId: rand(warehouses)._id,
          bin: `B${randInt(1, 9)}-${randInt(10, 40)}`,
          stock,
          reorderLevel: 120,
          unitPrice: randInt(10, 250),
        };
      })
    );
  }

  console.log('[SEED] Creating vehicles…');
  const types = ['Van', 'Truck', 'Motorbike', 'Cargo Van', 'Refrigerated Truck'];
  const vehicles = [];
  for (let i = 0; i < 10; i++) {
    const code = `VEH-${String(i + 1).padStart(2, '0')}`;
    let v = await Vehicle.findOne({ code });
    if (!v) {
      v = await Vehicle.create({
        code,
        plate: `${['LMS', 'CTX', 'FLT', 'RDX'][i % 4]}-${randInt(1000, 9999)}`,
        type: types[i % types.length],
        status: rand(['Available', 'On Route', 'On Route', 'Maintenance', 'Available']),
        fuel: randInt(18, 96),
        health: randInt(62, 99),
        odometer: randInt(12000, 190000),
        insuranceExp: new Date(2026, randInt(7, 11), randInt(1, 28)),
        nextService: new Date(2026, randInt(7, 8), randInt(1, 28)),
        companyId: companies[0]._id,
      });
    }
    vehicles.push(v);
  }

  console.log('[SEED] Creating drivers…');
  const driverNames = [
    ['Marcus', 'Reid'],
    ['Aliyah', 'Hassan'],
    ['Diego', 'Santos'],
    ['Wei', 'Chen'],
    ['Ravi', 'Kumar'],
    ['Elena', 'Petrova'],
    ['Kofi', 'Mensah'],
    ['Sana', 'Iqbal'],
    ['Luca', 'Ferrari'],
    ['Bilal', 'Ahmed'],
  ];
  const drivers = [];
  for (let i = 0; i < 10; i++) {
    const code = `DRV-${String(i + 1).padStart(2, '0')}`;
    let d = await Driver.findOne({ code });
    if (!d) {
      d = await Driver.create({
        code,
        name: `${driverNames[i][0]} ${driverNames[i][1]}`,
        phone: `+1 202 555 0${String(randInt(10, 99)).padStart(2, '0')}`,
        email: `${driverNames[i][0].toLowerCase()}@lms.io`,
        vehicleId: vehicles[i % vehicles.length]._id,
        status: rand(['Available', 'On Delivery', 'On Delivery', 'Offline', 'On Break']),
        zone: rand(CITIES).zone,
        deliveries: randInt(120, 1450),
        rating: Math.min(5, +(4 + Math.random()).toFixed(1)),
        onTimeRate: randInt(88, 99),
        earnings: randInt(1800, 7200),
        verified: Math.random() > 0.15,
        location: {
          lat: 30 + Math.random() * 40,
          lng: 20 + Math.random() * 55,
          updatedAt: new Date(),
        },
        userId: i === 0 ? users.find((u) => u.role === 'driver')?._id : null,
        companyId: companies[0]._id,
      });
    }
    drivers.push(d);
  }

  console.log('[SEED] Creating customers…');
  const customers = [];
  for (const name of CUSTOMER_NAMES) {
    let c = await Customer.findOne({ name });
    if (!c) {
      const city = rand(CITIES);
      c = await Customer.create({
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@mail.example`,
        phone: `+1 202 555 ${randInt(1000, 9999)}`,
        addresses: [{ label: 'Primary', city: city.city, zone: city.zone, line1: `${randInt(10, 900)} Main St`, isDefault: true }],
        loyaltyPoints: randInt(50, 1800),
        tier: rand(['Bronze', 'Silver', 'Gold']),
        userId: name === 'Aisha Khan' ? users.find((u) => u.role === 'customer')?._id : null,
        companyId: companies[0]._id,
      });
    }
    customers.push(c);
  }

  console.log('[SEED] Creating orders…');
  const orderCount = await Order.countDocuments();
  if (orderCount < 40) {
    const toCreate = 50 - orderCount;
    for (let i = 0; i < toCreate; i++) {
      const customer = rand(customers);
      const pickup = rand(CITIES);
      const drop = rand(CITIES);
      const status = rand(STATUSES);
      const needsDriver = !['Draft', 'Pending', 'Confirmed', 'Warehouse Received', 'Packing', 'Ready for Dispatch', 'Cancelled'].includes(status);
      const amount = randInt(15, 320);
      const paymentMethod = rand(['Card', 'Wallet', 'Cash on Delivery']);
      const created = new Date(Date.now() - randInt(0, 20) * 86400000 - randInt(0, 86400) * 1000);
      const orderNumber = `ORD-${10000 + orderCount + i + 1}`;

      const order = await Order.create({
        orderNumber,
        customerId: customer._id,
        customerName: customer.name,
        product: rand(PRODUCTS),
        items: randInt(1, 4),
        weightKg: +(Math.random() * 12 + 0.5).toFixed(1),
        priority: rand(['Standard', 'Express', 'Same-Day', 'Standard', 'Express']),
        status,
        pickupCity: pickup.city,
        dropoffCity: drop.city,
        zone: drop.zone,
        warehouseId: rand(warehouses)._id,
        driverId: needsDriver ? rand(drivers)._id : null,
        amount,
        paymentMethod,
        isPaid: status === 'Delivered' ? true : paymentMethod === 'Cash on Delivery' ? false : Math.random() > 0.3,
        eta: new Date(created.getTime() + randInt(2, 48) * 3600000),
        rating: status === 'Delivered' ? randInt(3, 5) : null,
        deliveredAt: status === 'Delivered' ? new Date(created.getTime() + randInt(4, 40) * 3600000) : null,
        statusHistory: [{ status, note: 'Seeded', at: created }],
        companyId: companies[0]._id,
        createdBy: users[0]._id,
        createdAt: created,
        updatedAt: created,
      });

      if (status === 'Delivered' || order.isPaid) {
        const tax = +(amount * 0.08).toFixed(2);
        await Invoice.create({
          invoiceNumber: `INV-${5000 + (await Invoice.countDocuments()) + 1}`,
          orderId: order._id,
          orderNumber,
          customerName: customer.name,
          amount,
          tax,
          total: +(amount + tax).toFixed(2),
          status: order.isPaid ? 'Paid' : rand(['Pending', 'Overdue']),
          method: paymentMethod,
          issuedAt: created,
          paidAt: order.isPaid ? created : null,
          companyId: companies[0]._id,
        });
      }

      await Customer.findByIdAndUpdate(customer._id, {
        $inc: {
          totalOrders: 1,
          lifetimeSpend: order.isPaid ? amount : 0,
        },
      });
    }
  }

  console.log('[SEED] Creating notifications…');
  const nCount = await Notification.countDocuments();
  if (nCount === 0) {
    const events = [
      ['Order Created', 'In-App'],
      ['Driver Assigned', 'Push'],
      ['Pickup Started', 'SMS'],
      ['Delivery Started', 'Push'],
      ['ETA Updated', 'WhatsApp'],
      ['Delivery Completed', 'Email'],
      ['Payment Received', 'Email'],
      ['Invoice Generated', 'Email'],
    ];
    const sampleOrders = await Order.find().limit(14).sort('-createdAt');
    await Notification.insertMany(
      sampleOrders.map((o, i) => {
        const [event, channel] = events[i % events.length];
        return {
          event,
          channel,
          message: `${event} for ${o.orderNumber}`,
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          userId: users[0]._id,
          isRead: i > 4,
          createdAt: new Date(Date.now() - i * randInt(4, 90) * 60000),
        };
      })
    );
  }

  console.log('\n[SEED] Done.\n');
  console.log('Demo logins (password for all: Password123!)');
  demoUsers.forEach((u) => console.log(`  ${u.role.padEnd(12)} ${u.email}`));
  console.log('');
}

module.exports = runSeed;
