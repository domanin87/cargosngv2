
import { useState, useEffect } from 'react';
import axios from 'axios';
export default function Home(){
  const [list,setList]=useState([]);
  const API = import.meta.env.VITE_API_URL || window.VITE_API_URL || 'http://localhost:5000';
  useEffect(()=>{ axios.get(`${API}/api/v1/cargos/list`).then(r=>setList(r.data)).catch(()=>{}); },[]);
  return (<div><div className="header"><div className="container"><strong style={{color:'#0ea5a4'}}>CargoSNG</strong></div></div><div className="container"><div className="card"><h3>Грузы</h3>{list.map(i=> (<div key={i.id} style={{padding:8,borderBottom:'1px solid #eee'}}><strong>{i.title}</strong><div style={{color:'#6b7280'}}>{i.origin} → {i.dest}</div><div style={{color:'#10b981'}}>{i.price} {i.currency}</div></div>))}</div></div></div>);
}
