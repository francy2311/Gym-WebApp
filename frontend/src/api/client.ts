import axios from 'axios'
import { clearAuthSession, getManagedUserId, getStoredToken, redirectToLogin } from '../lib/auth'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  headers: {
    'Content-Type': 'application/json',
  },
})

client.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  const managedUser = getManagedUserId()
  if (managedUser && /^\/api\/(exercises|workouts|schedule|home)(\/|$)/.test(config.url ?? '')) {
    config.headers.set('X-Managed-User', managedUser)
  }

  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthSession()
      redirectToLogin()
    }

    return Promise.reject(error)
  },
)

export default client
