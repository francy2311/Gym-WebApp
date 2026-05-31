export type WeekDay =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY'

export interface AuthResponse {
  tokenType: 'Bearer' | string
  accessToken: string
  expiresInSeconds: number
  userId: number
  username: string
  email: string
}

export interface User {
  id?: number
  name?: string
  email: string
}

export interface LoginRequest {
  usernameOrEmail: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export type MuscleGroup =
  | 'CHEST'
  | 'BACK'
  | 'SHOULDERS'
  | 'BICEPS'
  | 'TRICEPS'
  | 'LEGS'
  | 'GLUTES'
  | 'ABS'
  | 'FULL_BODY'
  | 'CARDIO'

export type EquipmentType =
  | 'BODYWEIGHT'
  | 'DUMBBELL'
  | 'BARBELL'
  | 'MACHINE'
  | 'CABLE'
  | 'KETTLEBELL'
  | 'RESISTANCE_BAND'
  | 'BENCH'
  | 'OTHER'

export type WorkoutGoal =
  | 'HYPERTROPHY'
  | 'STRENGTH'
  | 'ENDURANCE'
  | 'FAT_LOSS'
  | 'MOBILITY'
  | 'GENERAL_FITNESS'

export interface Exercise {
  id: number
  name: string
  description: string
  muscleGroup: MuscleGroup
  equipment?: EquipmentType | null
  imageUrl?: string | null
  notes?: string | null
}

export interface ExercisePayload {
  name: string
  description: string
  muscleGroup: MuscleGroup | ''
  equipment: EquipmentType | null
  imageUrl: string
  notes: string
}

export interface WorkoutExercise {
  id?: number
  exerciseId?: number
  exercise?: Exercise
  exerciseOrder: number
  sets: number
  reps: number
  restSeconds: number
  notes?: string
}

export interface Workout {
  id: number
  name: string
  description?: string
  goal?: WorkoutGoal | null
  exercises?: WorkoutExercise[]
}

export interface WorkoutPayload {
  name: string
  description?: string
  goal?: WorkoutGoal | null
}

export interface WorkoutExercisePayload {
  exerciseId: number
  exerciseOrder: number
  sets: number
  reps: number
  restSeconds: number
  notes?: string
}

export interface TodayWorkout {
  weekDay: WeekDay
  workoutAvailable: boolean
  workout: Workout | null
  message: string
}

export interface ScheduleEntry {
  id: number
  weekDay: WeekDay
  workout: Workout
}

export type Schedule = ScheduleEntry[]

export interface SchedulePayload {
  workoutId: number
  weekDays: WeekDay[]
}
