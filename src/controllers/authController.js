const authService = require('../services/authService');
const { validateRegisterInput, validateLoginInput } = require('../utils/validators');
const { sendSuccess, sendError } = require('../utils/response');

async function register(req, res, next) {
  try {
    const errors = validateRegisterInput(req.body);
    if (errors.length > 0) {
      return sendError(res, 'Validation failed', 400, errors);
    }

    const { name, email, password, role } = req.body;
    const result = await authService.register({ name, email, password, role });
    if (!result.ok) {
      return sendError(res, result.message, result.status);
    }
    return sendSuccess(res, result.message, result.data, result.status);
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const errors = validateLoginInput(req.body);
    if (errors.length > 0) {
      return sendError(res, 'Validation failed', 400, errors);
    }

    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    if (!result.ok) {
      return sendError(res, result.message, result.status);
    }
    return sendSuccess(res, result.message, result.data, result.status);
  } catch (err) {
    return next(err);
  }
}

// Convenience protected route: returns the authenticated user.
function me(req, res) {
  return sendSuccess(res, 'Authenticated user fetched', { user: req.user });
}

module.exports = { register, login, me };
