import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { getProfile } from '../../api/profileApi'
import { APP_NAME, APP_ROUTES, APP_TAGLINE, AUTH_EVENT, NAV_ITEMS } from '../../constants/app'
import { clearAuthSession, getManagedUserId, isAuthenticated, setManagedUserId } from '../../lib/auth'
import type { Profile } from '../../types/api'

export default function AppLayout() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState(false)
  const managedUser = profile?.admin ? getManagedUserId() : null
  const navItems = profile?.admin ? [...NAV_ITEMS, { to: APP_ROUTES.admin, label: 'Admin' }] : NAV_ITEMS

  useEffect(() => {
    let active = true
    const refresh = () => {
      if (!isAuthenticated()) return
      void getProfile().then((data) => {
        if (active) {
          if (!data.admin) setManagedUserId(null)
          setProfile(data)
          setError(false)
        }
      }).catch(() => {
        if (active) setError(true)
      })
    }
    refresh()
    window.addEventListener(AUTH_EVENT.changed, refresh)
    return () => {
      active = false
      window.removeEventListener(AUTH_EVENT.changed, refresh)
    }
  }, [])

  const logout = () => {
    clearAuthSession()
    navigate(APP_ROUTES.login, { replace: true })
  }

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-x-0 top-0 z-20 border-b border-white/10 bg-[#151c0e]/90 shadow-2xl shadow-black/25 backdrop-blur md:inset-y-0 md:right-auto md:w-64 md:border-b-0 md:border-r">
        <div className="flex h-16 items-center justify-between px-4 md:h-auto md:flex-col md:items-stretch md:gap-8 md:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#ccff00]">{APP_NAME}</p>
            <h1 className="text-lg font-bold tracking-normal text-[#dcefff]">Area operativa</h1>
            <p className="mt-1 max-w-40 text-xs text-[#dcefff]/60">{APP_TAGLINE}</p>
          </div>
          <nav className="hidden gap-2 md:flex md:flex-col">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#ccff00] text-[#101609] shadow-sm'
                      : 'text-[#dcefff]/70 hover:bg-[#dcefff]/10 hover:text-[#dcefff]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            onClick={logout}
            className="rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-[#dcefff]/80 hover:border-[#00f0ff]/35 hover:bg-[#00f0ff]/10"
          >
            Esci
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-[#ccff00] text-[#101609]' : 'text-[#dcefff]/70'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="px-4 pb-8 pt-32 md:ml-64 md:px-8 md:pt-8">
        <div className="mx-auto max-w-7xl">
          {managedUser && (
            <div className="panel mb-5 flex flex-wrap items-center justify-between gap-3">
              <p>Stai gestendo gli allenamenti e il calendario dell’utente #{managedUser}.</p>
              <button className="btn-secondary" onClick={() => {
                setManagedUserId(null)
                window.location.assign(APP_ROUTES.admin)
              }}>
                Esci dalla gestione utente
              </button>
            </div>
          )}
          {error && <p className="error-box">Impossibile caricare il profilo. Ricarica la pagina.</p>}
          {profile && <Outlet context={profile} />}
        </div>
      </main>
    </div>
  )
}
