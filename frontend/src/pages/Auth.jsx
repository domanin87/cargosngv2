
import { useState } from 'react';
import axios from 'axios';
export default function Auth(){
  const [email,setEmail]=useState(''),[pass,setPass]=useState('');
  const API = import.meta.env.VITE_API_URL || window.VITE_API_URL || 'http://localhost:5000';
  const register = async ()=>{ await axios.post(`${API}/api/v1/auth/register`, { email, password: pass }); alert('registered'); };
  const login = async ()=>{ const r = await axios.post(`${API}/api/v1/auth/login`, { email, password: pass }); localStorage.setItem('token', r.data.token); alert('logged in'); };
  return (<div style={{padding:20}}><h3>Auth</h3><input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} /><br/><input placeholder="password" type="password" value={pass} onChange={e=>setPass(e.target.value)} /><br/><button onClick={register}>Register</button><button onClick={login} style={{marginLeft:8}}>Login</button></div>);
}
