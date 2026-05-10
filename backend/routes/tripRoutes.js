const express = require('express');
const router = express.Router();
const {
  getTrips,
  getTripById,
  getPublicTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  addCityToTrip,
  removeCityFromTrip,
  shareTrip,
  copyPublicTrip,
} = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');

router.get('/public/:shareId', getPublicTrip);

// Protect all trip routes
router.use(protect);

router.post('/public/:shareId/copy', copyPublicTrip);

router.route('/')
  .get(getTrips)
  .post(createTrip);

router.route('/:id')
  .get(getTripById)
  .put(updateTrip)
  .delete(deleteTrip);

router.post('/:id/cities', addCityToTrip);
router.delete('/:id/cities/:cityId', removeCityFromTrip);
router.post('/:id/share', shareTrip);

module.exports = router;
