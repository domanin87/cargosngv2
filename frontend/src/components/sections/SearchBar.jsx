import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CityAutocomplete from '../CityAutocomplete';

export default function SearchBar() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const { t } = useTranslation();
  const navigate = useNavigate();

  function doSearch(e) {
    e && e.preventDefault();
    navigate(`/cargo?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
  }

  return (
    <section className="hero card">
      <form onSubmit={doSearch} className="search-form">
        <div className="search-form__group">
          <label htmlFor="from">{t('from')}</label>
          <CityAutocomplete
            value={from}
            onChange={setFrom}
            placeholder={t('from')}
            className="search-form__input"
            id="from"
          />
        </div>
        
        <div className="search-form__group">
          <label htmlFor="to">{t('to')}</label>
          <CityAutocomplete
            value={to}
            onChange={setTo}
            placeholder={t('to')}
            className="search-form__input"
            id="to"
          />
        </div>
        
        <button className="btn search-form__button" type="submit">
          {t('find')}
        </button>
      </form>
    </section>
  );
}