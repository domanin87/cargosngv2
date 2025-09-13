import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import SearchBar from './SearchBar';
import CargoCard from '../CargoCard';
import TariffCard from '../TariffCard';
import axios from 'axios';

export default function Home() {
  const [featuredCargos, setFeaturedCargos] = useState([]);
  const [tariffs, setTariffs] = useState([]);
  const { isAuthenticated } = useSelector(state => state.auth);
  const API = window.APP_CONFIG?.API_URL || '/api';

  useEffect(() => {
    // Загружаем популярные грузы
    axios.get(`${API}/cargos/list`)
      .then(response => setFeaturedCargos(response.data))
      .catch(error => console.error('Error loading cargos:', error));

    // Загружаем тарифы
    axios.get(`${API}/tariffs`)
      .then(response => setTariffs(response.data))
      .catch(error => console.error('Error loading tariffs:', error));
  }, []);

  return (
    <div>
      <SearchBar />
      
      <section className="container">
        <h2>Популярные перевозки</h2>
        <div className="cargo-grid">
          {featuredCargos.map(cargo => (
            <CargoCard key={cargo.id} cargo={cargo} />
          ))}
        </div>
      </section>

      {!isAuthenticated && (
        <section className="container" style={{ background: 'var(--bg)', padding: '40px 20px', borderRadius: '12px', margin: '40px 0' }}>
          <h2 style={{ textAlign: 'center' }}>Начните работать с CargoSNG</h2>
          <p style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 30px' }}>
            Зарегистрируйтесь и получите доступ к полной информации о грузах и перевозчиках, 
            а также возможность заключать сделки напрямую
          </p>
          <div style={{ textAlign: 'center' }}>
            <button 
              className="btn" 
              style={{ padding: '12px 24px', fontSize: '1.1rem' }}
              onClick={() => window.location.href = '/auth'}
            >
              Зарегистрироваться
            </button>
          </div>
        </section>
      )}

      <section className="container">
        <h2 style={{ textAlign: 'center' }}>Тарифы</h2>
        <p style={{ textAlign: 'center', marginBottom: '40px' }}>
          Выберите подходящий тариф для вашего бизнеса
        </p>
        
        <div className="tariff-grid">
          {tariffs.map((tariff, index) => (
            <TariffCard 
              key={tariff.id} 
              tariff={tariff} 
              isPopular={index === 1}
            />
          ))}
        </div>
      </section>
    </div>
  );
}