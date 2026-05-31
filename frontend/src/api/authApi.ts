import client from './client'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/api'

export const login = async (payload: LoginRequest) => {
  const { data } = await client.post<AuthResponse>('/api/auth/login', payload)
  return data
}

export const register = async (payload: RegisterRequest) => {
  const { data } = await client.post<AuthResponse>('/api/auth/register', payload)
  return data
}
