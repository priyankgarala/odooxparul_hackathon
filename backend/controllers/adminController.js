const { pool } = require('../config/db');

const getAdminStats = async (req, res) => {
  try {
    const [usersResult, tripsResult, postsResult] = await Promise.all([
      pool.query('SELECT id, first_name, last_name, email, country, is_admin, created_at FROM users ORDER BY created_at DESC'),
      pool.query('SELECT * FROM trips ORDER BY created_at DESC'),
      pool.query('SELECT * FROM community_posts ORDER BY created_at DESC'),
    ]);

    const users = usersResult.rows;
    const trips = tripsResult.rows;
    const posts = postsResult.rows;
    const cityCounts = {};
    const activityCounts = {};
    const monthlyTrips = {};

    trips.forEach((trip) => {
      const month = new Date(trip.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyTrips[month] = (monthlyTrips[month] || 0) + 1;

      (trip.cities || []).forEach((city) => {
        cityCounts[city.name] = (cityCounts[city.name] || 0) + 1;
      });

      (trip.sections || []).forEach((section) => {
        const key = section.description?.split(' ').slice(0, 4).join(' ') || 'Unnamed activity';
        activityCounts[key] = (activityCounts[key] || 0) + 1;
      });
    });

    const topCities = Object.entries(cityCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);
    const topActivities = Object.entries(activityCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);
    const tripTrend = Object.entries(monthlyTrips).map(([label, count]) => ({ label, count }));

    res.status(200).json({
      totals: {
        users: users.length,
        trips: trips.length,
        publicTrips: trips.filter((trip) => trip.is_public).length,
        communityPosts: posts.length,
        notes: trips.reduce((total, trip) => total + ((trip.notes || []).length), 0),
      },
      users: users.map((user) => ({
        _id: user.id,
        name: `${user.first_name} ${user.last_name}`.trim(),
        email: user.email,
        country: user.country,
        isAdmin: user.is_admin,
        createdAt: user.created_at,
        trips: trips.filter((trip) => trip.user_id === user.id).length,
      })),
      trips: trips.map((trip) => ({
        _id: trip.id,
        title: trip.title,
        country: trip.country,
        cities: (trip.cities || []).length,
        activities: (trip.sections || []).length,
        isPublic: trip.is_public,
        createdAt: trip.created_at,
      })),
      topCities,
      topActivities,
      tripTrend,
      engagement: [
        { label: 'Trips', count: trips.length },
        { label: 'Public shares', count: trips.filter((trip) => trip.is_public).length },
        { label: 'Community posts', count: posts.length },
        { label: 'Journal notes', count: trips.reduce((total, trip) => total + ((trip.notes || []).length), 0) },
      ],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserAdmin = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE users SET is_admin = $1, updated_at = NOW() WHERE id = $2 RETURNING id, first_name, last_name, email, country, is_admin, created_at',
      [Boolean(req.body.isAdmin), req.params.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];
    res.status(200).json({
      _id: user.id,
      name: `${user.first_name} ${user.last_name}`.trim(),
      email: user.email,
      country: user.country,
      isAdmin: user.is_admin,
      createdAt: user.created_at,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdminStats,
  updateUserAdmin,
};
