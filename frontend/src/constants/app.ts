import type {
  EquipmentType,
  ExercisePayload,
  MuscleGroup,
  WeekDay,
  WorkoutExercise,
  WorkoutGoal,
  WorkoutPayload,
} from '../types/api'

export const APP_NAME = 'Gym App'
export const APP_TAGLINE = 'Pianifica, esegui e monitora i tuoi allenamenti.'
export const APP_DESCRIPTION =
  'Frontend open source per la gestione di esercizi, schede e calendario fitness.'

export const APP_ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  exercises: '/exercises',
  workouts: '/workouts',
  schedule: '/schedule',
} as const

export const STORAGE_KEYS = {
  token: 'gym-app-token',
} as const

export const INVALID_STORAGE_TOKENS = new Set(['undefined', 'null', ''])

export const AUTH_EVENT = {
  changed: 'auth:changed',
} as const

export const NAV_ITEMS = [
  { to: APP_ROUTES.home, label: 'Dashboard' },
  { to: APP_ROUTES.exercises, label: 'Esercizi' },
  { to: APP_ROUTES.workouts, label: 'Allenamenti' },
  { to: APP_ROUTES.schedule, label: 'Calendario' },
] as const

export const WEEK_DAYS: Array<{ key: WeekDay; label: string }> = [
  { key: 'MONDAY', label: 'Lunedì' },
  { key: 'TUESDAY', label: 'Martedì' },
  { key: 'WEDNESDAY', label: 'Mercoledì' },
  { key: 'THURSDAY', label: 'Giovedì' },
  { key: 'FRIDAY', label: 'Venerdì' },
  { key: 'SATURDAY', label: 'Sabato' },
  { key: 'SUNDAY', label: 'Domenica' },
]

export const WORKOUT_GOALS: Array<{ value: WorkoutGoal; label: string }> = [
  { value: 'HYPERTROPHY', label: 'Ipertrofia' },
  { value: 'STRENGTH', label: 'Forza' },
  { value: 'ENDURANCE', label: 'Resistenza' },
  { value: 'FAT_LOSS', label: 'Dimagrimento' },
  { value: 'MOBILITY', label: 'Mobilità' },
  { value: 'GENERAL_FITNESS', label: 'Fitness generale' },
]

export const MUSCLE_GROUPS: Array<{ value: MuscleGroup; label: string }> = [
  { value: 'CHEST', label: 'Petto' },
  { value: 'BACK', label: 'Schiena' },
  { value: 'SHOULDERS', label: 'Spalle' },
  { value: 'BICEPS', label: 'Bicipiti' },
  { value: 'TRICEPS', label: 'Tricipiti' },
  { value: 'LEGS', label: 'Gambe' },
  { value: 'GLUTES', label: 'Glutei' },
  { value: 'ABS', label: 'Addome' },
  { value: 'FULL_BODY', label: 'Full body' },
  { value: 'CARDIO', label: 'Cardio' },
]

export const EQUIPMENT_TYPES: Array<{ value: EquipmentType; label: string }> = [
  { value: 'BODYWEIGHT', label: 'Corpo libero' },
  { value: 'DUMBBELL', label: 'Manubri' },
  { value: 'BARBELL', label: 'Bilanciere' },
  { value: 'MACHINE', label: 'Macchina' },
  { value: 'CABLE', label: 'Cavi' },
  { value: 'KETTLEBELL', label: 'Kettlebell' },
  { value: 'RESISTANCE_BAND', label: 'Elastico' },
  { value: 'BENCH', label: 'Panca' },
  { value: 'OTHER', label: 'Altro' },
]

export const EMPTY_WORKOUT: WorkoutPayload = {
  name: '',
  description: '',
  goal: null,
}

export const EMPTY_EXERCISE_FORM: ExercisePayload = {
  name: '',
  description: '',
  muscleGroup: '',
  equipment: null,
  imageUrl: '',
  notes: '',
}

export const EMPTY_WORKOUT_EXERCISE: WorkoutExercise = {
  exerciseId: 0,
  exerciseOrder: 1,
  sets: 3,
  reps: 10,
  restSeconds: 90,
  notes: '',
}
