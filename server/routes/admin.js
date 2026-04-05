const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const admin = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/orders', admin.getOrders);
router.put('/orders/:id/status', admin.updateOrderStatus);
router.get('/stats', admin.getStats);

router.get('/restaurants', require('../controllers/restaurantController').getRestaurants);
router.post('/restaurants', admin.createRestaurant);
router.put('/restaurants/:id', admin.updateRestaurant);

router.get('/menu-items', admin.getMenuItems);
router.post('/menu-items', admin.createMenuItem);
router.put('/menu-items/:id', admin.updateMenuItem);
router.delete('/menu-items/:id', admin.deleteMenuItem);

router.get('/users', admin.getUsers);
router.put('/users/:id', admin.updateUser);

module.exports = router;
