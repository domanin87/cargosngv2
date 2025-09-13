
import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Auth(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const nav = useNavigate()
  const API = window.APP_CONFIG?.API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000'

  async function doRegister(){
    try{
      await axios.post(`${API}/api/v1/auth/register`, { email, password })
      alert('Зарегистрирован')
      nav('/auth')
    }catch(e){ alert('Ошибка') }
  }
  async function doLogin(){
    try{
      const r = await axios.post(`${API}/api/v1/auth/login`, { email, password })
      localStorage.setItem('token', r.data.token)
      alert('Вход выполнен')
      nav('/dashboard')
    }catch(e){ alert('Ошибка входа') }
  }

  return (
    <section className="card auth-card">
      <h2>Вход / Регистрация</h2>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="Пароль" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <div style={{marginTop:10}}>
        <button className="btn" onClick={doLogin}>Войти</button>
        <button className="btn-outline" onClick={doRegister} style={{marginLeft:8}}>Зарегистрироваться</button>
      </div>
    </section>
  )
}
