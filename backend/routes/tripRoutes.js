const express = require('express');
const router = express.Router();
const {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  addCityToTrip,
  removeCityFromTrip,
} = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');

// Protect all trip routes
router.use(protect);

router.route('/')
  .get(getTrips)
  .post(createTrip);

router.route('/:id')
  .get(getTripById)
  .put(updateTrip)
  .delete(deleteTrip);

router.post('/:id/cities', addCityToTrip);
router.delete('/:id/cities/:cityId', removeCityFromTrip);

module.exports = router;
