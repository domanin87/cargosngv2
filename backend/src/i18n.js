
const i18next = require('i18next');
const middleware = require('i18next-http-middleware');
const SUPPORTED = ['ru','kk','ky','uz','tg','hy','az','be','ro','uk','en'];
i18next.use(middleware.LanguageDetector).init({
  fallbackLng: 'ru',
  preload: SUPPORTED,
  supportedLngs: SUPPORTED,
  detection: { order:['querystring','header','cookie'], caches:['cookie'] }
});
module.exports = { i18next, middleware, SUPPORTED };
