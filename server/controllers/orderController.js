const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Restaurant = require('../models/Restaurant');

const GST_RATE = 0.05;
const DELIVERY_FEE = 30;
const FREE_DELIVERY_ABOVE = 499;
const ADMIN_DEADLINE_MINUTES = 45;

// POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { deliveryAddress } = req.body;
    if (!deliveryAddress) return res.status(400).json({ success: false, message: 'Delivery address required' });

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || !cart.items.length) return res.status(400).json({ success: false, message: 'Cart is empty' });

    const restaurant = await Restaurant.findById(cart.restaurantId);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const packagingCharge = restaurant.packagingCharge || 0;
    const gstAmount = Math.round(subtotal * GST_RATE);
    const deliveryFee = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
    const totalAmount = subtotal + packagingCharge + gstAmount + deliveryFee;

    const adminDeadline = new Date(Date.now() + ADMIN_DEADLINE_MINUTES * 60 * 1000);

    const order = await Order.create({
      userId: req.user._id,
      restaurantId: cart.restaurantId,
      restaurantName: restaurant.name,
      items: cart.items.map(i => ({
        menuItemId: i.menuItemId,
        name: i.name,
        image: i.image,
        price: i.price,
        quantity: i.quantity,
        isVeg: i.isVeg,
      })),
      deliveryAddress,
      subtotal,
      packagingCharge,
      gstAmount,
      deliveryFee,
      totalAmount,
      status: 'received',
      statusTimeline: [{ status: 'received', timestamp: new Date() }],
      adminDeadline,
    });

    // Clear cart
    await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [], restaurantId: null, restaurantName: '' });

    // Notify admin room via socket
    const io = req.app.get('io');
    if (io) io.to('admin-room').emit('new-order', { orderId: order._id });

    res.status(201).json({ success: true, data: { order: _sanitizeOrder(order) } });
  } catch (err) { next(err); }
};

// GET /api/orders/my
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, data: { orders: orders.map(_sanitizeOrder) } });
  } catch (err) { next(err); }
};

// GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: { order: _sanitizeOrder(order) } });
  } catch (err) { next(err); }
};

// Strip adminDeadline from user-facing responses
function _sanitizeOrder(order) {
  const obj = order.toObject ? order.toObject() : { ...order };
  delete obj.adminDeadline;
  return obj;
}
