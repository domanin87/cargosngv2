const router = require('express').Router();
const { Tariff, Subscription, User } = require('../models');
const { auth } = require('../middleware/auth');
const logger = require('../logger');

// Получение списка тарифов
router.get('/', async (req, res) => {
  try {
    const tariffs = await Tariff.findAll({ 
      where: { is_active: true },
      order: [['price', 'ASC']]
    });
    
    res.json(tariffs);
  } catch (error) {
    logger.error('Get tariffs error:', error);
    res.status(500).json({ error: 'Ошибка получения тарифов' });
  }
});

// Покупка подписки
router.post('/subscribe', auth, async (req, res) => {
  try {
    const { tariff_id, promo_code, auto_renew = false } = req.body;
    const user = await User.findByPk(req.user.id);
    const tariff = await Tariff.findByPk(tariff_id);
    
    if (!tariff) {
      return res.status(404).json({ error: 'Тариф не найден' });
    }

    // Проверяем, есть ли у пользователя активная подписка
    const activeSubscription = await Subscription.findOne({
      where: {
        user_id: user.id,
        status: ['active', 'trial'],
        end_date: { [Op.gte]: new Date() }
      }
    });

    if (activeSubscription && tariff.type !== 'per_order') {
      return res.status(400).json({ error: 'У вас уже есть активная подписка' });
    }

    // Рассчитываем цену с учетом скидок
    let finalPrice = tariff.price;
    if (user.user_type === 'individual' && tariff.discount_individual > 0) {
      finalPrice = tariff.price * (1 - tariff.discount_individual / 100);
    } else if (user.user_type === 'legal' && tariff.discount_legal > 0) {
      finalPrice = tariff.price * (1 - tariff.discount_legal / 100);
    }

    // Применяем промокод, если предоставлен
    if (promo_code) {
      // Здесь будет логика проверки и применения промокода
      // temporary 10% discount for any promo code
      finalPrice = finalPrice * 0.9;
    }

    // Определяем даты действия подписки
    const startDate = new Date();
    let endDate = new Date();
    
    switch (tariff.type) {
      case 'per_order':
        endDate.setFullYear(endDate.getFullYear() + 10); // 10 years for per-order
        break;
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    // Создаем подписку
    const subscription = await Subscription.create({
      user_id: user.id,
      tariff_id: tariff.id,
      start_date: startDate,
      end_date: endDate,
      status: tariff.trial_days > 0 && !user.trial_used ? 'trial' : 'active',
      auto_renew,
      price_paid: finalPrice,
      currency: tariff.currency
    });

    // Если это пробный период, отмечаем, что пользователь использовал trial
    if (tariff.trial_days > 0 && !user.trial_used) {
      await user.update({ trial_used: true });
    }

    // Здесь должна быть интеграция с платежной системой
    // Пока просто возвращаем успех

    res.json({
      success: true,
      message: 'Подписка оформлена',
      subscription,
      payment_required: true
    });
  } catch (error) {
    logger.error('Subscribe error:', error);
    res.status(500).json({ error: 'Ошибка оформления подписки' });
  }
});

// Проверка статуса подписки
router.get('/status', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: {
        user_id: req.user.id,
        status: ['active', 'trial'],
        end_date: { [Op.gte]: new Date() }
      },
      include: [Tariff]
    });

    if (!subscription) {
      return res.json({ has_subscription: false });
    }

    res.json({
      has_subscription: true,
      subscription,
      is_trial: subscription.status === 'trial',
      days_remaining: Math.ceil((subscription.end_date - new Date()) / (1000 * 60 * 60 * 24))
    });
  } catch (error) {
    logger.error('Subscription status error:', error);
    res.status(500).json({ error: 'Ошибка проверки статуса подписки' });
  }
});

module.exports = router;