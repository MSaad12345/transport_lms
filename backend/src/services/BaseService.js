const AppError = require('../utils/AppError');

class BaseService {
  constructor(model, resourceName = 'Resource') {
    this.model = model;
    this.resourceName = resourceName;
  }

  async findAll(filter = {}, options = {}) {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      populate = '',
      select = '',
    } = options;

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const query = this.model.find(filter);

    if (populate) query.populate(populate);
    if (select) query.select(select);

    const [items, total] = await Promise.all([
      query.sort(sort).skip(skip).limit(Number(limit)).lean({ virtuals: true }),
      this.model.countDocuments(filter),
    ]);

    return {
      items,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)) || 1,
      },
    };
  }

  async findById(id, populate = '') {
    let query = this.model.findById(id);
    if (populate) query = query.populate(populate);
    const doc = await query.lean({ virtuals: true });
    if (!doc) throw new AppError(`${this.resourceName} not found`, 404);
    return doc;
  }

  async create(data) {
    const doc = await this.model.create(data);
    return doc.toObject({ virtuals: true });
  }

  async updateById(id, data) {
    const doc = await this.model
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .lean({ virtuals: true });
    if (!doc) throw new AppError(`${this.resourceName} not found`, 404);
    return doc;
  }

  async deleteById(id) {
    const doc = await this.model.findByIdAndDelete(id).lean();
    if (!doc) throw new AppError(`${this.resourceName} not found`, 404);
    return doc;
  }
}

module.exports = BaseService;
