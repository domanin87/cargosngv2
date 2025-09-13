
import React from 'react'
export default function CargoCard({ cargo }){
  return (
    <article className="cargo-card">
      <h3>{cargo.title}</h3>
      <div className="meta">{cargo.origin} → {cargo.dest}</div>
      <div className="price">{cargo.price ? cargo.price + ' ' + cargo.currency : '—'}</div>
      <div className="actions">
        <button className="btn-outline">Подробнее</button>
        <button className="btn">Предложить</button>
      </div>
    </article>
  )
}
