import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const TariffCard = ({ tariff, isPopular = false }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const navigate = useNavigate();

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      navigate('/auth?redirect=/tariffs');
      return;
    }
    
    // Переходим к оформлению подписки
    navigate(`/subscribe/${tariff.id}`);
  };

  const getPriceDescription = () => {
    switch (tariff.type) {
      case 'per_order':
        return 'за заказ';
      case 'monthly':
        return 'в месяц';
      case 'quarterly':
        return 'за 3 месяца';
      case 'yearly':
        return 'в год';
      default:
        return '';
    }
  };

  const calculateDiscount = () => {
    if (!user) return 0;
    
    if (user.user_type === 'individual' && tariff.discount_individual > 0) {
      return tariff.discount_individual;
    } else if (user.user_type === 'legal' && tariff.discount_legal > 0) {
      return tariff.discount_legal;
    }
    
    return 0;
  };

  const calculateFinalPrice = () => {
    const discount = calculateDiscount();
    return discount > 0 ? tariff.price * (1 - discount / 100) : tariff.price;
  };

  const discount = calculateDiscount();
  const finalPrice = calculateFinalPrice();

  return (
    <div className={`tariff-card ${isPopular ? 'tariff-card--popular' : ''}`}>
      <div className="tariff-card__header">
        <h3>{tariff.name}</h3>
        {tariff.trial_days > 0 && (
          <div className="trial-badge">
            {tariff.trial_days} дней пробный период
          </div>
        )}
      </div>
      
      <div className="tariff-card__body">
        <div className="tariff-card__price">
          {finalPrice.toFixed(0)} {tariff.currency}
          {discount > 0 && (
            <>
              <br />
              <small style={{ textDecoration: 'line-through', color: 'var(--muted)', fontSize: '1rem' }}>
                {tariff.price} {tariff.currency}
              </small>
              <span className="discount-badge">-{discount}%</span>
            </>
          )}
        </div>
        
        <div className="tariff-card__price-period">
          {getPriceDescription()}
        </div>
        
        <ul className="tariff-card__features">
          {tariff.features?.map((feature, index) => (
            <li key={index} className="tariff-card__feature">
              <span className="tariff-card__feature-icon">✓</span>
              {feature}
            </li>
          ))}
          
          {tariff.order_limit > 0 ? (
            <li className="tariff-card__feature">
              <span className="tariff-card__feature-icon">✓</span>
              До {tariff.order_limit} заказов
            </li>
          ) : (
            <li className="tariff-card__feature">
              <span className="tariff-card__feature-icon">✓</span>
              Неограниченное количество заказов
            </li>
          )}
        </ul>
      </div>
      
      <div className="tariff-card__footer">
        <button className="btn" onClick={handleSubscribe}>
          {tariff.trial_days > 0 ? 'Начать пробный период' : 'Оформить подписку'}
        </button>
      </div>
    </div>
  );
};

export default TariffCard;