import { Api } from './api';

const api = new Api({
  appId: 'Aucctus',
  baseUrl: 'http://api-develop.aucctus.com', //import.meta.env.VITE_AUCCTUS_BASE_RESOURCE_URL || '',
  debug: import.meta.env.DEV,
  timeoutSeconds: 100000,
});

export default api;
