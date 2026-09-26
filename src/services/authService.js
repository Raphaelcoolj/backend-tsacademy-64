const jwt = require('jsonwebtoken');
const { config } = require('../config');
const { User } = require('../models/User');

function toSafeUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function signToken(user) {
  return jwt.sign(
    { id: String(user._id), role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

// Returns { status, ok, message, data } so the controller stays thin.
async function register({ name, email, password, role }) {
  const normalizedEmail = String(email).trim().toLowerCase();

  const existing = await User.findOne({ email: normalizedEmail }).lean();
  if (existing) {
    return { status: 409, ok: false, message: 'Email is already registered', data: null };
  }

  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    password,
    role: role || 'employee',
  });

  return {
    status: 201,
    ok: true,
    message: 'Registration successful',
    data: { user: toSafeUser(user), token: signToken(user) },
  };
}

async function login({ email, password }) {
  const normalizedEmail = String(email).trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    return { status: 401, ok: false, message: 'Invalid email or password', data: null };
  }

  const matches = await user.comparePassword(password);
  if (!matches) {
    return { status: 401, ok: false, message: 'Invalid email or password', data: null };
  }

  return {
    status: 200,
    ok: true,
    message: 'Login successful',
    data: { user: toSafeUser(user), token: signToken(user) },
  };
}

module.exports = { register, login, toSafeUser, signToken };
