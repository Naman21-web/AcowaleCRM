const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const logger = require('./utils/logger');

const { apiLimiter } = require('./middleware/rateLimiter');

function createApp() {
  const app = express();

  app.use(helmet());

  const allowedOrigins = (process.env.CLIENT_ORIGIN || '').split(',').map((o) => o.trim()).filter(Boolean);
  app.use(
    cors({
      origin: allowedOrigins.length ? allowedOrigins : '*',
      credentials: true,
    })
  );

  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true }));

  // HTTP access log, routed through winston instead of straight to stdout
  // so format stays consistent with the rest of the app's logging.
  app.use(
    morgan('tiny', {
      stream: { write: (msg) => logger.info(msg.trim()) },
    })
  );

  app.use('/api', apiLimiter);

  app.get('/', (req, res) => {
    res.json({ name: 'Acowale CRM API', status: 'running', docs: '/health' });
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
