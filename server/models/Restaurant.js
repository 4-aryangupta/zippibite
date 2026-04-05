const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  cuisine: [{ type: String }],
  heroImage: { type: String, default: '' },
  logoImage: { type: String, default: '' },
  rating: { type: Number, default: 4.0, min: 1, max: 5 },
  deliveryTime: { type: String, default: '25-35 min' },
  minOrder: { type: Number, default: 149 },
  packagingCharge: { type: Number, default: 20 },
  deliveryFee: { type: Number, default: 30 },
  freeDeliveryAbove: { type: Number, default: 499 },
  isActive: { type: Boolean, default: true },
  isSponsored: { type: Boolean, default: false },
  reelVideoUrl: { type: String, default: '' },
  address: {
    fullAddress: { type: String, default: '' },
    city: { type: String, default: '' },
    pincode: { type: String, default: '' },
  },
  categories: [{ type: String }], // ordered list of menu categories
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
