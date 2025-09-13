
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { init } = require('./src/models');
const i18n = require('./src/i18n');
const errorHandler = require('./src/middleware/error');

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(cors({ origin: (process.env.ALLOW_ORIGINS||'*').split(',') }));
app.use(i18n.middleware.handle(i18n.i18next));

app.get('/api/v1/health', (_req,res)=> res.json({ ok:true, now: Date.now() }));
app.use('/api/v1/auth', require('./src/routes/auth'));
app.use('/api/v1/cargos', require('./src/routes/cargos'));
app.use('/api/v1/tariffs', require('./src/routes/tariffs'));
app.use('/api/payment', require('./src/routes/payment'));

// serve frontend if present
const distPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(distPath));
app.get('*', (req,res)=> {
  if(req.path.startsWith('/api')) return res.status(404).json({ error:'not_found' });
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
init().then(()=> {
  app.listen(PORT, ()=> console.log('CargoSNG backend listening on', PORT));
}).catch(e=> { console.error('DB init failed', e); process.exit(1); });
