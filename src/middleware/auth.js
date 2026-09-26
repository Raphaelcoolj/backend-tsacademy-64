const jwt = require('jsonwebtoken');
const { config } = require('../config');
const { User } = require('../models/User');
const { sendError } = require('../utils/response');

function extractToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
}

// Verifies the JWT and attaches { id, role } to req.user.
async function authenticate(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return sendError(res, 'Authentication token missing', 401);
    }

    let payload;
    try {
      payload = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      const reason = err.name === 'TokenExpiredError' ? 'expired' : 'invalid';
      return sendError(res, `Authentication token ${reason}`, 401);
    }

    const user = await User.findById(payload.id).lean();
    if (!user) {
      return sendError(res, 'Authentication failed: user no longer exists', 401);
    }

    req.user = { id: String(user._id), role: user.role, name: user.name, email: user.email };
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = { authenticate, extractToken };
