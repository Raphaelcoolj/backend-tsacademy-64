const { sendError } = require('../utils/response');

// 404 for unknown routes.
function notFound(req, res) {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

// Central error handler. Keeps a single, consistent error shape.
function errorHandler(err, req, res, _next) {
  // Mongoose schema validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, 'Validation failed', 400, errors);
  }

  // Invalid MongoDB ObjectId
  if (err.name === 'CastError') {
    return sendError(res, `Invalid value for ${err.path}`, 400);
  }

  // Duplicate unique index (e.g. email already registered)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return sendError(res, `${field} is already in use`, 409);
  }

  const status = err.statusCode || err.status || 500;
  const message = status < 500 ? err.message : 'Something went wrong';
  if (status >= 500) console.error(err);
  return sendError(res, message, status);
}

module.exports = { notFound, errorHandler };
