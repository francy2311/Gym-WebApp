import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { APP_NAME, APP_ROUTES, EMPTY_WORKOUT_EXERCISE } from '../constants/app'
import { getExercises } from '../api/exerciseApi'
import { getWorkout, updateWorkoutExercises } from '../api/workoutApi'
import { usePageTitle } from '../hooks/usePageTitle'
import type {
  Exercise,
  Workout,
  WorkoutExercise,
  WorkoutExercisePayload,
} from '../types/api'

export default function WorkoutDetailPage() {
  const { id } = useParams()
  const workoutId = Number(id)
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [items, setItems] = useState<WorkoutExercise[]>([])
  const [form, setForm] = useState<WorkoutExercise>(EMPTY_WORKOUT_EXERCISE)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const exerciseMap = useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise])),
    [exercises],
  )

  usePageTitle(workout?.name ? `Composizione ${workout.name}` : 'Composizione allenamento')

  useEffect(() => {
    let active = true

    const loadInitial = async () => {
      if (!Number.isFinite(workoutId) || workoutId <= 0) {
        if (active) {
          setError('ID allenamento non valido.')
          setLoading(false)
        }
        return
      }

      try {
        const [workoutData, exerciseData] = await Promise.all([
          getWorkout(workoutId),
          getExercises(),
        ])
        const normalized = (workoutData.exercises ?? []).map((item, index) => ({
          ...item,
          exerciseId: item.exerciseId ?? item.exercise?.id ?? 0,
          exerciseOrder: item.exerciseOrder ?? index + 1,
        }))

        if (active) {
          setWorkout(workoutData)
          setExercises(exerciseData)
          setItems(normalized.sort((a, b) => a.exerciseOrder - b.exerciseOrder))
          setForm({ ...EMPTY_WORKOUT_EXERCISE, exerciseId: exerciseData[0]?.id ?? 0 })
        }
      } catch {
        if (active) {
          setError('Impossibile caricare il dettaglio allenamento.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadInitial()

    return () => {
      active = false
    }
  }, [workoutId])

  const addItem = (event: FormEvent) => {
    event.preventDefault()
    if (!form.exerciseId) {
      setError('Seleziona un esercizio.')
      return
    }

    setError('')
    setItems((current) => [
      ...current,
      { ...form, exerciseOrder: current.length + 1 },
    ])
    setForm({ ...EMPTY_WORKOUT_EXERCISE, exerciseId: exercises[0]?.id ?? 0 })
  }

  const removeItem = (index: number) => {
    setItems((current) =>
      current
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({ ...item, exerciseOrder: itemIndex + 1 })),
    )
  }

  const moveItem = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= items.length) return

    const copy = [...items]
    const current = copy[index]
    copy[index] = copy[nextIndex]
    copy[nextIndex] = current
    setItems(copy.map((item, itemIndex) => ({ ...item, exerciseOrder: itemIndex + 1 })))
  }

  const save = async () => {
    setError('')
    if (!Number.isFinite(workoutId) || workoutId <= 0) {
      setError('ID allenamento non valido.')
      return
    }

    setSaving(true)
    try {
      const payload: WorkoutExercisePayload[] = items.map((item, index) => ({
        exerciseId: item.exerciseId ?? item.exercise?.id ?? 0,
        exerciseOrder: index + 1,
        sets: item.sets,
        reps: item.reps,
        restSeconds: item.restSeconds,
        notes: item.notes?.trim() ?? '',
      }))

      if (payload.some((item) => !item.exerciseId)) {
        setError('Tutti gli esercizi devono avere un exerciseId valido.')
        return
      }

      const saved = await updateWorkoutExercises(workoutId, payload)
      setWorkout(saved)
      setItems(
        (saved.exercises ?? [])
          .map((item, index) => ({
            ...item,
            exerciseId: item.exerciseId ?? item.exercise?.id ?? 0,
            exerciseOrder: item.exerciseOrder ?? index + 1,
          }))
          .sort((a, b) => a.exerciseOrder - b.exerciseOrder),
      )
    } catch {
      setError('Salvataggio composizione non riuscito.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="panel text-sm text-[var(--color-muted)]">Caricamento dettaglio...</p>
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="page-kicker">{APP_NAME}</p>
          <h2 className="page-title">{workout?.name ?? 'Allenamento'}</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {workout?.description || 'Definisci ordine, serie, ripetizioni e recuperi della scheda.'}
          </p>
        </div>
        <Link className="btn-secondary" to={APP_ROUTES.workouts}>
          Torna alla lista
        </Link>
      </header>

      {error && <p className="error-box">{error}</p>}

      <form onSubmit={addItem} className="panel grid gap-4 lg:grid-cols-6">
        <label className="lg:col-span-2">
          <span className="label">Esercizio</span>
          <select
            className="input mt-1"
            value={form.exerciseId}
            onChange={(event) => setForm({ ...form, exerciseId: Number(event.target.value) })}
          >
            <option value={0}>Seleziona</option>
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
        </label>
        <NumberField label="Serie" value={form.sets} onChange={(sets) => setForm({ ...form, sets })} />
        <NumberField label="Ripetizioni" value={form.reps} onChange={(reps) => setForm({ ...form, reps })} />
        <NumberField label="Recupero s" min={0} value={form.restSeconds} onChange={(restSeconds) => setForm({ ...form, restSeconds })} />
        <label>
          <span className="label">Note</span>
          <input
            className="input mt-1"
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
          />
        </label>
        <button className="btn-primary lg:col-span-6" type="submit">
          Aggiungi esercizio
        </button>
      </form>

      <div className="panel space-y-3">
        {items.map((item, index) => {
          const exercise = item.exerciseId
            ? exerciseMap.get(item.exerciseId) ?? item.exercise
            : item.exercise

          return (
            <div
              key={`${item.exerciseId}-${index}`}
              className="grid gap-3 rounded-md border border-[var(--color-line)] p-3 lg:grid-cols-[1fr_auto_auto] lg:items-center"
            >
              <div>
                <p className="font-semibold">{item.exerciseOrder}. {exercise?.name ?? `Esercizio #${item.exerciseId}`}</p>
                <p className="text-sm text-[var(--color-muted)]">
                  {item.sets} x {item.reps} · recupero {item.restSeconds}s
                </p>
                {item.notes && <p className="text-sm text-[var(--color-muted)]">{item.notes}</p>}
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={() => moveItem(index, -1)} type="button">
                  Su
                </button>
                <button className="btn-secondary" onClick={() => moveItem(index, 1)} type="button">
                  Giu
                </button>
              </div>
              <button className="btn-danger" onClick={() => removeItem(index)} type="button">
                Rimuovi
              </button>
            </div>
          )
        })}
        {items.length === 0 && (
          <p className="text-sm text-[var(--color-muted)]">Aggiungi esercizi per comporre l'allenamento.</p>
        )}
        <button className="btn-primary" onClick={() => void save()} disabled={saving}>
          {saving ? 'Salvataggio...' : 'Salva composizione'}
        </button>
      </div>
    </section>
  )
}

function NumberField({
  label,
  min = 1,
  value,
  onChange,
}: {
  label: string
  min?: number
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label>
      <span className="label">{label}</span>
      <input
        className="input mt-1"
        type="number"
        min={min}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}
