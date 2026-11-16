import { useState } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { login } from '../api/authApi'
import AuthField from '../components/auth/AuthField'
import AuthShell from '../components/auth/AuthShell'
import { APP_NAME, APP_ROUTES } from '../constants/app'
import { usePageTitle } from '../hooks/usePageTitle'
import { isAuthenticated, storeAuthToken } from '../lib/auth'

export default function LoginPage() {
  usePageTitle('Accedi')
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated()) {
    return <Navigate to={APP_ROUTES.home} replace />
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    if (!identifier.trim() || !password) {
      setError('Inserisci email o nome utente e password.')
      return
    }

    try {
      setLoading(true)
      const data = await login({ usernameOrEmail: identifier.trim(), password })
      storeAuthToken(data.accessToken)
      navigate(APP_ROUTES.home, { replace: true })
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(`Login non riuscito: errore ${err.response.status}.`)
      } else {
        setError('Backend non raggiungibile. Verifica che Spring Boot sia avviato su localhost:8080.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Bentornato"
      subtitle={`Accedi a ${APP_NAME} per riprendere i tuoi allenamenti.`}
      asideTitle="Controllo completo della programmazione"
      asideBody="Gestisci esercizi, schede e calendario settimanale con un frontend pulito e pronto per essere pubblicato."
      footer={
        <>
          Non hai un account?{' '}
          <Link className="font-semibold text-[#ccff00]" to={APP_ROUTES.register}>
            Registrati
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <AuthField
          label="Email o nome utente"
          value={identifier}
          onChange={setIdentifier}
        />
        <AuthField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
        />

        {error && <p className="error-box">{error}</p>}

        <button className="btn-primary w-full justify-center py-3" disabled={loading}>
          {loading ? 'Accesso in corso...' : `Accedi a ${APP_NAME}`}
        </button>
      </form>
    </AuthShell>
  )
}
