const crypto = require('crypto');
const { pool } = require('../config/db');

const toPostResponse = (row) => ({
  _id: row.id,
  id: row.id,
  userId: row.user_id,
  authorName: row.author_name,
  authorPhoto: row.author_photo,
  title: row.title,
  content: row.content,
  type: row.type,
  country: row.country,
  region: row.region,
  relatedName: row.related_name,
  rating: row.rating,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const getCommunityPosts = async (req, res) => {
  try {
    const { q = '', type = '', country = '', sort = 'newest' } = req.query;
    const values = [];
    const where = [];

    if (type) {
      values.push(type);
      where.push(`type = $${values.length}`);
    }
    if (country) {
      values.push(country);
      where.push(`country = $${values.length}`);
    }
    if (q.trim()) {
      values.push(`%${q.trim()}%`);
      where.push(`(title ILIKE $${values.length} OR content ILIKE $${values.length} OR country ILIKE $${values.length} OR region ILIKE $${values.length} OR related_name ILIKE $${values.length} OR author_name ILIKE $${values.length})`);
    }

    const orderBy = sort === 'rating' ? 'rating DESC, created_at DESC' : 'created_at DESC';
    const posts = await pool.query(
      `SELECT * FROM community_posts ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY ${orderBy}`,
      values
    );
    const meta = await pool.query('SELECT DISTINCT country, type FROM community_posts');

    res.status(200).json({
      posts: posts.rows.map(toPostResponse),
      countries: [...new Set(meta.rows.map((post) => post.country).filter(Boolean))],
      types: [...new Set(meta.rows.map((post) => post.type).filter(Boolean))],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCommunityPost = async (req, res) => {
  try {
    const { title, content, type, country, region, relatedName, rating } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and experience are required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO community_posts (
        id, user_id, author_name, author_photo, title, content, type, country, region, related_name, rating
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`,
      [
        crypto.randomUUID(),
        req.user.id,
        `${req.user.first_name} ${req.user.last_name}`.trim(),
        req.user.profile_photo,
        title,
        content,
        type || 'Trip',
        country || '',
        region || '',
        relatedName || '',
        rating || 5,
      ]
    );

    res.status(201).json(toPostResponse(rows[0]));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCommunityPosts,
  createCommunityPost,
};
