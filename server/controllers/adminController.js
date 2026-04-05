const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');

// GET /api/admin/orders
exports.getOrders = async (req, res, next) => {
  try {
    const { status, tab } = req.query;
    const filter = {};
    if (tab === 'active') filter.status = { $in: ['received', 'preparing', 'out_for_delivery'] };
    else if (tab === 'completed') filter.status = 'delivered';
    else if (tab === 'cancelled') filter.status = 'cancelled';
    else if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    // Include adminDeadline for admin view
    res.json({ success: true, data: { orders } });
  } catch (err) { next(err); }
};

// PUT /api/admin/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['received', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    if (req.body.cancellationReason) order.cancellationReason = req.body.cancellationReason;
    await order.save();

    // Notify customer via socket
    const io = req.app.get('io');
    if (io) io.to(`order-${order._id}`).emit('order-status-update', { orderId: order._id, status });

    res.json({ success: true, data: { order } });
  } catch (err) { next(err); }
};

// GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

    const [
      todayOrders,
      activeOrders,
      totalUsers,
      totalRestaurants,
      revenueToday,
      ordersPerHour,
    ] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
      Order.countDocuments({ status: { $in: ['received', 'preparing', 'out_for_delivery'] } }),
      User.countDocuments({ role: 'user' }),
      Restaurant.countDocuments({ isActive: true }),
      Order.aggregate([
        { $match: { createdAt: { $gte: todayStart }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: todayStart } } },
        { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
        { $sort: { '_id': 1 } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        todayOrders,
        activeOrders,
        totalUsers,
        totalRestaurants,
        revenueToday: revenueToday[0]?.total || 0,
        ordersPerHour: ordersPerHour.map(o => ({ hour: o._id, count: o.count })),
      },
    });
  } catch (err) { next(err); }
};

// PUT /api/admin/restaurants/:id
exports.updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    res.json({ success: true, data: { restaurant } });
  } catch (err) { next(err); }
};

// POST /api/admin/restaurants
exports.createRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json({ success: true, data: { restaurant } });
  } catch (err) { next(err); }
};

// GET /api/admin/menu-items
exports.getMenuItems = async (req, res, next) => {
  try {
    const { restaurantId } = req.query;
    const filter = restaurantId ? { restaurantId } : {};
    const items = await MenuItem.find(filter).sort({ category: 1, sortOrder: 1 });
    res.json({ success: true, data: { items } });
  } catch (err) { next(err); }
};

// POST /api/admin/menu-items
exports.createMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json({ success: true, data: { item } });
  } catch (err) { next(err); }
};

// PUT /api/admin/menu-items/:id
exports.updateMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: { item } });
  } catch (err) { next(err); }
};

// DELETE /api/admin/menu-items/:id
exports.deleteMenuItem = async (req, res, next) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) { next(err); }
};

// GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: { users } });
  } catch (err) { next(err); }
};

// PUT /api/admin/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role, isActive }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: { user } });
  } catch (err) { next(err); }
};
