import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { getUsers, updateUser } from '../api/profileApi'
import { APP_ROUTES } from '../constants/app'
import { usePageTitle } from '../hooks/usePageTitle'
import { setManagedUserId } from '../lib/auth'
import type { Profile } from '../types/api'

export default function AdminPage() {
  usePageTitle('Admin')
  const actor = useOutletContext<Profile>()
  const [users, setUsers] = useState<Profile[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const selected = users.find((user) => user.id === selectedId)
  const query = search.trim().toLowerCase()
  const visibleUsers = users.filter((user) =>
    user.username.toLowerCase().includes(query) || user.email.toLowerCase().includes(query),
  )

  useEffect(() => {
    if (!actor.admin) return
    let active = true
    void getUsers().then((data) => {
      if (active) setUsers(data)
    }).catch(() => {
      if (active) setError('Impossibile caricare gli utenti.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [actor.admin])

  if (!actor.admin) {
    return <p className="error-box">Questa pagina è riservata agli amministratori.</p>
  }

  function manageUser(id: number, route: string) {
    setManagedUserId(id === actor.id ? null : id)
    window.location.assign(route)
  }

  return (
    <section className="space-y-6">
      <h2 className="page-title">Amministrazione</h2>
      <div className="panel flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold">Catalogo condiviso</h3>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Aggiungi o modifica gli esercizi disponibili a tutti.</p>
        </div>
        <Link className="btn-secondary" to={APP_ROUTES.exercises}>Gestisci esercizi</Link>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h3 className="text-lg font-bold">Utenti</h3>
        <label className="w-full sm:w-72">
          <span className="label">Cerca per nome utente o email</span>
          <input className="input mt-1" type="search" value={search}
            onChange={(event) => setSearch(event.target.value)} />
        </label>
      </div>
      {error && <p role="alert" className="error-box">{error}</p>}
      {loading && <p role="status">Caricamento utenti…</p>}
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Nome utente</th><th>Email</th><th>Ruolo</th><th>Stato</th><th>Azioni</th></tr></thead>
          <tbody>
            {visibleUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.admin ? 'Admin' : 'Utente'}</td>
                <td>{user.enabled ? 'Attivo' : 'Disattivato'}</td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    {user.id === actor.id ? (
                      <Link className="btn-secondary" to={APP_ROUTES.profile}>Profilo</Link>
                    ) : (
                      <button type="button" className="btn-secondary" onClick={() => setSelectedId(user.id)}>
                        Modifica dati
                      </button>
                    )}
                    <button type="button" className="btn-secondary" onClick={() => manageUser(user.id, APP_ROUTES.workouts)}>
                      Allenamenti
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => manageUser(user.id, APP_ROUTES.schedule)}>
                      Calendario
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && !error && visibleUsers.length === 0 && (
              <tr><td colSpan={5}>Nessun utente trovato.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {selected && (
        <UserEditor key={selected.id} user={selected} onSave={(saved) => {
          setUsers((current) => current.map((user) => user.id === saved.id ? saved : user))
        }} onCancel={() => setSelectedId(null)} />
      )}
    </section>
  )
}

function UserEditor({ user, onSave, onCancel }: {
  user: Profile
  onSave: (user: Profile) => void
  onCancel: () => void
}) {
  const [username, setUsername] = useState(user.username)
  const [email, setEmail] = useState(user.email)
  const [enabled, setEnabled] = useState(user.enabled)
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setNotice('')
    setError('')
    try {
      onSave(await updateUser(user.id, {
        username: username.trim(),
        email: email.trim(),
        enabled,
        newPassword: newPassword || undefined,
      }))
      setNewPassword('')
      setNotice('Account aggiornato.')
    } catch {
      setError('Salvataggio non riuscito. Controlla i dati inseriti.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="panel grid gap-4 sm:grid-cols-2">
      <h3 className="font-bold sm:col-span-2">Modifica account {user.username}</h3>
      <label>
        <span className="label">Nome utente</span>
        <input className="input mt-1" required minLength={3} maxLength={50} value={username}
          onChange={(event) => setUsername(event.target.value)} />
      </label>
      <label>
        <span className="label">Email</span>
        <input className="input mt-1" type="email" required maxLength={255} value={email}
          onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label>
        <span className="label">Nuova password (facoltativa)</span>
        <input className="input mt-1" type="password" autoComplete="new-password" minLength={8} maxLength={72}
          value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
        Account attivo
      </label>
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <button className="btn-primary" disabled={saving}>{saving ? 'Salvataggio…' : 'Salva utente'}</button>
        <button type="button" className="btn-secondary" disabled={saving} onClick={onCancel}>Chiudi</button>
      </div>
      {error && <p role="alert" className="error-box sm:col-span-2">{error}</p>}
      {notice && <p role="status" className="success-box sm:col-span-2">{notice}</p>}
    </form>
  )
}
