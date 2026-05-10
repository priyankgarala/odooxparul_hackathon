const cities = require('../data/cities');

// @desc    Search cities
// @route   GET /api/cities
// @access  Private
const getCities = (req, res) => {
  const { q = '', country = '', region = '', sort = 'popularity' } = req.query;
  const normalizedQuery = q.trim().toLowerCase();

  const results = cities
    .filter((city) => {
      const matchesQuery = [city.name, city.country, city.region, city.bestFor]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery);
      const matchesCountry = !country || city.country === country;
      const matchesRegion = !region || city.region === region;

      return matchesQuery && matchesCountry && matchesRegion;
    })
    .sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'cost') return a.costIndex - b.costIndex;
      return b.popularity - a.popularity;
    });

  res.status(200).json({
    cities: results,
    countries: [...new Set(cities.map((city) => city.country))],
    regions: [...new Set(cities.map((city) => city.region))],
  });
};

module.exports = {
  getCities,
};
