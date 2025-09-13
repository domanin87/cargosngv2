import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import PaymentForm from '../widgets/PaymentForm';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const API = window.APP_CONFIG?.API_URL || '/api';

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/orders/${orderId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Заказ принят!');
      fetchOrders();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  if (!user) {
    return <div>Загрузка...</div>;
  }

  return (
    <section className="card">
      <h2>Личный кабинет</h2>
      
      <div className="user-info">
        <h3>{user.name}</h3>
        <p>Email: {user.email}</p>
        <p>Роль: {user.role === 'customer' ? 'Заказчик' : 'Перевозчик'}</p>
        <p>Баланс: {user.balance || 0} ₸</p>
        <p>Бонусы: {user.bonus_balance || 0} баллов</p>
        {user.role === 'carrier' && (
          <>
            <p>Рейтинг: {user.rating}/5</p>
            <p>Выполнено заказов: {user.completedOrders}</p>
          </>
        )}
      </div>
      
      <h3>Мои заказы</h3>
      <div className="orders-list">
        {orders.length === 0 ? (
          <p>У вас пока нет заказов</p>
        ) : (
          orders.map(order => (
            <div key={order.id} className="order-card">
              <h4>Заказ #{order.id}</h4>
              <p>Статус: {order.status}</p>
              <p>Оплата: {order.paymentStatus}</p>
              <p>Сумма: {order.price} ₸</p>
              
              {user.role === 'customer' && order.paymentStatus === 'pending' && (
                <button 
                  className="btn"
                  onClick={() => setSelectedOrder(order)}
                >
                  Оплатить
                </button>
              )}
              
              {user.role === 'carrier' && order.status === 'pending' && (
                <button 
                  className="btn"
                  onClick={() => handleAcceptOrder(order.id)}
                >
                  Принять заказ
                </button>
              )}
            </div>
          ))
        )}
      </div>
      
      {selectedOrder && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setSelectedOrder(null)}>&times;</span>
            <PaymentForm 
              order={selectedOrder} 
              onSuccess={() => {
                setSelectedOrder(null);
                fetchOrders();
              }} 
            />
          </div>
        </div>
      )}
    </section>
  );
}