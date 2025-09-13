import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

async function bootstrap() {
  try {
    const resp = await fetch('/config.json', { cache: 'no-store' });
    if (resp.ok) {
      window.APP_CONFIG = await resp.json();
    } else {
      window.APP_CONFIG = {};
      console.warn("config.json not found, using defaults");
    }
  } catch (err) {
    window.APP_CONFIG = {};
    console.error("Failed to load config.json", err);
  }

  createRoot(document.getElementById('root')).render(<App />);
}

bootstrap();
