const express = require('express');
const router = express.Router();
const { getAddresses, addOrUpdateAddress, deleteAddress } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/addresses', getAddresses);
router.put('/address', addOrUpdateAddress);
router.delete('/address/:id', deleteAddress);

module.exports = router;
