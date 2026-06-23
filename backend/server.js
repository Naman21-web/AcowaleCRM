require('dotenv').config();
const createApp = require('./src/app');
const { connectDB } = require('./src/config/db');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    const app = createApp();

    const server = app.listen(PORT, () => {
      logger.info(`Acowale CRM API listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });

    // Graceful shutdown so in-flight requests finish and Mongo closes cleanly.
    const shutdown = (signal) => {
      logger.info(`${signal} received, shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled rejection', { error: err.message, stack: err.stack });
    });
  } catch (err) {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  }
}

start();
