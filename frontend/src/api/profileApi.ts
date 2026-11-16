import client from './client'
import type { AuthResponse, Profile } from '../types/api'

type IdentityUpdate = Pick<Profile, 'username' | 'email'> & { newPassword?: string }

export async function getProfile() {
  const { data } = await client.get<Profile>('/api/profile')
  return data
}

export async function updateProfile(payload: IdentityUpdate & { currentPassword: string }) {
  const { data } = await client.put<AuthResponse>('/api/profile', payload)
  return data
}

export async function getUsers() {
  const { data } = await client.get<Profile[]>('/api/admin/users')
  return data
}

export async function updateUser(id: number, payload: IdentityUpdate & { enabled: boolean }) {
  const { data } = await client.put<Profile>(`/api/admin/users/${id}`, payload)
  return data
}
