const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  addresses: user.addresses,
});

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }
    const user = await User.create({ name, email, password, phone });
    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log("========== LOGIN ==========");
    console.log("Email:", email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    console.log("User Found:", !!user);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.comparePassword(password);
    console.log("Password Match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated",
      });
    }

    const token = signToken(user._id);

    res.json({
      success: true,
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// GET /api/auth/profile
exports.getProfile = async (req, res, next) => {
  try {
    res.json({ success: true, user: sanitizeUser(req.user) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, addresses } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (addresses) user.addresses = addresses;
    await user.save();
    res.json({ success: true, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }
    const user = await User.findById(req.user._id).select('+password');
    const match = await user.comparePassword(currentPassword);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
// Stateless JWT: logout is handled client-side by discarding the token.
exports.logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};
