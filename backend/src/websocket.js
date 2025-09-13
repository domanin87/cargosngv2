const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { Message, ChatParticipant, User } = require('./models');
const logger = require('./logger');

class ChatWebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map(); // user_id -> WebSocket
    
    this.wss.on('connection', (ws, request) => {
      // Аутентификация по токену
      const token = request.url.split('token=')[1];
      
      if (!token) {
        ws.close(1008, 'Токен не предоставлен');
        return;
      }
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user_id = decoded.id;
        
        // Сохраняем соединение
        this.clients.set(user_id, ws);
        
        // Обработка сообщений
        ws.on('message', (data) => {
          this.handleMessage(user_id, data);
        });
        
        // Обработка закрытия соединения
        ws.on('close', () => {
          this.clients.delete(user_id);
        });
        
        ws.send(JSON.stringify({ type: 'connected', user_id }));
        
      } catch (error) {
        ws.close(1008, 'Неверный токен');
      }
    });
  }
  
  async handleMessage(user_id, data) {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'send_message':
          await this.handleSendMessage(user_id, message);
          break;
        case 'typing':
          await this.handleTyping(user_id, message);
          break;
        case 'read_receipt':
          await this.handleReadReceipt(user_id, message);
          break;
      }
    } catch (error) {
      logger.error('WebSocket message handling error:', error);
    }
  }
  
  async handleSendMessage(user_id, message) {
    const { chat_id, content, message_type = 'text' } = message;
    
    // Проверяем, является ли пользователь участником чата
    const participant = await ChatParticipant.findOne({
      where: { chat_id, user_id }
    });
    
    if (!participant) {
      this.sendToUser(user_id, {
        type: 'error',
        error: 'Доступ к чату запрещен'
      });
      return;
    }
    
    // Создаем сообщение
    const newMessage = await Message.create({
      chat_id,
      user_id,
      content,
      message_type
    });
    
    // Обновляем время последнего сообщения в чате
    await Chat.update(
      { last_message_at: new Date() },
      { where: { id: chat_id } }
    );
    
    // Получаем полную информацию о сообщении
    const messageWithUser = await Message.findByPk(newMessage.id, {
      include: [{ model: User, attributes: ['id', 'name', 'email', 'role'] }]
    });
    
    // Отправляем сообщение всем участникам чата
    const participants = await ChatParticipant.findAll({
      where: { chat_id },
      attributes: ['user_id']
    });
    
    participants.forEach(participant => {
      this.sendToUser(participant.user_id, {
        type: 'new_message',
        message: messageWithUser
      });
    });
  }
  
  async handleTyping(user_id, message) {
    const { chat_id, is_typing } = message;
    
    // Проверяем, является ли пользователь участником чата
    const participant = await ChatParticipant.findOne({
      where: { chat_id, user_id }
    });
    
    if (!participant) return;
    
    // Отправляем уведомление о наборе текста другим участникам
    const otherParticipants = await ChatParticipant.findAll({
      where: { 
        chat_id, 
        user_id: { [Op.ne]: user_id } 
      },
      attributes: ['user_id']
    });
    
    otherParticipants.forEach(participant => {
      this.sendToUser(participant.user_id, {
        type: 'user_typing',
        chat_id,
        user_id,
        is_typing
      });
    });
  }
  
  async handleReadReceipt(user_id, message) {
    const { chat_id } = message;
    
    // Обновляем время последнего прочтения
    await ChatParticipant.update(
      { last_read_at: new Date() },
      { where: { chat_id, user_id } }
    );
    
    // Отправляем уведомление о прочтении другим участникам
    const otherParticipants = await ChatParticipant.findAll({
      where: { 
        chat_id, 
        user_id: { [Op.ne]: user_id } 
      },
      attributes: ['user_id']
    });
    
    otherParticipants.forEach(participant => {
      this.sendToUser(participant.user_id, {
        type: 'message_read',
        chat_id,
        user_id
      });
    });
  }
  
  sendToUser(user_id, data) {
    const client = this.clients.get(user_id);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }
  
  // Метод для отправки уведомлений из других частей приложения
  notifyUser(user_id, notification) {
    this.sendToUser(user_id, {
      type: 'notification',
      notification
    });
  }
}

module.exports = ChatWebSocketServer;