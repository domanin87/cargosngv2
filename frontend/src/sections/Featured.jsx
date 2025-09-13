
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import CargoCard from '../widgets/CargoCard.jsx'

export default function Featured(){
  const [list, setList] = useState([])
  const API = window.APP_CONFIG?.API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(()=>{
    axios.get(`${API}/api/v1/cargos/list`).then(r=>setList(r.data)).catch(()=>{})
  },[])

  return (
    <section className="card">
      <h2>Последние грузы</h2>
      <div className="cargo-grid">
        {list.length===0 ? <div>Грузов пока нет</div> : list.map(c=> <CargoCard key={c.id} cargo={c} />)}
      </div>
    </section>
  )
}
