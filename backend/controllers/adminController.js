const User = require('../models/User');
const Trip = require('../models/Trip');
const CommunityPost = require('../models/CommunityPost');

const getAdminStats = async (req, res) => {
  try {
    const [users, trips, posts] = await Promise.all([
      User.find({}).select('-password').sort({ createdAt: -1 }),
      Trip.find({}).sort({ createdAt: -1 }),
      CommunityPost.find({}).sort({ createdAt: -1 }),
    ]);

    const cityCounts = {};
    const activityCounts = {};
    const monthlyTrips = {};

    trips.forEach((trip) => {
      const month = new Date(trip.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyTrips[month] = (monthlyTrips[month] || 0) + 1;

      trip.cities?.forEach((city) => {
        cityCounts[city.name] = (cityCounts[city.name] || 0) + 1;
      });

      trip.sections?.forEach((section) => {
        const key = section.description?.split(' ').slice(0, 4).join(' ') || 'Unnamed activity';
        activityCounts[key] = (activityCounts[key] || 0) + 1;
      });
    });

    const topCities = Object.entries(cityCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const topActivities = Object.entries(activityCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const tripTrend = Object.entries(monthlyTrips).map(([label, count]) => ({ label, count }));

    res.status(200).json({
      totals: {
        users: users.length,
        trips: trips.length,
        publicTrips: trips.filter((trip) => trip.isPublic).length,
        communityPosts: posts.length,
        notes: trips.reduce((total, trip) => total + (trip.notes?.length || 0), 0),
      },
      users: users.map((user) => ({
        _id: user._id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        country: user.country,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        trips: trips.filter((trip) => trip.userId.toString() === user._id.toString()).length,
      })),
      trips: trips.map((trip) => ({
        _id: trip._id,
        title: trip.title,
        country: trip.country,
        cities: trip.cities?.length || 0,
        activities: trip.sections?.length || 0,
        isPublic: trip.isPublic,
        createdAt: trip.createdAt,
      })),
      topCities,
      topActivities,
      tripTrend,
      engagement: [
        { label: 'Trips', count: trips.length },
        { label: 'Public shares', count: trips.filter((trip) => trip.isPublic).length },
        { label: 'Community posts', count: posts.length },
        { label: 'Journal notes', count: trips.reduce((total, trip) => total + (trip.notes?.length || 0), 0) },
      ],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isAdmin = Boolean(req.body.isAdmin);
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      country: user.country,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdminStats,
  updateUserAdmin,
};
