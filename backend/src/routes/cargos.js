const router = require('express').Router();
const { Cargo } = require('../models');
const logger = require('../logger');

// create cargo
router.post('/create', async (req, res) => {
  try {
    const p = req.body;
    const c = await Cargo.create({
      title: p.title || 'title',
      title_i18n: p.title_i18n || null,
      description: p.description || null,
      description_i18n: p.description_i18n || null,
      origin_country: p.origin_country || null,
      dest_country: p.dest_country || null,
      weight: p.weight || 0,
      price: p.price || 0,
      currency: p.currency || process.env.BASE_CURRENCY || 'KZT',
      user_id: p.user_id || null,
      driver_name: p.driver_name || null,
      driver_phone: p.driver_phone || null,
      customer_name: p.customer_name || null,
      customer_phone: p.customer_phone || null,
      rating: p.rating || 5.0
    });
    res.status(201).json({ success: true, cargo: c });
  } catch (e) {
    logger.error('create cargo failed', e);
    res.status(500).json({ error: 'create_failed' });
  }
});

// list cargos with simple filters
router.get('/list', async (req, res) => {
  try {
    const where = {};
    if (req.query.from) where.origin_country = req.query.from;
    if (req.query.to) where.dest_country = req.query.to;
    
    // Добавляем сортировку по рейтингу и дате
    const list = await Cargo.findAll({ 
      where, 
      order: [
        ['rating', 'DESC'],
        ['created_at', 'DESC']
      ],
      limit: 8 // Ограничиваем 8 записями для главной страницы
    });
    
    // Проверяем авторизацию и подписку
    let showFullData = false;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        
        if (user) {
          // Проверяем активную подписку
          const { Subscription } = require('../models');
          const subscription = await Subscription.findOne({
            where: {
              user_id: user.id,
              status: ['active', 'trial'],
              end_date: { [Op.gte]: new Date() }
            }
          });
          
          showFullData = !!subscription;
        }
      } catch (e) {
        // Токен невалидный, значит не авторизован
      }
    }

    const mapped = list.map(c => {
      const baseData = {
        id: c.id,
        title: c.title,
        price: c.price,
        currency: c.currency,
        origin: c.origin_country,
        dest: c.dest_country,
        status: c.status,
        rating: c.rating,
        createdAt: c.created_at
      };

      if (showFullData) {
        // Полные данные для подписанных пользователей
        return {
          ...baseData,
          driver_name: c.driver_name,
          driver_phone: c.driver_phone,
          customer_name: c.customer_name,
          customer_phone: c.customer_phone,
          description: c.description
        };
      } else {
        // Полузашифрованные данные для незарегистрированных
        return {
          ...baseData,
          driver_name: c.driver_name ? maskString(c.driver_name) : null,
          driver_phone: c.driver_phone ? maskString(c.driver_phone, 4) : null,
          customer_name: c.customer_name ? maskString(c.customer_name) : null,
          customer_phone: c.customer_phone ? maskString(c.customer_phone, 4) : null,
          description: c.description ? truncateString(c.description, 50) : null
        };
      }
    });

    res.json(mapped);
  } catch (e) {
    logger.error('list cargos failed', e);
    res.status(500).json({ error: 'list_failed' });
  }
});

// Функции для маскировки данных
function maskString(str, visibleChars = 1) {
  if (!str) return null;
  return str.substring(0, visibleChars) + '*'.repeat(str.length - visibleChars);
}

function truncateString(str, length) {
  if (!str) return null;
  return str.length > length ? str.substring(0, length) + '...' : str;
}

module.exports = router;