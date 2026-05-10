const express = require('express');
const router = express.Router();
const { getCities } = require('../controllers/cityController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getCities);

module.exports = router;
