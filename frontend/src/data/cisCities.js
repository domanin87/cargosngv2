export const CIS_CITIES = [
  // Россия
  { name: "Москва", country: "RU", lat: 55.7558, lng: 37.6173 },
  { name: "Санкт-Петербург", country: "RU", lat: 59.9343, lng: 30.3351 },
  { name: "Новосибирск", country: "RU", lat: 55.0084, lng: 82.9357 },
  { name: "Екатеринбург", country: "RU", lat: 56.8389, lng: 60.6057 },
  { name: "Казань", country: "RU", lat: 55.7961, lng: 49.1064 },
  { name: "Нижний Новгород", country: "RU", lat: 56.3269, lng: 44.0059 },
  { name: "Челябинск", country: "RU", lat: 55.1644, lng: 61.4368 },
  { name: "Самара", country: "RU", lat: 53.1959, lng: 50.1002 },
  { name: "Омск", country: "RU", lat: 54.9924, lng: 73.3686 },
  { name: "Ростов-на-Дону", country: "RU", lat: 47.2221, lng: 39.7203 },
  
  // Казахстан
  { name: "Алматы", country: "KZ", lat: 43.2389, lng: 76.8897 },
  { name: "Нур-Султан", country: "KZ", lat: 51.1694, lng: 71.4491 },
  { name: "Шымкент", country: "KZ", lat: 42.3417, lng: 69.5901 },
  { name: "Актобе", country: "KZ", lat: 50.2839, lng: 57.1667 },
  { name: "Караганда", country: "KZ", lat: 49.8047, lng: 73.1029 },
  { name: "Тараз", country: "KZ", lat: 42.9000, lng: 71.3667 },
  { name: "Усть-Каменогорск", country: "KZ", lat: 49.9550, lng: 82.6200 },
  { name: "Павлодар", country: "KZ", lat: 52.3000, lng: 76.9500 },
  { name: "Семей", country: "KZ", lat: 50.4111, lng: 80.2275 },
  
  // Украина
  { name: "Киев", country: "UA", lat: 50.4501, lng: 30.5234 },
  { name: "Харьков", country: "UA", lat: 49.9935, lng: 36.2304 },
  { name: "Одесса", country: "UA", lat: 46.4825, lng: 30.7233 },
  { name: "Днепр", country: "UA", lat: 48.4647, lng: 35.0462 },
  { name: "Донецк", country: "UA", lat: 48.0159, lng: 37.8029 },
  { name: "Запорожье", country: "UA", lat: 47.8388, lng: 35.1396 },
  { name: "Львов", country: "UA", lat: 49.8397, lng: 24.0297 },
  
  // Беларусь
  { name: "Минск", country: "BY", lat: 53.9045, lng: 27.5615 },
  { name: "Гомель", country: "BY", lat: 52.4345, lng: 30.9754 },
  { name: "Могилёв", country: "BY", lat: 53.9007, lng: 30.3314 },
  { name: "Витебск", country: "BY", lat: 55.1848, lng: 30.2016 },
  { name: "Гродно", country: "BY", lat: 53.6778, lng: 23.8297 },
  { name: "Брест", country: "BY", lat: 52.0976, lng: 23.7341 },
  
  // Узбекистан
  { name: "Ташкент", country: "UZ", lat: 41.2995, lng: 69.2401 },
  { name: "Самарканд", country: "UZ", lat: 39.6542, lng: 66.9597 },
  { name: "Наманган", country: "UZ", lat: 40.9959, lng: 71.6728 },
  { name: "Андижан", country: "UZ", lat: 40.7833, lng: 72.3333 },
  { name: "Нукус", country: "UZ", lat: 42.4647, lng: 59.6022 },
  
  // Другие страны СНГ
  { name: "Баку", country: "AZ", lat: 40.4093, lng: 49.8671 },
  { name: "Ереван", country: "AM", lat: 40.1792, lng: 44.4991 },
  { name: "Тбилиси", country: "GE", lat: 41.7151, lng: 44.8271 },
  { name: "Кишинев", country: "MD", lat: 47.0105, lng: 28.8638 },
  { name: "Душанбе", country: "TJ", lat: 38.5737, lng: 68.7738 },
  { name: "Ашхабад", country: "TM", lat: 37.9601, lng: 58.3261 },
  { name: "Бишкек", country: "KG", lat: 42.8746, lng: 74.5698 },
];

// Получение флага страны по коду
export const getCountryFlag = (countryCode) => {
  const flags = {
    RU: '🇷🇺',
    KZ: '🇰🇿',
    UA: '🇺🇦',
    BY: '🇧🇾',
    UZ: '🇺🇿',
    AZ: '🇦🇿',
    AM: '🇦🇲',
    GE: '🇬🇪',
    MD: '🇲🇩',
    TJ: '🇹🇯',
    TM: '🇹🇲',
    KG: '🇰🇬',
  };
  return flags[countryCode] || '🏳';
};