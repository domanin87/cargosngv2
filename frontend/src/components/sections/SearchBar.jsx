
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function SearchBar(){
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const { t } = useTranslation()
  const nav = useNavigate()
  function doSearch(e){
    e && e.preventDefault()
    // simple navigate to cargo list with query params
    nav(`/cargo?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
  }
  return (
    <section className="hero card">
      <form onSubmit={doSearch} className="search-form">
        <input placeholder={t('from')} value={from} onChange={e=>setFrom(e.target.value)} />
        <input placeholder={t('to')} value={to} onChange={e=>setTo(e.target.value)} />
        <button className="btn" type="submit">{t('find')}</button>
      </form>
    </section>
  )
}
