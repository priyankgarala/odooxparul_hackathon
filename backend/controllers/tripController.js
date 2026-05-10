const Trip = require('../models/Trip');

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

// @desc    Create a trip
// @route   POST /api/trips
// @access  Private
const createTrip = async (req, res) => {
  try {
    const { title, description, startDate, endDate, coverImage, isPublic, sections } = req.body;

    if (!title || !startDate) {
      return res.status(400).json({ message: 'Please add all required fields (title, startDate)' });
    }

    const trip = await Trip.create({
      userId: req.user.id,
      title,
      description,
      startDate,
      endDate,
      coverImage,
      isPublic,
      sections: sections || [],
    });

    res.status(201).json(trip);
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
  createTrip,
  updateTrip,
  deleteTrip,
};
