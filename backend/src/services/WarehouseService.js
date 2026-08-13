const Warehouse = require('../models/Warehouse');
const Inventory = require('../models/Inventory');
const BaseService = require('./BaseService');
const AppError = require('../utils/AppError');

class WarehouseService extends BaseService {
  constructor() {
    super(Warehouse, 'Warehouse');
  }

  async listWarehouses() {
    const items = await Warehouse.find({ isActive: true }).sort('name').lean({ virtuals: true });
    return items;
  }

  async listInventory(query = {}) {
    const filter = {};
    if (query.warehouseId) filter.warehouseId = query.warehouseId;
    if (query.low === 'true') {
      // stock < reorderLevel handled post-query for simplicity with virtual
    }
    const items = await Inventory.find(filter)
      .populate('warehouseId', 'code name city')
      .sort('product')
      .lean({ virtuals: true });

    if (query.low === 'true') return items.filter((i) => i.stock < i.reorderLevel);
    return items;
  }

  async adjustStock(id, delta, reason = 'adjustment') {
    const item = await Inventory.findById(id);
    if (!item) throw new AppError('Inventory item not found', 404);
    const next = item.stock + Number(delta);
    if (next < 0) throw new AppError('Insufficient stock', 400);
    item.stock = next;
    await item.save();
    return { item: item.toObject({ virtuals: true }), reason };
  }

  async transferStock({ fromId, toId, quantity }) {
    if (fromId === toId) throw new AppError('Cannot transfer to same SKU', 400);
    const qty = Number(quantity);
    if (qty <= 0) throw new AppError('Quantity must be positive', 400);

    const from = await Inventory.findById(fromId);
    const to = await Inventory.findById(toId);
    if (!from || !to) throw new AppError('Inventory item not found', 404);
    if (from.stock < qty) throw new AppError('Insufficient stock to transfer', 400);

    from.stock -= qty;
    to.stock += qty;
    await Promise.all([from.save(), to.save()]);
    return { from: from.toObject({ virtuals: true }), to: to.toObject({ virtuals: true }) };
  }
}

module.exports = new WarehouseService();
