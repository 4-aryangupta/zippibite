const User = require('../models/User');

// GET /api/user/addresses
exports.getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('savedAddresses');
    res.json({ success: true, data: { addresses: user.savedAddresses } });
  } catch (err) { next(err); }
};

// PUT /api/user/address
exports.addOrUpdateAddress = async (req, res, next) => {
  try {
    const { addressId, label, fullAddress, city, pincode, isDefault } = req.body;
    const user = await User.findById(req.user._id);

    if (addressId) {
      // Update existing
      const addr = user.savedAddresses.id(addressId);
      if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });
      if (label) addr.label = label;
      if (fullAddress) addr.fullAddress = fullAddress;
      if (city) addr.city = city;
      if (pincode) addr.pincode = pincode;
      if (isDefault !== undefined) addr.isDefault = isDefault;
    } else {
      // Add new
      if (isDefault) {
        user.savedAddresses.forEach(a => a.isDefault = false);
      }
      user.savedAddresses.push({ label, fullAddress, city, pincode, isDefault: isDefault || user.savedAddresses.length === 0 });
    }

    await user.save();
    res.json({ success: true, data: { addresses: user.savedAddresses } });
  } catch (err) { next(err); }
};

// DELETE /api/user/address/:id
exports.deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.savedAddresses = user.savedAddresses.filter(a => a._id.toString() !== req.params.id);
    await user.save();
    res.json({ success: true, data: { addresses: user.savedAddresses } });
  } catch (err) { next(err); }
};
