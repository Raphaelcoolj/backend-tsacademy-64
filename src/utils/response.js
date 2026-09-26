function sendSuccess(res, message, data = null, status = 200) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

function sendError(res, message, status = 500, errors = null) {
  return res.status(status).json({
    success: false,
    message,
    data: errors ? { errors } : null,
  });
}

module.exports = { sendSuccess, sendError };
