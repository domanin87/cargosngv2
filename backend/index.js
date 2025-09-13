
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { init, sequelize } = require('./src/models');
const logger = require('./src/logger');
const metrics = require('./src/metrics');

const app = express();
app.use(helmet());
app.use(express.json({ limit: '2mb' }));

// CORS setup - allow origins from env, or all in dev
const ALLOW = (process.env.ALLOW_ORIGINS || '*').split(',').map(s=>s.trim()).filter(Boolean);
const corsOptions = ALLOW.length === 0 || ALLOW.includes('*') ? {} : { origin: ALLOW };
app.use(cors(corsOptions));

// metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', metrics.register.contentType);
  res.end(await metrics.register.metrics());
});

// health
app.get('/api/v1/health', (_req, res) => res.json({ ok: true, time: Date.now() }));

// routes
app.use('/api/v1/auth', require('./src/routes/auth'));
app.use('/api/v1/cargos', require('./src/routes/cargos'));
app.use('/api/v1/tariffs', require('./src/routes/tariffs'));
app.use('/api/v1/payment', require('./src/routes/payment'));

// static frontend (optional)
const dist = path.join(__dirname, 'frontend', 'dist');
app.use(express.static(dist));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'not_found' });
  if (req.accepts('html')) return res.sendFile(path.join(dist, 'index.html'));
  res.status(404).end();
});

// error handler
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(err.status || 500).json({ error: err.message || 'internal_error' });
});

const PORT = process.env.PORT || 5000;

init().then(() => {
  app.listen(PORT, () => {
    logger.info('CargoSNG backend ready on port ' + PORT);
  });
}).catch(e => {
  console.error('DB init failed', e);
  process.exit(1);
});
