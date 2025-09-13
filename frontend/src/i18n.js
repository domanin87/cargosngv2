import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Языки и флаги для фронтенда
export const SUPPORTED_LANGUAGES = [
  { code: 'ru', name: 'Русский', flag: '🇷🇺', country: 'RU' },
  { code: 'kk', name: 'Қазақша', flag: '🇰🇿', country: 'KZ' },
  { code: 'be', name: 'Беларуская', flag: '🇧🇾', country: 'BY' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦', country: 'UA' },
  { code: 'hy', name: 'Հայերեն', flag: '🇦🇲', country: 'AM' },
  { code: 'az', name: 'Azərbaycanca', flag: '🇦🇿', country: 'AZ' },
  { code: 'uz', name: 'Oʻzbekcha', flag: '🇺🇿', country: 'UZ' },
  { code: 'tg', name: 'Тоҷикӣ', flag: '🇹🇯', country: 'TJ' },
  { code: 'ky', name: 'Кыргызча', flag: '🇰🇬', country: 'KG' },
  { code: 'ro', name: 'Română', flag: '🇲🇩', country: 'MD' }
];

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ru',
    debug: process.env.NODE_ENV === 'development',
    supportedLngs: SUPPORTED_LANGUAGES.map(lang => lang.code),
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      caches: ['cookie', 'localStorage'],
      lookupQuerystring: 'lang',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
    },
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
  });

export default i18n;