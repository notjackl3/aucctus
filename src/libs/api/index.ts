import { Api } from './api'

const api = new Api({
  appId: "Aucctus",
  authBaseUrl: import.meta.env.VITE_AVXISI_BASE_URL || "",
  debug: false,
  timeoutSeconds: 100000,
})

export default api