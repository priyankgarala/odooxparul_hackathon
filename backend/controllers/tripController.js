const Trip = require('../models/Trip');
const cities = require('../data/cities');

// @desc    Get trips
// @route   GET /api/trips
// @access  Private
const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check for user ownership or if trip is public
    if (trip.userId.toString() !== req.user.id && !trip.isPublic) {
      return res.status(401).json({ message: 'User not authorized to access this trip' });
    }

    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get public shared trip
// @route   GET /api/trips/public/:shareId
// @access  Public
const getPublicTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ shareId: req.params.shareId, isPublic: true });

    if (!trip) {
      return res.status(404).json({ message: 'Public itinerary not found' });
    }

    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a trip
// @route   POST /api/trips
// @access  Private
const createTrip = async (req, res) => {
  try {
    const { title, description, country, startDate, endDate, coverImage, isPublic, sections, cities } = req.body;

    if (!title || !country || !startDate) {
      return res.status(400).json({ message: 'Please add all required fields (title, country, startDate)' });
    }

    const trip = await Trip.create({
      userId: req.user.id,
      title,
      description,
      country,
      startDate,
      endDate,
      coverImage,
      isPublic,
      sections: sections || [],
      cities: cities || [],
    });

    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOwnedTrip = async (tripId, userId) => {
  const trip = await Trip.findById(tripId);

  if (!trip) {
    return { error: { status: 404, message: 'Trip not found' } };
  }

  if (trip.userId.toString() !== userId) {
    return { error: { status: 401, message: 'User not authorized to update this trip' } };
  }

  return { trip };
};

// @desc    Make trip public and return share id
// @route   POST /api/trips/:id/share
// @access  Private
const shareTrip = async (req, res) => {
  try {
    const { trip, error } = await getOwnedTrip(req.params.id, req.user.id);

    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    trip.isPublic = true;
    await trip.save();

    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Copy a public trip to the current user
// @route   POST /api/trips/public/:shareId/copy
// @access  Private
const copyPublicTrip = async (req, res) => {
  try {
    const sourceTrip = await Trip.findOne({ shareId: req.params.shareId, isPublic: true });

    if (!sourceTrip) {
      return res.status(404).json({ message: 'Public itinerary not found' });
    }

    const copiedTrip = await Trip.create({
      userId: req.user.id,
      title: `${sourceTrip.title} Copy`,
      description: sourceTrip.description,
      country: sourceTrip.country,
      startDate: sourceTrip.startDate,
      endDate: sourceTrip.endDate,
      coverImage: sourceTrip.coverImage,
      sections: sourceTrip.sections,
      cities: sourceTrip.cities,
      packingChecklist: sourceTrip.packingChecklist,
      isPublic: false,
    });

    res.status(201).json(copiedTrip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a city to a trip
// @route   POST /api/trips/:id/cities
// @access  Private
const addCityToTrip = async (req, res) => {
  try {
    const { cityId } = req.body;
    const { trip, error } = await getOwnedTrip(req.params.id, req.user.id);

    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const city = cities.find((item) => item.id === cityId);

    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }

    if (trip.country && city.country !== trip.country) {
      return res.status(400).json({ message: `Only cities in ${trip.country} can be added to this trip` });
    }

    const alreadyAdded = trip.cities.some((item) => item.cityId === city.id);

    if (!alreadyAdded) {
      trip.cities.push({ ...city, cityId: city.id });
      await trip.save();
    }

    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a city from a trip
// @route   DELETE /api/trips/:id/cities/:cityId
// @access  Private
const removeCityFromTrip = async (req, res) => {
  try {
    const { trip, error } = await getOwnedTrip(req.params.id, req.user.id);

    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    trip.cities = trip.cities.filter((city) => city.cityId !== req.params.cityId);
    await trip.save();

    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a trip
// @route   PUT /api/trips/:id
// @access  Private
const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check for user
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Make sure the logged in user matches the trip user
    if (trip.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to update this trip' });
    }

    const updatedTrip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedTrip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a trip
// @route   DELETE /api/trips/:id
// @access  Private
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check for user
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Make sure the logged in user matches the trip user
    if (trip.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to delete this trip' });
    }

    await trip.deleteOne();

    res.status(200).json({ id: req.params.id, message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
