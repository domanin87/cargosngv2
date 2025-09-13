import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import LanguageSwitcher from '../LanguageSwitcher';

export default function Header() {
  const { t } = useTranslation();
  const { user } = useSelector(state => state.auth);
  
  const isAdmin = user && ['employee', 'accountant', 'moderator', 'admin'].includes(user.role);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="brand">
          <Link to="/" className="brand-link">CargoSNG</Link>
        </div>
        <nav className="nav">
          <Link to="/cargo">{t('search')}</Link>
          {user ? (
            <>
              <Link to="/dashboard">Кабинет</Link>
              {isAdmin && <Link to="/admin">Админка</Link>}
              <Link to="/logout">Выйти</Link>
            </>
          ) : (
            <Link to="/auth">{t('login')}</Link>
          )}
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}