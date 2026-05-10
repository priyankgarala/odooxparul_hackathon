const express = require('express');
const router = express.Router();
const { getAdminStats, updateUserAdmin } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(admin);

router.get('/stats', getAdminStats);
router.put('/users/:id/admin', updateUserAdmin);

module.exports = router;
