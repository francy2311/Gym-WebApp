import client from './client'
import type { Exercise, ExercisePayload } from '../types/api'

export const getExercises = async () => {
  const { data } = await client.get<Exercise[]>('/api/exercises')
  return data
}

export const createExercise = async (payload: ExercisePayload) => {
  const { data } = await client.post<Exercise>('/api/exercises', payload)
  return data
}

export const updateExercise = async (id: number, payload: ExercisePayload) => {
  const { data } = await client.put<Exercise>(`/api/exercises/${id}`, payload)
  return data
}

export const deleteExercise = async (id: number) => {
  await client.delete(`/api/exercises/${id}`)
}
