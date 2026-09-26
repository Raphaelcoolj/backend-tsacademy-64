require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expense-approval',
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
};

function assertConfig() {
  if (!config.jwt.secret) {
    throw new Error('JWT_SECRET is missing. Copy .env.example to .env and set it.');
  }
}

module.exports = { config, assertConfig };
