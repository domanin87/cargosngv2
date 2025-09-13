
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
const resources = { ru:{ translation:{ search:'Поиск', price:'Цена', pay:'Оплатить' } }, en:{ translation:{ search:'Search', price:'Price', pay:'Pay' } } };
i18n.use(initReactI18next).init({ resources, lng: localStorage.getItem('lng')||'ru', fallbackLng:'ru', interpolation:{ escapeValue:false } });
export default i18n;
