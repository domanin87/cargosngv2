
import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Header(){
  const { t } = useTranslation()
  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="brand">
          <Link to="/" className="brand-link">Транзит СНГ</Link>
        </div>
        <nav className="nav">
          <Link to="/cargo">{t('search')}</Link>
          <Link to="/dashboard">Кабинет</Link>
          <Link to="/auth">{t('login')}</Link>
        </nav>
      </div>
    </header>
  )
}
