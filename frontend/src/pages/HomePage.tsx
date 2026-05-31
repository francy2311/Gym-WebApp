import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { getTodayWorkout } from '../api/scheduleApi'
import { APP_NAME, WEEK_DAYS } from '../constants/app'
import { usePageTitle } from '../hooks/usePageTitle'
import type { TodayWorkout, WorkoutExercise } from '../types/api'

export default function HomePage() {
  usePageTitle('Dashboard')
  const [today, setToday] = useState<TodayWorkout | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getTodayWorkout()
      .then(setToday)
      .catch(() => setError('Impossibile caricare l’allenamento di oggi.'))
      .finally(() => setLoading(false))
  }, [])

  const workout = today?.workoutAvailable ? today.workout : null

  return (
    <section className="workout-console">
      <header className="console-topbar">
        <div className="flex min-w-0 items-center gap-4">
          <p className="console-brand">{APP_NAME}</p>
          <div className="hidden h-5 w-px bg-white/10 sm:block" />
          <p className="text-xs text-[var(--color-muted)]">Sessione di oggi</p>
        </div>
      </header>

      {loading && <StateMessage text="Caricamento allenamento..." />}
      {error && <StateMessage tone="error" text={error} />}

      {!loading && !error && workout && (
        <WorkoutSession
          key={`workout-session-${workout.id}`}
          workout={workout}
          weekDay={today?.weekDay ?? ''}
        />
      )}

      {!loading && !error && !workout && (
        <p className="rounded-lg border border-white/10 bg-[#151c0e] p-5 text-sm text-[#dcefff]/70">
          {today?.message ||
            'Nessun allenamento associato a oggi. Vai nel Calendario per pianificare la settimana.'}
        </p>
      )}
    </section>
  )
}

type WorkoutSessionProps = {
  workout: NonNullable<TodayWorkout['workout']>
  weekDay: string
}

function WorkoutSession({ workout, weekDay }: WorkoutSessionProps) {
  const exercises = useMemo(
    () => [...(workout.exercises ?? [])].sort((a, b) => a.exerciseOrder - b.exerciseOrder),
    [workout.exercises],
  )
  const progressKey = `today-workout-progress-${workout.id}`
  const savedProgress = useMemo(() => readWorkoutProgress(progressKey), [progressKey])
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(savedProgress.currentExerciseIndex)
  const [completedSets, setCompletedSets] = useState<Record<string, number>>(savedProgress.completedSets)
  const [weights, setWeights] = useState<Record<string, Record<number, string>>>(savedProgress.weights)
  const [restRemaining, setRestRemaining] = useState(0)
  const [restActive, setRestActive] = useState(false)
  const maxExerciseIndex = Math.max(exercises.length - 1, 0)
  const activeExerciseIndex = Math.min(currentExerciseIndex, maxExerciseIndex)
  const currentItem = exercises[activeExerciseIndex]
  const currentItemKey = currentItem ? getExerciseKey(currentItem) : ''
  const currentCompletedSets = currentItemKey ? completedSets[currentItemKey] ?? 0 : 0
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
      }),
    )
  }, [activeExerciseIndex, completedSets, progressKey, weights])

  useEffect(() => {
    if (!restActive || restRemaining <= 0) return

    const timer = window.setInterval(() => {
      setRestRemaining((remaining) => {
        if (remaining <= 1) {
          window.clearInterval(timer)
          setRestActive(false)
          return 0
        }

        return remaining - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [restActive, restRemaining])

  const resetRestTimer = () => {
    setRestActive(false)
    setRestRemaining(0)
  }

  const goToExercise = (nextIndex: number) => {
    setCurrentExerciseIndex(Math.max(0, Math.min(nextIndex, maxExerciseIndex)))
    resetRestTimer()
  }

  const completeSet = (enteredWeight?: string) => {
    if (!currentItem || !currentItemKey) return

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

    if (nextValue >= currentItem.sets && activeExerciseIndex < maxExerciseIndex) {
      setCurrentExerciseIndex(activeExerciseIndex + 1)
    }

    setRestRemaining(currentItem.restSeconds)
    setRestActive(true)
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

  const startRest = (seconds?: number) => {
    if (seconds !== undefined) setRestRemaining(seconds)
    setRestActive(true)
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
                  <span>Target</span>
                  <span>Peso (kg)</span>
                  <span>Reps</span>
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
                      <span>{currentItem.reps} reps</span>
                      <span className="set-field">
                        {isCurrent ? (
                          <input
                            className="input"
                            style={{ width: 70 }}
                            placeholder="kg"
                            value={enteredWeight ?? ''}
                            onChange={(e) => onWeightChange(currentItemKey, setNumber, e.target.value)}
                          />
                        ) : isDone ? (
                          enteredWeight ?? '-'
                        ) : (
                          '-'
                        )}
                      </span>
                      <span className="set-field">{isDone || isCurrent ? currentItem.reps : '-'}</span>
                      <span className="justify-self-center">
                        {isDone ? (
                          <span className="set-check">✓</span>
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

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  className="next-set-button"
                  type="button"
                  onClick={() => completeSet(weights[currentItemKey]?.[currentCompletedSets + 1])}
                >
                  ▶ Prossima serie
                </button>
                <button
                  className="rest-button"
                  type="button"
                  onClick={() => startRest(currentItem.restSeconds)}
                >
                  ⏳ {restActive ? `${restRemaining}s` : `Recupero (${currentItem.restSeconds}s)`}
                </button>
              </div>
            </div>
          )}

          <div className="recovery-card">
            <div
              className="recovery-ring"
              style={
                {
                  '--progress': restRemaining
                    ? `${Math.round((restRemaining / (currentItem?.restSeconds ?? 1)) * 100)}%`
                    : '0%',
                } as CSSProperties
              }
            >
              {restRemaining}s
            </div>
            <div className="min-w-0">
              <h3>Recupero attivo</h3>
              <p>Gestisci il timer e preparati alla serie successiva.</p>
            </div>
            <div className="ml-auto flex gap-2">
              <button
                className="mini-button"
                type="button"
                onClick={() => setRestRemaining((r) => Math.max(r - 10, 0))}
              >
                -10s
              </button>
              <button
                className="mini-button"
                type="button"
                onClick={() => setRestRemaining((r) => r + 10)}
              >
                +10s
              </button>
              <button
                className="play-button"
                type="button"
                onClick={() => setRestActive((active) => !active)}
              >
                {restActive ? '⏸' : '▶'}
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
                  onClick={() => goToExercise(index)}
                >
                  <span className={`plan-dot ${completed ? 'plan-dot-done' : ''}`}>
                    {completed ? '✓' : ''}
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
        <div className="metric-box">
          <p>Intensità</p>
          <div className="intensity-bars">
            <span />
            <span />
            <span />
            <span className="muted" />
            <span className="muted" />
          </div>
        </div>
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

function readWorkoutProgress(progressKey: string) {
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
    }

    return {
      completedSets: parsed.completedSets ?? {},
      currentExerciseIndex: parsed.currentExerciseIndex ?? 0,
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
