import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  createExercise,
  deleteExercise,
  getExercises,
  updateExercise,
} from '../api/exerciseApi'
import { APP_NAME, EMPTY_EXERCISE_FORM, EQUIPMENT_TYPES, MUSCLE_GROUPS } from '../constants/app'
import { usePageTitle } from '../hooks/usePageTitle'
import type {
  EquipmentType,
  Exercise,
  ExercisePayload,
  MuscleGroup,
} from '../types/api'

export default function ExercisesPage() {
  usePageTitle('Esercizi')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [form, setForm] = useState<ExercisePayload>(EMPTY_EXERCISE_FORM)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setExercises(await getExercises())
    } catch {
      setError('Impossibile caricare gli esercizi.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    const loadInitial = async () => {
      try {
        const data = await getExercises()
        if (active) {
          setExercises(data)
        }
      } catch {
        if (active) {
          setError('Impossibile caricare gli esercizi.')
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

    if (!form.name.trim() || !form.description.trim() || !form.muscleGroup) {
      setError('Nome, descrizione e gruppo muscolare sono obbligatori.')
      return
    }

    try {
      setSaving(true)
      const payload = {
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        notes: form.notes.trim(),
      }
      if (editingId) {
        await updateExercise(editingId, payload)
      } else {
        await createExercise(payload)
      }
      setForm(EMPTY_EXERCISE_FORM)
      setEditingId(null)
      await load()
    } catch {
      setError('Salvataggio esercizio non riuscito.')
    } finally {
      setSaving(false)
    }
  }

  const edit = (exercise: Exercise) => {
    setEditingId(exercise.id)
    setForm({
      name: exercise.name,
      description: exercise.description ?? '',
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment ?? null,
      imageUrl: exercise.imageUrl ?? '',
      notes: exercise.notes ?? '',
    })
  }

  const remove = async (id: number) => {
    if (!confirm('Eliminare questo esercizio?')) return
    try {
      setError('')
      await deleteExercise(id)
      await load()
    } catch {
      setError('Eliminazione esercizio non riuscita.')
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <p className="page-kicker">{APP_NAME}</p>
        <h2 className="page-title">Archivio esercizi</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Catalogo centralizzato degli esercizi disponibili in {APP_NAME}.
        </p>
      </header>

      <form onSubmit={submit} className="panel grid gap-4 lg:grid-cols-4">
        <label>
          <span className="label">Nome</span>
          <input
            className="input mt-1"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </label>
        <label>
          <span className="label">Gruppo muscolare</span>
          <select
            className="input mt-1"
            value={form.muscleGroup}
            onChange={(event) =>
              setForm({
                ...form,
                muscleGroup: event.target.value as MuscleGroup | '',
              })
            }
          >
            <option value="">Seleziona</option>
            {MUSCLE_GROUPS.map((group) => (
              <option key={group.value} value={group.value}>
                {group.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Attrezzatura</span>
          <select
            className="input mt-1"
            value={form.equipment ?? ''}
            onChange={(event) =>
              setForm({
                ...form,
                equipment: event.target.value
                  ? (event.target.value as EquipmentType)
                  : null,
              })
            }
          >
            <option value="">Non specificata</option>
            {EQUIPMENT_TYPES.map((equipment) => (
              <option key={equipment.value} value={equipment.value}>
                {equipment.label}
              </option>
            ))}
          </select>
        </label>
        <label className="lg:col-span-2">
          <span className="label">Descrizione</span>
          <input
            className="input mt-1"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
        </label>
        <label>
          <span className="label">URL immagine</span>
          <input
            className="input mt-1"
            value={form.imageUrl}
            onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
          />
        </label>
        <label>
          <span className="label">Note</span>
          <input
            className="input mt-1"
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
          />
        </label>
        <button className="btn-primary self-end lg:col-span-4" disabled={saving}>
          {editingId ? 'Aggiorna' : 'Crea'}
        </button>
      </form>

      {error && <p className="error-box">{error}</p>}
      {loading ? (
        <p className="panel text-sm text-[var(--color-muted)]">Caricamento esercizi...</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Gruppo</th>
                <th>Attrezzatura</th>
                <th>Descrizione</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {exercises.map((exercise) => (
                <tr key={exercise.id}>
                  <td className="font-semibold">{exercise.name}</td>
                  <td>{formatMuscleGroup(exercise.muscleGroup)}</td>
                  <td>{formatEquipment(exercise.equipment)}</td>
                  <td>{exercise.description || '-'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn-secondary" onClick={() => edit(exercise)}>
                        Modifica
                      </button>
                      <button className="btn-danger" onClick={() => void remove(exercise.id)}>
                        Elimina
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {exercises.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-[var(--color-muted)]">
                    Nessun esercizio creato.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function formatMuscleGroup(value: MuscleGroup) {
  return MUSCLE_GROUPS.find((group) => group.value === value)?.label ?? value
}

function formatEquipment(value?: EquipmentType | null) {
  if (!value) return '-'
  return EQUIPMENT_TYPES.find((equipment) => equipment.value === value)?.label ?? value
}
