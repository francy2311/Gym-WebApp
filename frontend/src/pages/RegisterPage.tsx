import { useState } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { register } from '../api/authApi'
import AuthField from '../components/auth/AuthField'
import AuthShell from '../components/auth/AuthShell'
import { APP_NAME, APP_ROUTES } from '../constants/app'
import { usePageTitle } from '../hooks/usePageTitle'
import { isAuthenticated, storeAuthToken } from '../lib/auth'

export default function RegisterPage() {
  usePageTitle('Registrati')
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated()) {
    return <Navigate to={APP_ROUTES.home} replace />
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    const normalizedName = fullName.trim()

    if (normalizedName.length < 3 || !email || password.length < 8) {
      setError('Nome, email e password di almeno 8 caratteri sono obbligatori.')
      return
    }

    if (password !== confirmPassword) {
      setError('Le password non coincidono.')
      return
    }

    if (!acceptedTerms) {
      setError('Devi accettare Termini di Servizio e Privacy Policy.')
      return
    }

    try {
      setLoading(true)
      const data = await register({ username: normalizedName, email, password })
      storeAuthToken(data.accessToken)
      navigate(APP_ROUTES.home, { replace: true })
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(`Registrazione non riuscita: errore ${err.response.status}.`)
      } else {
        setError('Backend non raggiungibile. Verifica che Spring Boot sia avviato su localhost:8080.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Crea il tuo account"
      subtitle={`Entra in ${APP_NAME} e prepara la tua programmazione settimanale.`}
      asideTitle="Un frontend pronto per la community"
      asideBody="Interfaccia in italiano, struttura pulita e flussi essenziali per gestire esercizi, schede e calendario senza elementi dimostrativi inutili."
      footer={
        <>
          Hai già un account?{' '}
          <Link className="font-semibold text-[#ccff00]" to={APP_ROUTES.login}>
            Accedi
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <AuthField
          label="Nome completo"
          value={fullName}
          onChange={setFullName}
          placeholder="Mario Rossi"
        />
        <AuthField
          label="Email"
          value={email}
          onChange={setEmail}
          type="email"
          placeholder="mario@esempio.it"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField
            label="Password"
            value={password}
            onChange={setPassword}
            type="password"
            placeholder="••••••••"
          />
          <AuthField
            label="Conferma password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            type="password"
            placeholder="••••••••"
          />
        </div>

        <label className="flex items-start gap-3 pt-1 text-xs text-[#dcefff]/62">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border border-white/15 bg-transparent accent-[#ccff00]"
          />
          <span>
            Accetto i termini di servizio e l&apos;informativa privacy di {APP_NAME}.
          </span>
        </label>

        {error && <p className="error-box">{error}</p>}

        <button className="btn-primary mt-2 w-full justify-center py-3" disabled={loading}>
          {loading ? 'Creazione account...' : `Crea account ${APP_NAME}`}
        </button>
      </form>
    </AuthShell>
  )
}
