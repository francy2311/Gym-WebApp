import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { getDayWorkout } from '../api/scheduleApi'
import { APP_ROUTES, WEEK_DAYS } from '../constants/app'
import { usePageTitle } from '../hooks/usePageTitle'
import type { TodayWorkout, WorkoutExercise } from '../types/api'

export default function HomePage() {
  usePageTitle('Dashboard')
  const [today, setToday] = useState<TodayWorkout | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const day = new Date()
  const weekDay = WEEK_DAYS[(day.getDay() + 6) % 7].key
  const sessionDate = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`

  useEffect(() => {
    let active = true
    void getDayWorkout(weekDay)
      .then((result) => { if (active) setToday(result) })
      .catch(() => { if (active) setError('Impossibile caricare l’allenamento di oggi.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [weekDay])

  const workout = today?.workoutAvailable ? today.workout : null

  return (
    <section className="workout-console" aria-label="Sessione di oggi">
      {loading && <StateMessage text="Caricamento allenamento..." />}
      {error && <StateMessage tone="error" text={error} />}

      {!loading && !error && workout && (
        <WorkoutSession
          key={`workout-session-${workout.id}-${sessionDate}`}
          workout={workout}
          weekDay={weekDay}
          sessionDate={sessionDate}
        />
      )}

      {!loading && !error && !workout && (
        <div className="panel space-y-3">
          <p>Nessun allenamento previsto per oggi.</p>
          <Link className="btn-primary" to={APP_ROUTES.schedule}>Apri calendario</Link>
        </div>
      )}
    </section>
  )
}

type WorkoutSessionProps = {
  workout: NonNullable<TodayWorkout['workout']>
  weekDay: string
  sessionDate: string
}

const EMPTY_REST = { remaining: 0, duration: 0, deadline: null as number | null }

function WorkoutSession({ workout, weekDay, sessionDate }: WorkoutSessionProps) {
  const exercises = useMemo(
    () => [...(workout.exercises ?? [])].sort((a, b) => a.exerciseOrder - b.exerciseOrder),
    [workout.exercises],
  )
  const progressKey = `today-workout-progress-${workout.id}`
  const [savedProgress] = useState(() => readWorkoutProgress(progressKey, sessionDate))
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(savedProgress.currentExerciseIndex)
  const [completedSets, setCompletedSets] = useState<Record<string, number>>(savedProgress.completedSets)
  const [weights, setWeights] = useState<Record<string, Record<number, string>>>(savedProgress.weights)
  const [rest, setRest] = useState(EMPTY_REST)
  const restActive = rest.deadline !== null
  const maxExerciseIndex = Math.max(exercises.length - 1, 0)
  const activeExerciseIndex = Math.max(0, Math.min(currentExerciseIndex, maxExerciseIndex))
  const currentItem = exercises[activeExerciseIndex]
  const currentItemKey = currentItem ? getExerciseKey(currentItem) : ''
  const currentCompletedSets = currentItemKey ? completedSets[currentItemKey] ?? 0 : 0
  const canCompleteSet = Boolean(currentItem && currentCompletedSets < currentItem.sets)
  const totalSets = exercises.reduce((sum, item) => sum + item.sets, 0)
  const doneSets = exercises.reduce(
    (sum, item) => sum + Math.min(completedSets[getExerciseKey(item)] ?? 0, item.sets),
    0,
  )
  const remainingSets = Math.max(totalSets - doneSets, 0)
  const workoutProgress = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0
  const totalVolume = exercises.reduce((sum, item) => sum + item.sets * item.reps, 0)

  useEffect(() => {
    localStorage.setItem(
      progressKey,
      JSON.stringify({
        completedSets,
        currentExerciseIndex: activeExerciseIndex,
        weights,
        sessionDate,
      }),
    )
  }, [activeExerciseIndex, completedSets, progressKey, sessionDate, weights])

  useEffect(() => {
    const deadline = rest.deadline
    if (deadline === null) return
    const timer = window.setInterval(() => {
      const remaining = secondsUntil(deadline)
      setRest((current) => {
        if (current.deadline !== deadline || current.remaining === remaining) return current
        return { ...current, remaining, deadline: remaining > 0 ? deadline : null }
      })
    }, 200)

    return () => window.clearInterval(timer)
  }, [rest.deadline])

  const goToExercise = (nextIndex: number) => {
    setCurrentExerciseIndex(Math.max(0, Math.min(nextIndex, maxExerciseIndex)))
    setRest(EMPTY_REST)
  }

  const completeSet = (enteredWeight?: string) => {
    if (!currentItem || !canCompleteSet) return

    const setNumber = currentCompletedSets + 1
    if (enteredWeight !== undefined) {
      setWeights((current) => ({
        ...current,
        [currentItemKey]: { ...(current[currentItemKey] ?? {}), [setNumber]: enteredWeight },
      }))
    }

    const nextValue = Math.min(currentCompletedSets + 1, currentItem.sets)
    setCompletedSets((current) => ({
      ...current,
      [currentItemKey]: nextValue,
    }))

    if (nextValue === currentItem.sets && remainingSets > 1) {
      const pending = exercises.map((item, index) => ({ item, index }))
        .filter(({ item, index }) => index !== activeExerciseIndex && (completedSets[getExerciseKey(item)] ?? 0) < item.sets)
      const next = pending.find(({ index }) => index > activeExerciseIndex) ?? pending[0]
      if (next) setCurrentExerciseIndex(next.index)
    }

    startRest(remainingSets > 1 ? currentItem.restSeconds : 0)
  }

  const resetProgress = () => {
    setCompletedSets({})
    setWeights({})
    goToExercise(0)
  }

  const onWeightChange = (exerciseKey: string, setNumber: number, value: string) => {
    setWeights((current) => ({
      ...current,
      [exerciseKey]: { ...(current[exerciseKey] ?? {}), [setNumber]: value },
    }))
  }

  const startRest = (seconds: number) => {
    setRest(seconds > 0 ? { duration: seconds, remaining: seconds, deadline: Date.now() + seconds * 1000 } : EMPTY_REST)
  }

  const adjustRest = (seconds: number) => {
    setRest((current) => {
      const remaining = Math.max(0, (current.deadline === null ? current.remaining : secondsUntil(current.deadline)) + seconds)
      return {
        duration: Math.max(current.duration, remaining),
        remaining,
        deadline: current.deadline !== null && remaining > 0 ? Date.now() + remaining * 1000 : null,
      }
    })
  }

  const toggleRest = () => {
    setRest((current) => current.deadline === null
      ? { ...current, deadline: current.remaining > 0 ? Date.now() + current.remaining * 1000 : null }
      : { ...current, remaining: secondsUntil(current.deadline), deadline: null })
  }

  if (exercises.length === 0) {
    return (
      <div className="panel space-y-3">
        <h2 className="page-title">{workout.name}</h2>
        <p>Aggiungi esercizi alla scheda per iniziare la sessione.</p>
        <Link className="btn-primary" to={`${APP_ROUTES.workouts}/${workout.id}`}>Apri scheda</Link>
      </div>
    )
  }

  return (
    <>
      <div className="console-heading">
        <div className="min-w-0">
          <h2>{workout.name}</h2>
          <p>{workout.description || `Sessione programmata per ${formatWeekDay(weekDay)}`}</p>
        </div>
        <div className="w-full max-w-xs">
          <div className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-wide">
            <span className="text-[#ccff00]">{workoutProgress}%</span>
            <span className="text-[#dcefff]/70">Avanzamento</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#dcefff]/14">
            <div className="h-full rounded-full bg-[#ccff00]" style={{ width: `${workoutProgress}%` }} />
          </div>
        </div>
      </div>

      <div className="console-grid">
        <div className="space-y-4">
          {currentItem && (
            <div className="set-panel">
              <div className="set-panel-header">
                <div className="exercise-glyph">↗</div>
                <div className="min-w-0">
                  <h3>{getExerciseName(currentItem)}</h3>
                  <p>
                    {currentItem.sets} serie da {currentItem.reps} ripetizioni
                  </p>
                </div>
              </div>

              <div className="set-table">
                <div className="set-table-head">
                  <span>Serie</span>
                  <span>Reps</span>
                  <span>Peso (kg)</span>
                  <span>Stato</span>
                </div>
                {Array.from({ length: currentItem.sets }, (_, index) => {
                  const setNumber = index + 1
                  const isDone = setNumber <= currentCompletedSets
                  const isCurrent = setNumber === currentCompletedSets + 1
                  const enteredWeight = weights[currentItemKey]?.[setNumber]

                  return (
                    <div
                      key={setNumber}
                      className={`set-row ${isCurrent ? 'set-row-current' : ''} ${isDone ? 'set-row-done' : ''}`}
                    >
                      <span>{String(setNumber).padStart(2, '0')}</span>
                      <span>{currentItem.reps}</span>
                      <span className="set-field">
                        {isCurrent ? (
                          <input
                            className="input"
                            placeholder="kg"
                            aria-label={`Peso in kg per la serie ${setNumber}`}
                            inputMode="decimal"
                            value={enteredWeight ?? ''}
                            onChange={(e) => onWeightChange(currentItemKey, setNumber, e.target.value)}
                          />
                        ) : isDone ? (
                          enteredWeight ?? '-'
                        ) : (
                          '-'
                        )}
                      </span>
                      <span className="justify-self-center">
                        {isDone ? (
                          <span className="set-check" aria-label="Serie completata">✓</span>
                        ) : isCurrent ? (
                          <button
                            className="set-finish"
                            type="button"
                            onClick={() => completeSet(enteredWeight)}
                          >
                            Completa
                          </button>
                        ) : (
                          <span className="set-empty" />
                        )}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="grid gap-3 p-4 sm:grid-cols-2">
                <button
                  className="next-set-button"
                  type="button"
                  disabled={!canCompleteSet}
                  onClick={() => completeSet(weights[currentItemKey]?.[currentCompletedSets + 1])}
                >
                  {canCompleteSet ? 'Completa serie' : 'Serie completate'}
                </button>
                <button
                  className="rest-button"
                  type="button"
                  disabled={currentItem.restSeconds === 0}
                  onClick={() => startRest(currentItem.restSeconds)}
                >
                  Avvia recupero ({currentItem.restSeconds}s)
                </button>
              </div>
            </div>
          )}

          <div className="recovery-card">
            <div
              className="recovery-ring"
              style={
                {
                  '--progress': rest.duration > 0
                    ? `${Math.round((rest.remaining / rest.duration) * 100)}%`
                    : '0%',
                } as CSSProperties
              }
            >
              <span>{rest.remaining}s</span>
            </div>
            <div className="min-w-0">
              <h3>Recupero</h3>
              <p role="status">{restActive ? 'Timer in corso' : rest.remaining > 0 ? 'Timer in pausa' : 'Timer fermo'}</p>
            </div>
            <div className="ml-auto flex gap-2">
              <button
                className="mini-button"
                type="button"
                disabled={rest.remaining === 0}
                aria-label="Togli 10 secondi"
                onClick={() => adjustRest(-10)}
              >
                -10s
              </button>
              <button
                className="mini-button"
                type="button"
                aria-label="Aggiungi 10 secondi"
                onClick={() => adjustRest(10)}
              >
                +10s
              </button>
              <button
                className="play-button"
                type="button"
                disabled={rest.remaining === 0}
                onClick={toggleRest}
              >
                {restActive ? 'Pausa' : 'Avvia'}
              </button>
            </div>
          </div>
        </div>

        <aside className="plan-panel">
          <div className="mb-8 flex items-center justify-between">
            <h3>Piano esercizi</h3>
            <span className="text-xs font-bold text-[#ccff00]">{exercises.length}</span>
          </div>
          <div className="space-y-3">
            {exercises.map((item, index) => {
              const completed = (completedSets[getExerciseKey(item)] ?? 0) >= item.sets
              const active = index === activeExerciseIndex

              return (
                <button
                  key={`${item.id ?? item.exercise?.id}-${item.exerciseOrder}`}
                  className={`plan-item ${active ? 'plan-item-active' : ''}`}
                  type="button"
                  aria-pressed={active}
                  onClick={() => goToExercise(index)}
                >
                  <span className={`plan-dot ${completed ? 'plan-dot-done' : ''}`}>
                    {completed ? '✓' : index + 1}
                  </span>
                  <span className="min-w-0 text-left">
                    <strong>{getExerciseName(item)}</strong>
                    <small>{item.sets} serie</small>
                  </span>
                </button>
              )
            })}
          </div>
        </aside>
      </div>

      <div className="console-metrics">
        <MetricBox label="Volume totale" value={`${totalVolume} reps`} />
        <MetricBox label="Serie completate" value={`${doneSets}/${totalSets}`} />
        <MetricBox label="Serie residue" value={`${remainingSets} serie`} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="btn-secondary"
          type="button"
          onClick={() => goToExercise(activeExerciseIndex - 1)}
          disabled={activeExerciseIndex === 0}
        >
          Precedente
        </button>
        <button
          className="btn-secondary"
          type="button"
          onClick={() => goToExercise(activeExerciseIndex + 1)}
          disabled={activeExerciseIndex >= maxExerciseIndex}
        >
          Prossimo esercizio
        </button>
        <button className="btn-secondary" type="button" onClick={resetProgress}>
          Azzera
        </button>
      </div>
    </>
  )
}

function secondsUntil(deadline: number) {
  return Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
}

function readWorkoutProgress(progressKey: string, sessionDate: string) {
  const emptyProgress = {
    completedSets: {} as Record<string, number>,
    currentExerciseIndex: 0,
    weights: {} as Record<string, Record<number, string>>,
  }

  const savedProgress = localStorage.getItem(progressKey)
  if (!savedProgress) return emptyProgress

  try {
    const parsed = JSON.parse(savedProgress) as {
      completedSets?: Record<string, number>
      currentExerciseIndex?: number
      weights?: Record<string, Record<number, string>>
      sessionDate?: string
    }

    if (parsed.sessionDate && parsed.sessionDate !== sessionDate) return emptyProgress

    return {
      completedSets: parsed.completedSets ?? {},
      currentExerciseIndex: Number.isInteger(parsed.currentExerciseIndex) ? parsed.currentExerciseIndex ?? 0 : 0,
      weights: parsed.weights ?? {},
    }
  } catch {
    return emptyProgress
  }
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-box">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  )
}

function getExerciseKey(item: WorkoutExercise) {
  return `${item.id ?? item.exerciseId ?? item.exercise?.id ?? 'exercise'}-${item.exerciseOrder}`
}

function getExerciseName(item: WorkoutExercise) {
  return item.exercise?.name ?? `Esercizio #${item.exerciseId ?? item.id}`
}

function formatWeekDay(weekDay: string) {
  return WEEK_DAYS.find((day) => day.key === weekDay)?.label ?? 'oggi'
}

function StateMessage({
  text,
  tone = 'default',
}: {
  text: string
  tone?: 'default' | 'error'
}) {
  return (
    <p
      className={`rounded-md border p-4 text-sm ${
        tone === 'error'
          ? 'border-[rgba(248,113,113,0.28)] bg-[rgba(248,113,113,0.12)] text-[#fecaca]'
          : 'border-white/10 bg-[#151c0e] text-[#dcefff]/70'
      }`}
    >
      {text}
    </p>
  )
}
