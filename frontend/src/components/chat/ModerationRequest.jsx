import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const ModerationRequest = ({ chat, moderationRequest }) => {
  const [approved, setApproved] = useState(false);
  const [rejected, setRejected] = useState(false);
  const { user, token } = useSelector(state => state.auth);
  const API = window.APP_CONFIG?.API_URL || '/api';

  const handleApprove = async () => {
    try {
      await axios.post(`${API}/chats/${chat.id}/approve-moderation`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApproved(true);
    } catch (error) {
      console.error('Error approving moderation:', error);
    }
  };

  const handleReject = async () => {
    try {
      // Здесь должна быть логика отклонения запроса
      setRejected(true);
    } catch (error) {
      console.error('Error rejecting moderation:', error);
    }
  };

  // Проверяем, может ли текущий пользователь подтвердить запрос
  const canApprove = moderationRequest.requested_by !== user.id;

  if (approved) {
    return (
      <div className="moderation-request">
        <div className="moderation-request__approved">
          ✅ Запрос на модерацию подтвержден. Ожидайте подключения модератора.
        </div>
      </div>
    );
  }

  if (rejected) {
    return (
      <div className="moderation-request">
        <div className="moderation-request__rejected">
          ❌ Запрос на модерацию отклонен.
        </div>
      </div>
    );
  }

  return (
    <div className="moderation-request">
      <div className="moderation-request__content">
        <h4>Запрос на подключение модератора</h4>
        <p>Другой участник чата запросил подключение модератора для помощи в разрешении ситуации.</p>
        {moderationRequest.reason && (
          <div className="moderation-request__reason">
            <strong>Причина:</strong> {moderationRequest.reason}
          </div>
        )}
        
        {canApprove ? (
          <div className="moderation-request__actions">
            <button className="btn btn--success" onClick={handleApprove}>
              Подтвердить подключение
            </button>
            <button className="btn btn--outline" onClick={handleReject}>
              Отклонить
            </button>
          </div>
        ) : (
          <div className="moderation-request__waiting">
            Ожидание подтверждения от другого участника...
          </div>
        )}
      </div>
    </div>
  );
};

export default ModerationRequest;