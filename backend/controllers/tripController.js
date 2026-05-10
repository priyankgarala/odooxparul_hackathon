const crypto = require('crypto');
const { pool } = require('../config/db');
const citiesCatalog = require('../data/cities');

const toTripResponse = (row) => ({
  _id: row.id,
  id: row.id,
  userId: row.user_id,
  title: row.title,
  description: row.description,
  country: row.country,
  startDate: row.start_date,
  endDate: row.end_date,
  coverImage: row.cover_image,
  isPublic: row.is_public,
  shareId: row.share_id,
  sections: row.sections || [],
  cities: row.cities || [],
  packingChecklist: row.packing_checklist || [],
  notes: row.notes || [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const getTripRow = async (id) => {
  const { rows } = await pool.query('SELECT * FROM trips WHERE id = $1', [id]);
  return rows[0];
};

const ensureShareId = () => `${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;

const getTrips = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM trips WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.status(200).json(rows.map(toTripResponse));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTripById = async (req, res) => {
  try {
    const trip = await getTripRow(req.params.id);

    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.user_id !== req.user.id && !trip.is_public) {
      return res.status(401).json({ message: 'User not authorized to access this trip' });
    }

    res.status(200).json(toTripResponse(trip));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPublicTrip = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM trips WHERE share_id = $1 AND is_public = TRUE', [req.params.shareId]);
    if (!rows[0]) return res.status(404).json({ message: 'Public itinerary not found' });
    res.status(200).json(toTripResponse(rows[0]));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTrip = async (req, res) => {
  try {
    const { title, description, country, startDate, endDate, coverImage, isPublic, sections, cities } = req.body;

    if (!title || !country || !startDate) {
      return res.status(400).json({ message: 'Please add all required fields (title, country, startDate)' });
    }

    const id = crypto.randomUUID();
    const shareId = isPublic ? ensureShareId() : null;
    const { rows } = await pool.query(
      `INSERT INTO trips (
        id, user_id, title, description, country, start_date, end_date, cover_image, is_public, share_id, sections, cities
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`,
      [
        id,
        req.user.id,
        title,
        description || '',
        country,
        startDate,
        endDate || null,
        coverImage || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1000&q=80',
        Boolean(isPublic),
        shareId,
        JSON.stringify(sections || []),
        JSON.stringify(cities || []),
      ]
    );

    res.status(201).json(toTripResponse(rows[0]));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOwnedTrip = async (tripId, userId) => {
  const trip = await getTripRow(tripId);
  if (!trip) return { error: { status: 404, message: 'Trip not found' } };
  if (trip.user_id !== userId) return { error: { status: 401, message: 'User not authorized to update this trip' } };
  return { trip };
};

const updateTrip = async (req, res) => {
  try {
    const { trip, error } = await getOwnedTrip(req.params.id, req.user.id);
    if (error) return res.status(error.status).json({ message: error.message });

    const next = {
      title: req.body.title ?? trip.title,
      description: req.body.description ?? trip.description,
      country: req.body.country ?? trip.country,
      startDate: req.body.startDate ?? trip.start_date,
      endDate: req.body.endDate ?? trip.end_date,
      coverImage: req.body.coverImage ?? trip.cover_image,
      isPublic: req.body.isPublic ?? trip.is_public,
      shareId: req.body.isPublic && !trip.share_id ? ensureShareId() : trip.share_id,
      sections: req.body.sections ?? trip.sections ?? [],
      cities: req.body.cities ?? trip.cities ?? [],
      packingChecklist: req.body.packingChecklist ?? trip.packing_checklist ?? [],
      notes: req.body.notes ?? trip.notes ?? [],
    };

    const { rows } = await pool.query(
      `UPDATE trips SET
        title = $1,
        description = $2,
        country = $3,
        start_date = $4,
        end_date = $5,
        cover_image = $6,
        is_public = $7,
        share_id = $8,
        sections = $9,
        cities = $10,
        packing_checklist = $11,
        notes = $12,
        updated_at = NOW()
      WHERE id = $13
      RETURNING *`,
      [
        next.title,
        next.description,
        next.country,
        next.startDate,
        next.endDate,
        next.coverImage,
        next.isPublic,
        next.shareId,
        JSON.stringify(next.sections),
        JSON.stringify(next.cities),
        JSON.stringify(next.packingChecklist),
        JSON.stringify(next.notes),
        req.params.id,
      ]
    );

    res.status(200).json(toTripResponse(rows[0]));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTrip = async (req, res) => {
  try {
    const { error } = await getOwnedTrip(req.params.id, req.user.id);
    if (error) return res.status(error.status).json({ message: error.message });
    await pool.query('DELETE FROM trips WHERE id = $1', [req.params.id]);
    res.status(200).json({ id: req.params.id, message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addCityToTrip = async (req, res) => {
  try {
    const { cityId } = req.body;
    const { trip, error } = await getOwnedTrip(req.params.id, req.user.id);
    if (error) return res.status(error.status).json({ message: error.message });

    const city = citiesCatalog.find((item) => item.id === cityId);
    if (!city) return res.status(404).json({ message: 'City not found' });
    if (trip.country && city.country !== trip.country) {
      return res.status(400).json({ message: `Only cities in ${trip.country} can be added to this trip` });
    }

    const currentCities = trip.cities || [];
    const nextCities = currentCities.some((item) => item.cityId === city.id)
      ? currentCities
      : [...currentCities, { ...city, cityId: city.id, addedAt: new Date().toISOString() }];

    const { rows } = await pool.query(
      'UPDATE trips SET cities = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [JSON.stringify(nextCities), req.params.id]
    );

    res.status(200).json(toTripResponse(rows[0]));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeCityFromTrip = async (req, res) => {
  try {
    const { trip, error } = await getOwnedTrip(req.params.id, req.user.id);
    if (error) return res.status(error.status).json({ message: error.message });
    const nextCities = (trip.cities || []).filter((city) => city.cityId !== req.params.cityId);
    const { rows } = await pool.query(
      'UPDATE trips SET cities = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [JSON.stringify(nextCities), req.params.id]
    );
    res.status(200).json(toTripResponse(rows[0]));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const shareTrip = async (req, res) => {
  try {
    const { trip, error } = await getOwnedTrip(req.params.id, req.user.id);
    if (error) return res.status(error.status).json({ message: error.message });
    const { rows } = await pool.query(
      'UPDATE trips SET is_public = TRUE, share_id = COALESCE(share_id, $1), updated_at = NOW() WHERE id = $2 RETURNING *',
      [ensureShareId(), trip.id]
    );
    res.status(200).json(toTripResponse(rows[0]));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const copyPublicTrip = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM trips WHERE share_id = $1 AND is_public = TRUE', [req.params.shareId]);
    const sourceTrip = rows[0];
    if (!sourceTrip) return res.status(404).json({ message: 'Public itinerary not found' });

    const copiedId = crypto.randomUUID();
    const copied = await pool.query(
      `INSERT INTO trips (
        id, user_id, title, description, country, start_date, end_date, cover_image, sections, cities, packing_checklist, notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`,
      [
        copiedId,
        req.user.id,
        `${sourceTrip.title} Copy`,
        sourceTrip.description,
        sourceTrip.country,
        sourceTrip.start_date,
        sourceTrip.end_date,
        sourceTrip.cover_image,
        JSON.stringify(sourceTrip.sections || []),
        JSON.stringify(sourceTrip.cities || []),
        JSON.stringify(sourceTrip.packing_checklist || []),
        JSON.stringify(sourceTrip.notes || []),
      ]
    );

    res.status(201).json(toTripResponse(copied.rows[0]));
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
