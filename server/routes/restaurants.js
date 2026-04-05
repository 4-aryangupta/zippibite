const express = require('express');
const router = express.Router();
const { getRestaurants, getRestaurant, getMenu } = require('../controllers/restaurantController');

router.get('/', getRestaurants);
router.get('/:id', getRestaurant);
router.get('/:id/menu', getMenu);

module.exports = router;
