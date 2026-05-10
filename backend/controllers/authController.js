const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const generateToken = require('../utils/generateToken');

const userResponse = (user, token) => ({
  _id: user.id,
  id: user.id,
  firstName: user.first_name,
  lastName: user.last_name,
  email: user.email,
  phone: user.phone,
  city: user.city,
  country: user.country,
  additionalInfo: user.additional_info,
  profilePhoto: user.profile_photo,
  isAdmin: user.is_admin,
  createdAt: user.created_at,
  ...(token ? { token } : {}),
});

const isConfiguredAdmin = (email) => {
  const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return adminEmails.includes(email);
};

const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, city, country, additionalInfo, password, profilePhoto } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!firstName || !lastName || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE lower(email) = lower($1)', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
    const id = crypto.randomUUID();
    const { rows } = await pool.query(
      `INSERT INTO users (
        id, first_name, last_name, email, phone, city, country, additional_info, password, profile_photo, is_admin
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`,
      [
        id,
        firstName,
        lastName,
        normalizedEmail,
        phone || '',
        city || '',
        country || '',
        additionalInfo || '',
        hashedPassword,
        profilePhoto || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
        isConfiguredAdmin(normalizedEmail),
      ]
    );

    res.status(201).json(userResponse(rows[0], generateToken(rows[0].id)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Please enter email and password' });
    }

    const { rows } = await pool.query('SELECT * FROM users WHERE lower(email) = lower($1)', [normalizedEmail]);
    const user = rows[0];

    if (user && (await bcrypt.compare(password, user.password))) {
      if (!user.is_admin && isConfiguredAdmin(user.email)) {
        const updated = await pool.query('UPDATE users SET is_admin = TRUE, updated_at = NOW() WHERE id = $1 RETURNING *', [user.id]);
        return res.json(userResponse(updated.rows[0], generateToken(updated.rows[0].id)));
      }
      return res.json(userResponse(user, generateToken(user.id)));
    }

    res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    res.status(200).json(userResponse(req.user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMe = async (req, res) => {
  try {
    const normalizedEmail = req.body.email?.trim().toLowerCase();

    if (!req.body.firstName?.trim() || !req.body.lastName?.trim() || !normalizedEmail) {
      return res.status(400).json({ message: 'First name, last name, and email are required' });
    }

    const emailOwner = await pool.query(
      'SELECT id FROM users WHERE lower(email) = lower($1) AND id <> $2',
      [normalizedEmail, req.user.id]
    );

    if (emailOwner.rows.length > 0) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    const { rows } = await pool.query(
      `UPDATE users SET
        first_name = $1,
        last_name = $2,
        email = $3,
        phone = $4,
        city = $5,
        country = $6,
        additional_info = $7,
        profile_photo = $8,
        updated_at = NOW()
      WHERE id = $9
      RETURNING *`,
      [
        req.body.firstName.trim(),
        req.body.lastName.trim(),
        normalizedEmail,
        req.body.phone?.trim() || '',
        req.body.city?.trim() || '',
        req.body.country?.trim() || '',
        req.body.additionalInfo?.trim() || '',
        req.body.profilePhoto?.trim() || req.user.profile_photo,
        req.user.id,
      ]
    );

    res.status(200).json(userResponse(rows[0]));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateMe,
};
