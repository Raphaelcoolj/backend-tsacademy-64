const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { config } = require('./config');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

// The frontend runs on a different origin (Vite dev server, static host), so
// it needs CORS headers on every response, including the 401/400/409 ones.
// CORS_ORIGIN is a comma-separated allow-list; unset means any origin may
// call the API — auth is stateless bearer tokens, there are no cookies.
app.use(
  cors(config.cors.origin.length > 0 ? { origin: config.cors.origin } : undefined)
);

app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  const started = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - started}ms)`);
  });
  next();
});

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Expense Approval API',
    data: { docs: '/README.md' },
  });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
