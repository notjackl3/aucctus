import { Api } from './api'

const api = new Api({
  appId: "",
  authBaseUrl: "",
  debug: true,
  timeoutSeconds: 3000,
})

export default api