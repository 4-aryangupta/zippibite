const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    res.json({ success: true, data: { cart: cart || null } });
  } catch (err) { next(err); }
};

// POST /api/cart/add
exports.addToCart = async (req, res, next) => {
  try {
    const { menuItemId, quantity = 1, forceReplace = false } = req.body;
    const item = await MenuItem.findById(menuItemId);
    if (!item || !item.isAvailable) return res.status(404).json({ success: false, message: 'Item not available' });

    const restaurant = await Restaurant.findById(item.restaurantId);

    let cart = await Cart.findOne({ userId: req.user._id });

    // Multi-restaurant conflict check
    if (cart && cart.restaurantId && cart.restaurantId.toString() !== item.restaurantId.toString()) {
      if (!forceReplace) {
        return res.status(409).json({
          success: false,
          message: 'cart_conflict',
          data: {
            currentRestaurantName: cart.restaurantName,
            newRestaurantName: restaurant.name,
          },
        });
      }
      // Clear cart and start fresh
      cart.items = [];
      cart.restaurantId = item.restaurantId;
      cart.restaurantName = restaurant.name;
    }

    if (!cart) {
      cart = new Cart({ userId: req.user._id, restaurantId: item.restaurantId, restaurantName: restaurant.name, items: [] });
    }

    const existing = cart.items.find(i => i.menuItemId.toString() === menuItemId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({
        menuItemId: item._id,
        quantity,
        name: item.name,
        price: item.price,
        image: item.image,
        isVeg: item.isVeg,
      });
    }

    await cart.save();
    res.json({ success: true, data: { cart } });
  } catch (err) { next(err); }
};

// PUT /api/cart/update
exports.updateCart = async (req, res, next) => {
  try {
    const { menuItemId, quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.menuItemId.toString() !== menuItemId);
    } else {
      const item = cart.items.find(i => i.menuItemId.toString() === menuItemId);
      if (item) item.quantity = quantity;
    }

    if (cart.items.length === 0) {
      cart.restaurantId = null;
      cart.restaurantName = '';
    }

    await cart.save();
    res.json({ success: true, data: { cart } });
  } catch (err) { next(err); }
};

// DELETE /api/cart/clear
exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { items: [], restaurantId: null, restaurantName: '' },
      { new: true }
    );
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) { next(err); }
};
