const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name: String,
  image: String,
  price: Number,
  quantity: { type: Number, min: 1 },
  isVeg: Boolean,
}, { _id: false });

const statusTimelineSchema = new mongoose.Schema({
  status: String,
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  restaurantName: { type: String },
  items: [orderItemSchema],
  deliveryAddress: {
    label: String,
    fullAddress: String,
    city: String,
    pincode: String,
  },
  subtotal: { type: Number, required: true },
  packagingCharge: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['received', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'received',
  },
  statusTimeline: [statusTimelineSchema],
  // Internal admin field — NEVER exposed to user API
  adminDeadline: { type: Date },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'paid' },
  paymentMethod: { type: String, default: 'mock' },
  cancellationReason: { type: String, default: '' },
}, { timestamps: true });

// Add status to timeline on save
orderSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusTimeline.push({ status: this.status, timestamp: new Date() });
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
