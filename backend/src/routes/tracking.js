const router = require('express').Router();
const { Order, Tracking } = require('../models');
const { auth } = require('../middleware/auth');
const logger = require('../logger');

// Обновление местоположения водителя
router.post('/update-location', auth, async (req, res) => {
  try {
    const { order_id, lat, lng, status } = req.body;
    
    // Проверяем, что заказ назначен текущему пользователю
    const order = await Order.findOne({
      where: { id: order_id, carrier_id: req.user.id }
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден или не назначен вам' });
    }
    
    // Сохраняем текущее местоположение
    await Tracking.create({
      order_id,
      lat,
      lng,
      status: status || order.status
    });
    
    // Обновляем статус заказа, если он изменился
    if (status && status !== order.status) {
      await order.update({ status });
    }
    
    res.json({ success: true, message: 'Местоположение обновлено' });
  } catch (error) {
    logger.error('Update location error:', error);
    res.status(500).json({ error: 'Ошибка обновления местоположения' });
  }
});

// Получение истории перемещения для заказа
router.get('/:order_id', auth, async (req, res) => {
  try {
    const { order_id } = req.params;
    
    // Проверяем права доступа к заказу
    const order = await Order.findOne({
      where: {
        id: order_id,
        [Op.or]: [
          { customer_id: req.user.id },
          { carrier_id: req.user.id }
        ]
      }
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден или нет доступа' });
    }
    
    const trackingData = await Tracking.findAll({
      where: { order_id },
      order: [['created_at', 'ASC']]
    });
    
    res.json(trackingData);
  } catch (error) {
    logger.error('Get tracking data error:', error);
    res.status(500).json({ error: 'Ошибка получения данных отслеживания' });
  }
});

// Получение текущего местоположения заказа
router.get('/:order_id/current', auth, async (req, res) => {
  try {
    const { order_id } = req.params;
    
    // Проверяем права доступа к заказу
    const order = await Order.findOne({
      where: {
        id: order_id,
        [Op.or]: [
          { customer_id: req.user.id },
          { carrier_id: req.user.id }
        ]
      }
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден или нет доступа' });
    }
    
    const currentLocation = await Tracking.findOne({
      where: { order_id },
      order: [['created_at', 'DESC']]
    });
    
    res.json(currentLocation);
  } catch (error) {
    logger.error('Get current location error:', error);
    res.status(500).json({ error: 'Ошибка получения текущего местоположения' });
  }
});

module.exports = router;