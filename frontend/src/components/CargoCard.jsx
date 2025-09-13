import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const CargoCard = ({ cargo }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const navigate = useNavigate();

  const handleViewDetails = () => {
    if (!isAuthenticated) {
      navigate('/auth?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    
    // Проверяем, есть ли подписка
    if (!user?.has_subscription) {
      navigate('/tariffs?require_subscription=true');
      return;
    }
    
    navigate(`/cargo/${cargo.id}`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <span className="status status-new">Новый</span>;
      case 'in_progress':
        return <span className="status status-in_progress">В пути</span>;
      case 'completed':
        return <span className="status status-completed">Доставлен</span>;
      default:
        return <span className="status">{status}</span>;
    }
  };

  return (
    <div className="cargo-card">
      <div className="cargo-card__header">
        <h3>{cargo.title}</h3>
        <div className="cargo-card__rating">
          ★ {cargo.rating?.toFixed(1) || '5.0'}
        </div>
      </div>
      
      <div className="cargo-card__body">
        <div className="cargo-card__route">
          <span>{cargo.origin}</span>
          <span className="cargo-card__route-icon">→</span>
          <span>{cargo.dest}</span>
        </div>
        
        <div className="cargo-card__price">
          {cargo.price} {cargo.currency}
        </div>
        
        <div className="cargo-card__meta">
          <span>Создан: {new Date(cargo.createdAt).toLocaleDateString()}</span>
          {getStatusBadge(cargo.status)}
        </div>
        
        {/* Полузашифрованные или полные данные в зависимости от подписки */}
        {cargo.driver_name && (
          <div>
            <strong>Водитель:</strong> {cargo.driver_name}
          </div>
        )}
        
        {cargo.customer_name && (
          <div>
            <strong>Заказчик:</strong> {cargo.customer_name}
          </div>
        )}
        
        {cargo.description && (
          <div>
            <strong>Описание:</strong> {cargo.description}
          </div>
        )}
        
        {!isAuthenticated && (
          <div className="cargo-card__hidden-data">
            Зарегистрируйтесь, чтобы увидеть полную информацию
          </div>
        )}
        
        {isAuthenticated && !user?.has_subscription && (
          <div className="cargo-card__hidden-data">
            Оформите подписку, чтобы увидеть контактные данные
          </div>
        )}
      </div>
      
      <div className="cargo-card__footer">
        <button 
          className="btn btn-outline"
          onClick={() => navigate(`/cargo/${cargo.id}`)}
        >
          Подробнее
        </button>
        
        {isAuthenticated && user?.has_subscription ? (
          <button className="btn">
            Связаться
          </button>
        ) : (
          <button className="btn" onClick={handleViewDetails}>
            {isAuthenticated ? 'Оформить подписку' : 'Войти'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CargoCard;