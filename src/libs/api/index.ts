import { Api } from './api';

const api = new Api({
  appId: 'Aucctus',
  baseUrl: import.meta.env.VITE_AUCCTUS_BASE_RESOURCE_URL || '',
  baseSocketUrl: import.meta.env.VITE_AUCCTUS_BASE_WS_URL || '',
  debug: __ENVIRONMENT__ === 'development',
  timeoutSeconds: 100000,
});

export default api;
