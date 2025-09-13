
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import CargoCard from '../widgets/CargoCard.jsx'

export default function CargoList(){
  const [params] = useSearchParams()
  const from = params.get('from')
  const to = params.get('to')
  const [list, setList] = useState([])
  const API = window.APP_CONFIG?.API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(()=>{
    const q = []
    if(from) q.push(`from=${encodeURIComponent(from)}`)
    if(to) q.push(`to=${encodeURIComponent(to)}`)
    const url = `${API}/api/v1/cargos/list` + (q.length? `?${q.join('&')}` : '')
    axios.get(url).then(r=>setList(r.data)).catch(()=>{})
  },[from,to])

  return (
    <section className="card">
      <h2>Результаты поиска</h2>
      <div className="cargo-grid">
        {list.length===0 ? <div>Ничего не найдено</div> : list.map(c=> <CargoCard key={c.id} cargo={c} />)}
      </div>
    </section>
  )
}
