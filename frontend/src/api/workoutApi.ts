import client from './client'
import type { Workout, WorkoutExercisePayload, WorkoutPayload } from '../types/api'

export const getWorkouts = async () => {
  const { data } = await client.get<Workout[]>('/api/workouts')
  return data
}

export const getWorkout = async (id: number) => {
  const { data } = await client.get<Workout>(`/api/workouts/${id}`)
  return data
}

export const createWorkout = async (payload: WorkoutPayload) => {
  const { data } = await client.post<Workout>('/api/workouts', payload)
  return data
}

export const updateWorkout = async (id: number, payload: WorkoutPayload) => {
  const { data } = await client.put<Workout>(`/api/workouts/${id}`, payload)
  return data
}

export const deleteWorkout = async (id: number) => {
  await client.delete(`/api/workouts/${id}`)
}

export const updateWorkoutExercises = async (
  id: number,
  exercises: WorkoutExercisePayload[],
) => {
  const { data } = await client.put<Workout>(
    `/api/workouts/${id}/exercises`,
    exercises,
  )
  return data
}
