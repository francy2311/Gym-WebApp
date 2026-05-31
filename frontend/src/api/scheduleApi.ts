import client from './client'
import type {
  Schedule,
  ScheduleEntry,
  SchedulePayload,
  TodayWorkout,
  WeekDay,
} from '../types/api'

export const getTodayWorkout = async () => {
  const { data } = await client.get<TodayWorkout | null>('/api/home/today')
  return data
}

export const getDayWorkout = async (weekDay: WeekDay) => {
  const { data } = await client.get<TodayWorkout | null>(`/api/home/day/${weekDay}`)
  return data
}

export const getSchedule = async () => {
  const { data } = await client.get<Schedule>('/api/schedule')
  return data
}

export const updateSchedule = async (payload: SchedulePayload) => {
  const { data } = await client.put<Schedule>('/api/schedule', payload)
  return data
}

export const getScheduleDay = async (weekDay: WeekDay) => {
  const { data } = await client.get<ScheduleEntry | null>(`/api/schedule/${weekDay}`)
  return data
}
