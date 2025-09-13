import React from 'react';

export default function App() {
  const apiUrl = window.APP_CONFIG?.API_URL || "http://localhost:5000";
  return (
    <div style={{ fontFamily: 'Arial', padding: '2rem' }}>
      <h1>CargoSNG Frontend</h1>
      <p>API URL: {apiUrl}</p>
      <p>Фронтенд успешно работает 🚀</p>
    </div>
  );
}
