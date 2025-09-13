
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  ru: { translation: { search: "Поиск", from: "Откуда", to: "Куда", find: "Найти", price: "Цена", login:"Войти" } },
  en: { translation: { search: "Search", from: "From", to: "To", find: "Find", price: "Price", login:"Login" } }
}

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('lng') || 'ru',
  fallbackLng: 'ru',
  interpolation: { escapeValue: false }
})

export default i18n
