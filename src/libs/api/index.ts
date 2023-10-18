import { Api } from './api'

const api = new Api({
  appId: "Aucctus",
  baseUrl: import.meta.env.VITE_AVXISI_BASE_URL || "",
  debug: import.meta.env.DEV,
  timeoutSeconds: 100000,
})

export default api