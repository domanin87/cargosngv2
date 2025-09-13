
const router = require('express').Router();
const axios = require('axios');
const logger = require('../logger');
const BASE = process.env.BASE_CURRENCY || 'KZT';

// quote returns both base price and converted price by user's currency (by query or IP/profile)
router.post('/quote', async (req, res) => {
  try {
    const { weight = 1, to } = req.body;
    const basePrice = 1000 * Number(weight || 1);
    const base = { amount: Math.round(basePrice * 100) / 100, currency: BASE };
    let user = null;

    // if 'to' provided, try convert using currency API
    if (to && to !== BASE) {
      try {
        const url = `${process.env.CURRENCY_API_URL || 'https://api.exchangerate.host/latest'}?base=${BASE}&symbols=${to}`;
        const r = await axios.get(url);
        const rate = r.data?.rates?.[to] || null;
        if (rate) user = { amount: Math.round(base.amount * rate * 100) / 100, currency: to };
      } catch (e) {
        logger.warn('currency conversion failed', e.message || e);
      }
    }

    res.json({ base, user });
  } catch (e) {
    logger.error('quote failed', e);
    res.status(500).json({ error: 'quote_failed' });
  }
});

module.exports = router;
