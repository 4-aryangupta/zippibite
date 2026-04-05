const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

// GET /api/restaurants
exports.getRestaurants = async (req, res, next) => {
  try {
    const { cuisine, q, sponsored } = req.query;
    const filter = { isActive: true };
    if (cuisine && cuisine !== 'all') filter.cuisine = { $regex: cuisine, $options: 'i' };
    if (q) filter.name = { $regex: q, $options: 'i' };
    if (sponsored === 'true') filter.isSponsored = true;

    const restaurants = await Restaurant.find(filter).sort({ isSponsored: -1, rating: -1 });
    res.json({ success: true, data: { restaurants } });
  } catch (err) { next(err); }
};

// GET /api/restaurants/:id
exports.getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    res.json({ success: true, data: { restaurant } });
  } catch (err) { next(err); }
};

// GET /api/restaurants/:id/menu
exports.getMenu = async (req, res, next) => {
  try {
    const items = await MenuItem.find({ restaurantId: req.params.id, isAvailable: true })
      .sort({ sortOrder: 1, isBestseller: -1 });
    // Group by category
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
    res.json({ success: true, data: { menu: grouped, items } });
  } catch (err) { next(err); }
};
