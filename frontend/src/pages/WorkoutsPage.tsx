import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { APP_NAME, APP_ROUTES, EMPTY_WORKOUT, WORKOUT_GOALS } from '../constants/app'
import {
  createWorkout,
  deleteWorkout,
  getWorkouts,
  updateWorkout,
} from '../api/workoutApi'
import { usePageTitle } from '../hooks/usePageTitle'
import type { Workout, WorkoutGoal, WorkoutPayload } from '../types/api'

export default function WorkoutsPage() {
  usePageTitle('Allenamenti')
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [form, setForm] = useState<WorkoutPayload>(EMPTY_WORKOUT)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setWorkouts(await getWorkouts())
    } catch {
      setError('Impossibile caricare gli allenamenti.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    const loadInitial = async () => {
      try {
        const data = await getWorkouts()
        if (active) {
          setWorkouts(data)
        }
      } catch {
        if (active) {
          setError('Impossibile caricare gli allenamenti.')
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
  }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    if (!form.name.trim()) {
      setError('Il nome allenamento e obbligatorio.')
      return
    }

    const payload: WorkoutPayload = {
      name: form.name.trim(),
      description: form.description?.trim() ?? '',
      goal: form.goal ?? null,
    }

    try {
      setSaving(true)
      if (editingId) {
        await updateWorkout(editingId, payload)
      } else {
        await createWorkout(payload)
      }
      setForm(EMPTY_WORKOUT)
      setEditingId(null)
      await load()
    } catch {
      setError('Salvataggio allenamento non riuscito.')
    } finally {
      setSaving(false)
    }
  }

  const edit = (workout: Workout) => {
    setEditingId(workout.id)
    setForm({
      name: workout.name,
      description: workout.description ?? '',
      goal: workout.goal ?? null,
    })
  }

  const remove = async (id: number) => {
    if (!confirm('Eliminare questo allenamento?')) return
    try {
      setError('')
      await deleteWorkout(id)
      await load()
    } catch {
      setError('Eliminazione allenamento non riuscita.')
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <p className="page-kicker">{APP_NAME}</p>
        <h2 className="page-title">Schede di allenamento</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Crea e mantieni le schede riutilizzabili da assegnare al calendario.
        </p>
      </header>

      <form onSubmit={submit} className="panel grid gap-4 lg:grid-cols-[1fr_2fr_1fr_auto]">
        <label>
          <span className="label">Nome</span>
          <input
            className="input mt-1"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </label>
        <label>
          <span className="label">Descrizione</span>
          <input
            className="input mt-1"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
        </label>
        <label>
          <span className="label">Obiettivo</span>
          <select
            className="input mt-1"
            value={form.goal ?? ''}
            onChange={(event) =>
              setForm({
                ...form,
                goal: event.target.value ? (event.target.value as WorkoutGoal) : null,
              })
            }
          >
            <option value="">Non specificato</option>
            {WORKOUT_GOALS.map((goal) => (
              <option key={goal.value} value={goal.value}>
                {goal.label}
              </option>
            ))}
          </select>
        </label>
        <button className="btn-primary self-end" disabled={saving}>
          {editingId ? 'Aggiorna' : 'Crea'}
        </button>
      </form>

      {error && <p className="error-box">{error}</p>}
      {loading ? (
        <p className="panel text-sm text-[var(--color-muted)]">Caricamento allenamenti...</p>
      ) : (
        <div className="grid gap-3">
          {workouts.map((workout) => (
            <article key={workout.id} className="panel flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-bold tracking-normal">{workout.name}</h3>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {workout.description || 'Nessuna descrizione.'}
                </p>
                {workout.goal && (
                  <p className="mt-2 text-xs font-medium text-[var(--color-muted)]">
                    Obiettivo: {formatWorkoutGoal(workout.goal)}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Link className="btn-primary" to={`${APP_ROUTES.workouts}/${workout.id}`}>
                  Componi
                </Link>
                <button className="btn-secondary" onClick={() => edit(workout)}>
                  Modifica
                </button>
                <button className="btn-danger" onClick={() => void remove(workout.id)}>
                  Elimina
                </button>
              </div>
            </article>
          ))}
          {workouts.length === 0 && (
            <p className="panel text-sm text-[var(--color-muted)]">Nessun allenamento creato.</p>
          )}
        </div>
      )}
    </section>
  )
}

function formatWorkoutGoal(value: WorkoutGoal) {
  return WORKOUT_GOALS.find((goal) => goal.value === value)?.label ?? value
}
