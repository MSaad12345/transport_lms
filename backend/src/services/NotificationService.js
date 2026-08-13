const Notification = require('../models/Notification');
const BaseService = require('./BaseService');

class NotificationService extends BaseService {
  constructor() {
    super(Notification, 'Notification');
  }

  async listForUser(userId, query = {}) {
    const filter = {};
    // show global + user-specific
    filter.$or = [{ userId: null }, { userId }];
    if (query.unread === 'true') filter.isRead = false;

    return this.findAll(filter, {
      page: query.page,
      limit: query.limit || 30,
      sort: '-createdAt',
    });
  }

  async markAllRead(userId) {
    await Notification.updateMany(
      { $or: [{ userId }, { userId: null }], isRead: false },
      { isRead: true }
    );
    return { ok: true };
  }

  async unreadCount(userId) {
    return Notification.countDocuments({
      $or: [{ userId }, { userId: null }],
      isRead: false,
    });
  }
}

module.exports = new NotificationService();
