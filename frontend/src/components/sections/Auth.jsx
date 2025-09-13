import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('customer');
  const [userType, setUserType] = useState('individual');
  const [company, setCompany] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const nav = useNavigate();
  const API = window.APP_CONFIG?.API_URL || '/api';

  async function doRegister() {
    try {
      const userData = { email, password, name, phone, role, user_type: userType };
      if (userType === 'legal' || role === 'carrier') {
        userData.company = company;
      }
      
      await axios.post(`${API}/auth/register`, userData);
      alert('Регистрация успешна');
      setIsRegister(false);
    } catch (e) { 
      alert('Ошибка регистрации: ' + (e.response?.data?.error || e.message));
    }
  }

  async function doLogin() {
    try {
      const r = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem('token', r.data.token);
      localStorage.setItem('user', JSON.stringify(r.data.user));
      alert('Вход выполнен');
      nav('/dashboard');
    } catch (e) { 
      alert('Ошибка входа: ' + (e.response?.data?.error || e.message));
    }
  }

  return (
    <section className="card auth-card">
      <h2>{isRegister ? 'Регистрация' : 'Вход'}</h2>
      
      {isRegister && (
        <>
          <input placeholder="Имя" value={name} onChange={e => setName(e.target.value)} />
          <input placeholder="Телефон" value={phone} onChange={e => setPhone(e.target.value)} />
          
          <div className="form-group">
            <label>Тип пользователя:</label>
            <select value={userType} onChange={e => setUserType(e.target.value)}>
              <option value="individual">Физическое лицо</option>
              <option value="legal">Юридическое лицо</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Роль:</label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="customer">Заказчик</option>
              <option value="carrier">Перевозчик</option>
            </select>
          </div>
          
          {(userType === 'legal' || role === 'carrier') && (
            <input placeholder="Компания" value={company} onChange={e => setCompany(e.target.value)} />
          )}
        </>
      )}
      
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} />
      
      <div style={{ marginTop: 10 }}>
        <button className="btn" onClick={isRegister ? doRegister : doLogin}>
          {isRegister ? 'Зарегистрироваться' : 'Войти'}
        </button>
        
        <button 
          className="btn-outline" 
          onClick={() => setIsRegister(!isRegister)}
          style={{ marginLeft: 8 }}
        >
          {isRegister ? 'Уже есть аккаунт?' : 'Создать аккаунт'}
        </button>
      </div>
    </section>
  );
}