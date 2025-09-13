const router = require('express').Router();
const { Order, Cargo, User, Payment } = require('../models');
const { auth, requireRole } = require('../middleware/auth');
const logger = require('../logger');

// Создание заказа (только для заказчиков)
router.post('/', auth, requireRole(['customer']), async (req, res) => {
  try {
    const { cargo_id } = req.body;
    
    const cargo = await Cargo.findByPk(cargo_id);
    if (!cargo) {
      return res.status(404).json({ error: 'Груз не найден' });
    }

    const order = await Order.create({
      customer_id: req.user.id,
      cargo_id,
      price: cargo.price
    });

    await order.reload({
      include: [
        { model: Cargo },
        { model: User, as: 'Customer' },
        { model: User, as: 'Carrier' }
      ]
    });

    res.status(201).json(order);
  } catch (error) {
    logger.error('Create order error:', error);
    res.status(500).json({ error: 'Ошибка при создании заказа' });
  }
});

// Принятие заказа перевозчиком
router.post('/:id/accept', auth, requireRole(['carrier']), async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [Cargo]
    });

    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Заказ уже принят или отменен' });
    }

    order.carrier_id = req.user.id;
    order.status = 'accepted';
    await order.save();

    await order.reload({
      include: [
        { model: Cargo },
        { model: User, as: 'Customer' },
        { model: User, as: 'Carrier' }
      ]
    });

    res.json(order);
  } catch (error) {
    logger.error('Accept order error:', error);
    res.status(500).json({ error: 'Ошибка при принятии заказа' });
  }
});

// Получение заказов пользователя
router.get('/my-orders', auth, async (req, res) => {
  try {
    let whereCondition = {};
    
    if (req.user.role === 'customer') {
      whereCondition.customer_id = req.user.id;
    } else if (req.user.role === 'carrier') {
      whereCondition.carrier_id = req.user.id;
    }

    const orders = await Order.findAll({
      where: whereCondition,
      include: [
        { model: Cargo },
        { model: User, as: 'Customer' },
        { model: User, as: 'Carrier' },
        { model: Payment }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    logger.error('Get orders error:', error);
    res.status(500).json({ error: 'Ошибка при получении заказов' });
  }
});

module.exports = router;