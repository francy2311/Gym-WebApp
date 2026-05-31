import { APP_ROUTES, AUTH_EVENT, INVALID_STORAGE_TOKENS, STORAGE_KEYS } from '../constants/app'

export function getStoredToken() {
  const token = localStorage.getItem(STORAGE_KEYS.token)
  if (!token || INVALID_STORAGE_TOKENS.has(token)) {
    return null
  }

  return token
}

export function isAuthenticated() {
  return getStoredToken() !== null
}

export function storeAuthToken(token: string) {
  localStorage.setItem(STORAGE_KEYS.token, token)
  window.dispatchEvent(new Event(AUTH_EVENT.changed))
}

export function clearAuthSession() {
  localStorage.removeItem(STORAGE_KEYS.token)
  window.dispatchEvent(new Event(AUTH_EVENT.changed))
}

export function redirectToLogin() {
  if (window.location.pathname !== APP_ROUTES.login) {
    window.location.replace(APP_ROUTES.login)
  }
}
