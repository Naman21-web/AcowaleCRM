const express = require('express');
const mongoose = require('mongoose');
const { getConnectionState } = require('../config/db');

const router = express.Router();

const STATE_LABELS = ['disconnected', 'connected', 'connecting', 'disconnecting'];
router.get('/health', (req, res) => {
  const dbState = getConnectionState();
  const dbHealthy = dbState === 1;

  res.status(dbHealthy ? 200 : 503).json({
    status: dbHealthy ? 'ok' : 'degraded',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database: STATE_LABELS[dbState] || 'unknown',
    mongooseVersion: mongoose.version,
  });
});

module.exports = router;
