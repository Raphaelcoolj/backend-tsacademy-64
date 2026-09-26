const app = require('./app');
const { config, assertConfig } = require('./config');
const { connectDB } = require('./config/db');

async function start() {
  try {
    assertConfig();
    await connectDB();
    app.listen(config.port, () => {
      console.log(`Server listening on http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
