import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import ChatItem from './ChatItem';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useSelector(state => state.auth);
  const API = window.APP_CONFIG?.API_URL || '/api';

  useEffect(() => {
    fetchChats();
    
    // Подписываемся на обновления через WebSocket
    if (window.chatSocket) {
      window.chatSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message') {
          // Обновляем список чатов при новом сообщении
          fetchChats();
        }
      };
    }
  }, []);

  const fetchChats = async () => {
    try {
      const response = await axios.get(`${API}/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Загрузка чатов...</div>;
  }

  return (
    <div className="chat-list">
      <div className="chat-list__header">
        <h2>Чаты</h2>
      </div>
      
      <div className="chat-list__items">
        {chats.length === 0 ? (
          <div className="chat-list__empty">
            У вас пока нет активных чатов
          </div>
        ) : (
          chats.map(chat => (
            <ChatItem key={chat.id} chat={chat} />
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;