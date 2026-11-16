import { useCallback, useEffect, useMemo, useState } from 'react'
import { APP_NAME, WEEK_DAYS } from '../constants/app'
import { getSchedule, removeScheduleDay, updateSchedule } from '../api/scheduleApi'
import { getWorkouts } from '../api/workoutApi'
import { usePageTitle } from '../hooks/usePageTitle'
import type { Schedule, SchedulePayload, WeekDay, Workout } from '../types/api'

export default function SchedulePage() {
  usePageTitle('Calendario')
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [schedule, setSchedule] = useState<Schedule>([])
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<number>(0)
  const [selectedDays, setSelectedDays] = useState<WeekDay[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const scheduleByDay = useMemo(
    () => new Map(schedule.map((entry) => [entry.weekDay, entry.workout])),
    [schedule],
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [scheduleData, workoutData] = await Promise.all([getSchedule(), getWorkouts()])
      setSchedule(scheduleData)
      setWorkouts(workoutData)
      setSelectedWorkoutId((current) => current || workoutData[0]?.id || 0)
    } catch {
      setError('Impossibile caricare calendario e allenamenti.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    const loadInitial = async () => {
      try {
        const [scheduleData, workoutData] = await Promise.all([getSchedule(), getWorkouts()])
        if (active) {
          setSchedule(scheduleData)
          setWorkouts(workoutData)
          setSelectedWorkoutId(workoutData[0]?.id || 0)
        }
      } catch {
        if (active) {
          setError('Impossibile caricare calendario e allenamenti.')
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

  const toggleDay = (day: WeekDay) => {
    setSelectedDays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day],
    )
  }

  const assignWorkout = async () => {
    setError('')
    setSuccess('')

    if (!selectedWorkoutId) {
      setError('Seleziona un allenamento.')
      return
    }

    if (selectedDays.length === 0) {
      setError('Seleziona almeno un giorno.')
      return
    }

    const payload: SchedulePayload = {
      workoutId: selectedWorkoutId,
      weekDays: selectedDays,
    }

    try {
      setSaving(true)
      await updateSchedule(payload)
      await load()
      setSelectedDays([])
      setSuccess('Calendario aggiornato.')
    } catch {
      setError('Salvataggio calendario non riuscito.')
    } finally {
      setSaving(false)
    }
  }

  async function unassign(day: WeekDay) {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await removeScheduleDay(day)
      setSchedule((current) => current.filter((entry) => entry.weekDay !== day))
      setSuccess('Assegnazione rimossa.')
    } catch {
      setError('Impossibile rimuovere l’assegnazione.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <p className="page-kicker">{APP_NAME}</p>
        <h2 className="page-title">Calendario settimanale</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Assegna le schede ai giorni della settimana e mantieni il piano in ordine.
        </p>
      </header>

      <div className="panel grid gap-4 lg:grid-cols-[1fr_2fr_auto]">
        <label>
          <span className="label">Allenamento</span>
          <select
            className="input mt-1"
            value={selectedWorkoutId}
            onChange={(event) => setSelectedWorkoutId(Number(event.target.value))}
            disabled={workouts.length === 0}
          >
            <option value={0}>Seleziona</option>
            {workouts.map((workout) => (
              <option key={workout.id} value={workout.id}>
                {workout.name}
              </option>
            ))}
          </select>
        </label>

        <div>
          <span className="label">Giorni</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {WEEK_DAYS.map((day) => (
              <button
                key={day.key}
                type="button"
                onClick={() => toggleDay(day.key)}
                className={
                  selectedDays.includes(day.key)
                    ? 'btn-primary'
                    : 'btn-secondary'
                }
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn-primary self-end"
          onClick={() => void assignWorkout()}
          disabled={saving || loading}
        >
          {saving ? 'Salvataggio...' : 'Assegna'}
        </button>
      </div>

      {error && <p className="error-box">{error}</p>}
      {success && <p className="success-box">{success}</p>}

      {loading ? (
        <p className="panel text-sm text-[var(--color-muted)]">Caricamento calendario...</p>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {WEEK_DAYS.map((day) => {
            const workout = scheduleByDay.get(day.key)

            return (
              <article key={day.key} className="panel">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-bold">{day.label}</h3>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      {workout
                        ? workout.description || workout.name
                        : 'Riposo o non assegnato'}
                    </p>
                  </div>
                  {workout ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="badge">{workout.name}</span>
                      <button className="btn-secondary" disabled={saving} onClick={() => void unassign(day.key)}>
                        Rimuovi assegnazione
                      </button>
                    </div>
                  ) : (
                    <span className="badge">Vuoto</span>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
