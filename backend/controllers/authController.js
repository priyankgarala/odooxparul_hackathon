const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const userResponse = (user, token) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  city: user.city,
  country: user.country,
  additionalInfo: user.additionalInfo,
  profilePhoto: user.profilePhoto,
  isAdmin: user.isAdmin,
  createdAt: user.createdAt,
  ...(token ? { token } : {}),
});

const isConfiguredAdmin = (email) => {
  const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return adminEmails.includes(email);
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, city, country, additionalInfo, password, profilePhoto } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    // Validation
    if (!firstName || !lastName || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({
      email: new RegExp(`^${escapeRegex(normalizedEmail)}$`, 'i'),
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      phone,
      city,
      country,
      additionalInfo,
      password,
      profilePhoto,
      isAdmin: isConfiguredAdmin(normalizedEmail),
    });

    if (user) {
      res.status(201).json(userResponse(user, generateToken(user._id)));
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Please enter email and password' });
    }

    // Check for user email
    const user = await User.findOne({
      email: new RegExp(`^${escapeRegex(normalizedEmail)}$`, 'i'),
    }).select('+password');

    if (user && (await user.matchPassword(password))) {
      if (!user.isAdmin && isConfiguredAdmin(user.email)) {
        user.isAdmin = true;
        await user.save();
      }
      res.json(userResponse(user, generateToken(user._id)));
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    res.status(200).json(userResponse(req.user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
const updateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const normalizedEmail = req.body.email?.trim().toLowerCase();

    if (!req.body.firstName?.trim() || !req.body.lastName?.trim() || !normalizedEmail) {
      return res.status(400).json({ message: 'First name, last name, and email are required' });
    }

    const emailOwner = await User.findOne({
      email: new RegExp(`^${escapeRegex(normalizedEmail)}$`, 'i'),
      _id: { $ne: user._id },
    });

    if (emailOwner) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    user.firstName = req.body.firstName.trim();
    user.lastName = req.body.lastName.trim();
    user.email = normalizedEmail;
    user.phone = req.body.phone?.trim() || '';
    user.city = req.body.city?.trim() || '';
    user.country = req.body.country?.trim() || '';
    user.additionalInfo = req.body.additionalInfo?.trim() || '';
    user.profilePhoto = req.body.profilePhoto?.trim() || user.profilePhoto;

    const updatedUser = await user.save();
    res.status(200).json(userResponse(updatedUser));
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
