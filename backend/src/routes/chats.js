const router = require('express').Router();
const { Chat, ChatParticipant, Message, ModerationRequest, User, Order } = require('../models');
const { auth } = require('../middleware/auth');
const { Op } = require('sequelize');
const logger = require('../logger');

// Получение чатов пользователя
router.get('/', auth, async (req, res) => {
  try {
    const userChats = await ChatParticipant.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Chat,
          include: [
            {
              model: Message,
              order: [['created_at', 'DESC']],
              limit: 1,
              include: [{ model: User, attributes: ['id', 'name', 'email'] }]
            },
            {
              model: ChatParticipant,
              include: [{ model: User, attributes: ['id', 'name', 'email', 'role'] }]
            },
            {
              model: ModerationRequest,
              where: { status: 'pending' },
              required: false
            }
          ]
        }
      ],
      order: [[Chat, 'last_message_at', 'DESC']]
    });

    res.json(userChats.map(uc => uc.Chat));
  } catch (error) {
    logger.error('Get chats error:', error);
    res.status(500).json({ error: 'Ошибка получения чатов' });
  }
});

// Получение сообщений чата
router.get('/:chat_id/messages', auth, async (req, res) => {
  try {
    const { chat_id } = req.params;
    
    // Проверяем, является ли пользователь участником чата
    const participant = await ChatParticipant.findOne({
      where: { chat_id, user_id: req.user.id }
    });
    
    if (!participant) {
      return res.status(403).json({ error: 'Доступ к чату запрещен' });
    }
    
    const messages = await Message.findAll({
      where: { chat_id },
      include: [{ model: User, attributes: ['id', 'name', 'email', 'role'] }],
      order: [['created_at', 'ASC']]
    });
    
    // Обновляем время последнего прочтения
    await ChatParticipant.update(
      { last_read_at: new Date() },
      { where: { chat_id, user_id: req.user.id } }
    );
    
    res.json(messages);
  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({ error: 'Ошибка получения сообщений' });
  }
});

// Отправка сообщения
router.post('/:chat_id/messages', auth, async (req, res) => {
  try {
    const { chat_id } = req.params;
    const { content, message_type = 'text' } = req.body;
    
    // Проверяем, является ли пользователь участником чата
    const participant = await ChatParticipant.findOne({
      where: { chat_id, user_id: req.user.id }
    });
    
    if (!participant) {
      return res.status(403).json({ error: 'Доступ к чату запрещен' });
    }
    
    // Создаем сообщение
    const message = await Message.create({
      chat_id,
      user_id: req.user.id,
      content,
      message_type
    });
    
    // Обновляем время последнего сообщения в чате
    await Chat.update(
      { last_message_at: new Date() },
      { where: { id: chat_id } }
    });
    
    // Получаем полную информацию о сообщении
    const messageWithUser = await Message.findByPk(message.id, {
      include: [{ model: User, attributes: ['id', 'name', 'email', 'role'] }]
    });
    
    res.status(201).json(messageWithUser);
  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({ error: 'Ошибка отправки сообщения' });
  }
});

// Запрос на подключение модератора
router.post('/:chat_id/request-moderation', auth, async (req, res) => {
  try {
    const { chat_id } = req.params;
    const { reason } = req.body;
    
    // Проверяем, является ли пользователь участником чата
    const participant = await ChatParticipant.findOne({
      where: { chat_id, user_id: req.user.id }
    });
    
    if (!participant) {
      return res.status(403).json({ error: 'Доступ к чату запрещен' });
    }
    
    // Проверяем, не отправлен ли уже запрос
    const existingRequest = await ModerationRequest.findOne({
      where: { chat_id, status: 'pending' }
    });
    
    if (existingRequest) {
      return res.status(400).json({ error: 'Запрос на модерацию уже отправлен' });
    }
    
    // Создаем запрос на модерацию
    const moderationRequest = await ModerationRequest.create({
      chat_id,
      requested_by: req.user.id,
      reason
    });
    
    // Отправляем системное сообщение о запросе
    await Message.create({
      chat_id,
      user_id: req.user.id,
      content: `Пользователь запросил подключение модератора. Причина: ${reason}`,
      message_type: 'system'
    });
    
    // Обновляем статус чата
    await Chat.update(
      { status: 'requires_moderation' },
      { where: { id: chat_id } }
    );
    
    res.status(201).json(moderationRequest);
  } catch (error) {
    logger.error('Request moderation error:', error);
    res.status(500).json({ error: 'Ошибка запроса модерации' });
  }
});

// Подтверждение подключения модератора (вторым участником)
router.post('/:chat_id/approve-moderation', auth, async (req, res) => {
  try {
    const { chat_id } = req.params;
    
    // Проверяем, является ли пользователь участником чата
    const participant = await ChatParticipant.findOne({
      where: { 
        chat_id, 
        user_id: req.user.id,
        role: { [Op.in]: ['customer', 'carrier'] }
      }
    });
    
    if (!participant) {
      return res.status(403).json({ error: 'Доступ к чату запрещен' });
    }
    
    // Находим активный запрос на модерацию
    const moderationRequest = await ModerationRequest.findOne({
      where: { chat_id, status: 'pending' }
    });
    
    if (!moderationRequest) {
      return res.status(404).json({ error: 'Активный запрос на модерацию не найден' });
    }
    
    // Проверяем, что пользователь не является инициатором запроса
    if (moderationRequest.requested_by === req.user.id) {
      return res.status(400).json({ error: 'Нельзя подтвердить собственный запрос' });
    }
    
    // Обновляем запрос
    await moderationRequest.update({
      approved_by: req.user.id,
      status: 'approved'
    });
    
    // Находим свободного модератора
    const moderator = await User.findOne({
      where: { 
        role: 'moderator',
        is_active: true
      },
      order: sequelize.random() // случайный модератор
    });
    
    if (moderator) {
      // Добавляем модератора в чат
      await ChatParticipant.create({
        chat_id,
        user_id: moderator.id,
        role: 'moderator'
      });
      
      // Обновляем статус чата
      await Chat.update(
        { status: 'moderating' },
        { where: { id: chat_id } }
      );
      
      // Отправляем системное сообщение
      await Message.create({
        chat_id,
        user_id: moderator.id,
        content: 'Модератор подключился к чату для помощи в разрешении ситуации.',
        message_type: 'system'
      });
      
      res.json({ 
        success: true, 
        message: 'Модератор подключен к чату',
        moderator: { id: moderator.id, name: moderator.name }
      });
    } else {
      res.status(503).json({ error: 'В настоящее время нет свободных модераторов' });
    }
  } catch (error) {
    logger.error('Approve moderation error:', error);
    res.status(500).json({ error: 'Ошибка подтверждения модерации' });
  }
});

// Создание чата для заказа
router.post('/create-for-order/:order_id', auth, async (req, res) => {
  try {
    const { order_id } = req.params;
    
    // Проверяем, существует ли заказ и имеет ли пользователь к нему доступ
    const order = await Order.findByPk(order_id, {
      include: [
        { model: User, as: 'Customer' },
        { model: User, as: 'Carrier' }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }
    
    if (order.customer_id !== req.user.id && order.carrier_id !== req.user.id) {
      return res.status(403).json({ error: 'Доступ к заказу запрещен' });
    }
    
    // Проверяем, не создан ли уже чат для этого заказа
    let chat = await Chat.findOne({
      where: { order_id },
      include: [ChatParticipant]
    });
    
    if (!chat) {
      // Создаем новый чат
      chat = await Chat.create({ order_id });
      
      // Добавляем заказчика в чат
      await ChatParticipant.create({
        chat_id: chat.id,
        user_id: order.customer_id,
        role: 'customer'
      });
      
      // Добавляем перевозчика в чат, если он назначен
      if (order.carrier_id) {
        await ChatParticipant.create({
          chat_id: chat.id,
          user_id: order.carrier_id,
          role: 'carrier'
        });
      }
      
      // Отправляем приветственное сообщение
      await Message.create({
        chat_id: chat.id,
        user_id: order.customer_id,
        content: 'Чат создан для обсуждения деталей заказа.',
        message_type: 'system'
      });
    }
    
    res.status(201).json(chat);
  } catch (error) {
    logger.error('Create chat error:', error);
    res.status(500).json({ error: 'Ошибка создания чата' });
  }
});

module.exports = router;