import { useState } from 'react'
import type { FormEvent } from 'react'
import { useOutletContext } from 'react-router-dom'
import { updateProfile } from '../api/profileApi'
import { usePageTitle } from '../hooks/usePageTitle'
import { storeAuthToken } from '../lib/auth'
import type { Profile } from '../types/api'

export default function ProfilePage() {
  usePageTitle('Profilo')
  const profile = useOutletContext<Profile>()
  const [username, setUsername] = useState(profile.username)
  const [email, setEmail] = useState(profile.email)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setStatus('')
    try {
      const session = await updateProfile({
        username: username.trim(),
        email: email.trim(),
        currentPassword,
        newPassword: newPassword || undefined,
      })
      storeAuthToken(session.accessToken)
      setUsername(session.username)
      setEmail(session.email)
      setCurrentPassword('')
      setNewPassword('')
      setStatus('Dati personali aggiornati.')
    } catch {
      setError('Salvataggio non riuscito. Controlla la password attuale e la disponibilità di email e nome utente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-6">
      <h2 className="page-title">Dati personali</h2>
      <form onSubmit={save} className="panel grid max-w-2xl gap-4 sm:grid-cols-2">
        <label>
          <span className="label">Nome utente</span>
          <input className="input mt-1" autoComplete="username" required minLength={3} maxLength={50}
            value={username} onChange={(event) => setUsername(event.target.value)} />
        </label>
        <label>
          <span className="label">Email</span>
          <input className="input mt-1" type="email" autoComplete="email" required maxLength={255}
            value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          <span className="label">Password attuale</span>
          <input className="input mt-1" type="password" autoComplete="current-password" required
            value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
        </label>
        <label>
          <span className="label">Nuova password (facoltativa)</span>
          <input className="input mt-1" type="password" autoComplete="new-password" minLength={8} maxLength={72}
            value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
        </label>
        <div className="sm:col-span-2">
          <button className="btn-primary" disabled={saving}>{saving ? 'Salvataggio…' : 'Salva modifiche'}</button>
        </div>
        {error && <p role="alert" className="error-box sm:col-span-2">{error}</p>}
        {status && <p role="status" className="success-box sm:col-span-2">{status}</p>}
      </form>
    </section>
  )
}
