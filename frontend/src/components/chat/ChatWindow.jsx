import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ModerationRequest from './ModerationRequest';

const ChatWindow = ({ chat }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const { user, token } = useSelector(state => state.auth);
  const API = window.APP_CONFIG?.API_URL || '/api';
  const ws = useRef(null);

  useEffect(() => {
    if (chat) {
      fetchMessages();
      connectWebSocket();
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [chat]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API}/chats/${chat.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    if (ws.current) {
      ws.current.close();
    }

    // Подключаемся к WebSocket серверу
    ws.current = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws?token=${token}`);
    
    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };
    
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'new_message':
          setMessages(prev => [...prev, data.message]);
          break;
        case 'user_typing':
          handleTypingIndicator(data);
          break;
        case 'message_read':
          // Обработка подтверждения прочтения
          break;
      }
    };
    
    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
    };
  };

  const handleTypingIndicator = (data) => {
    if (data.is_typing) {
      setTypingUsers(prev => {
        if (!prev.includes(data.user_id)) {
          return [...prev, data.user_id];
        }
        return prev;
      });
      
      // Автоматически скрываем индикатор через 3 секунды
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(id => id !== data.user_id));
      }, 3000);
    } else {
      setTypingUsers(prev => prev.filter(id => id !== data.user_id));
    }
  };

  const sendMessage = (content) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'send_message',
        chat_id: chat.id,
        content,
        message_type: 'text'
      }));
    }
  };

  const sendTypingIndicator = (isTyping) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'typing',
        chat_id: chat.id,
        is_typing: isTyping
      }));
    }
  };

  if (loading) {
    return <div>Загрузка сообщений...</div>;
  }

  return (
    <div className="chat-window">
      <div className="chat-window__header">
        <h3>Чат по заказу #{chat.order_id}</h3>
        {chat.status === 'requires_moderation' && (
          <span className="chat-status chat-status--moderation">
            Ожидает подтверждения модерации
          </span>
        )}
        {chat.status === 'moderating' && (
          <span className="chat-status chat-status--moderating">
            Модератор подключен
          </span>
        )}
      </div>
      
      <MessageList 
        messages={messages} 
        typingUsers={typingUsers}
        participants={chat.ChatParticipants}
      />
      
      {chat.status === 'requires_moderation' && chat.ModerationRequests && (
        <ModerationRequest 
          chat={chat} 
          moderationRequest={chat.ModerationRequests[0]} 
        />
      )}
      
      <MessageInput 
        onSendMessage={sendMessage}
        onTypingChange={sendTypingIndicator}
        disabled={chat.status === 'resolved'}
      />
    </div>
  );
};

export default ChatWindow;