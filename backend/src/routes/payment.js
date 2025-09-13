const router = require('express').Router();
const { Order, Payment, User, Bonus } = require('../models');
const { auth, requireRole } = require('../middleware/auth');
const QRCode = require('qrcode');
const logger = require('../logger');
const axios = require('axios');

// Генерация QR-кода для Kaspi.kz
router.post('/kaspi/qr', auth, async (req, res) => {
  try {
    const { orderId, amount, currency = 'KZT' } = req.body;
    const payload = `kaspi://pay?order=${orderId}&amount=${amount}&currency=${currency}`;
    const dataUrl = await QRCode.toDataURL(payload);
    
    res.json({ success: true, orderId, amount, currency, qr: dataUrl });
  } catch (e) {
    logger.error('QR generation failed:', e);
    res.status(500).json({ error: 'Ошибка генерации QR-кода' });
  }
});

// Обработка успешной оплаты и начисление бонусов
router.post('/process-bonuses', auth, async (req, res) => {
  try {
    const { order_id } = req.body;
    
    const order = await Order.findByPk(order_id, {
      include: [{ model: User, as: 'Customer' }]
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }
    
    if (order.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'Недостаточно прав' });
    }
    
    if (order.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Заказ еще не оплачен' });
    }
    
    // Начисляем бонусы (5% от суммы заказа)
    const bonusAmount = Math.round(order.price * 0.05);
    
    await Bonus.create({
      user_id: req.user.id,
      order_id: order.id,
      amount: bonusAmount,
      type: 'earning',
      description: `Начисление бонусов за заказ #${order.id}`
    });
    
    // Обновляем баланс бонусов пользователя
    await User.increment('bonus_balance', {
      by: bonusAmount,
      where: { id: req.user.id }
    });
    
    res.json({ 
      success: true, 
      message: `Начислено ${bonusAmount} бонусных баллов`,
      bonus_balance: req.user.bonus_balance + bonusAmount
    });
  } catch (error) {
    logger.error('Process bonuses error:', error);
    res.status(500).json({ error: 'Ошибка обработки бонусов' });
  }
});

// Оплата бонусными баллами
router.post('/pay-with-bonuses', auth, async (req, res) => {
  try {
    const { order_id } = req.body;
    
    const order = await Order.findByPk(order_id);
    const user = await User.findByPk(req.user.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }
    
    if (order.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'Недостаточно прав' });
    }
    
    if (order.payment_status === 'paid') {
      return res.status(400).json({ error: 'Заказ уже оплачен' });
    }
    
    // Проверяем, достаточно ли бонусов
    if (user.bonus_balance < order.price) {
      return res.status(400).json({ 
        error: `Недостаточно бонусов. Необходимо: ${order.price}, доступно: ${user.bonus_balance}` 
      });
    }
    
    // Списание бонусов
    await Bonus.create({
      user_id: req.user.id,
      order_id: order.id,
      amount: -order.price,
      type: 'spending',
      description: `Оплата заказа #${order.id} бонусами`
    });
    
    // Обновляем баланс пользователя
    await User.decrement('bonus_balance', {
      by: order.price,
      where: { id: req.user.id }
    });
    
    // Обновляем статус оплаты заказа
    await order.update({ 
      payment_status: 'paid',
      payment_method: 'bonuses'
    });
    
    res.json({ 
      success: true, 
      message: 'Заказ успешно оплачен бонусами',
      bonus_balance: user.bonus_balance - order.price
    });
  } catch (error) {
    logger.error('Pay with bonuses error:', error);
    res.status(500).json({ error: 'Ошибка оплаты бонусами' });
  }
});

// Получение истории бонусов
router.get('/bonus-history', auth, async (req, res) => {
  try {
    const bonuses = await Bonus.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Order }],
      order: [['created_at', 'DESC']],
      limit: 50
    });
    
    res.json(bonuses);
  } catch (error) {
    logger.error('Get bonus history error:', error);
    res.status(500).json({ error: 'Ошибка получения истории бонусов' });
  }
});

module.exports = router;