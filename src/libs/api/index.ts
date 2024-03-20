import { Api } from './api';

const api = new Api({
  appId: 'Aucctus',
  baseUrl: import.meta.env.VITE_AVXISI_BASE_URL || '',
  baseFastUrl: import.meta.env.VITE__AUCCTUS_BASE_FAST_URL || '',
  debug: import.meta.env.DEV,
  timeoutSeconds: 100000,
});

export default api;
