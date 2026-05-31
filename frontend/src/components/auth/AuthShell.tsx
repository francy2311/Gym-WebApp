import type { ReactNode } from 'react'
import heroImage from '../../assets/hero.png'
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from '../../constants/app'

type AuthShellProps = {
  title: string
  subtitle: string
  asideTitle: string
  asideBody: string
  footer: ReactNode
  children: ReactNode
}

export default function AuthShell({
  title,
  subtitle,
  asideTitle,
  asideBody,
  footer,
  children,
}: AuthShellProps) {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <aside className="auth-aside">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          <div className="auth-aside-overlay" />
          <div className="auth-aside-content">
            <div>
              <p className="auth-brand">{APP_NAME}</p>
              <h2 className="mt-4 text-2xl font-bold text-[var(--color-tertiary)]">{asideTitle}</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-[var(--color-muted)]">{asideBody}</p>
            </div>
            <div className="space-y-2 text-sm text-[var(--color-muted)]">
              <p>{APP_TAGLINE}</p>
              <p>{APP_DESCRIPTION}</p>
            </div>
          </div>
        </aside>

        <div className="auth-content">
          <div className="mx-auto max-w-md">
            <div className="mb-8">
              <p className="page-kicker">{APP_NAME}</p>
              <h1 className="mt-2 text-3xl font-bold text-[var(--color-tertiary)]">{title}</h1>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{subtitle}</p>
            </div>
            {children}
            <div className="mt-6 text-center text-sm text-[var(--color-muted)]">{footer}</div>
          </div>
        </div>
      </section>
    </main>
  )
}
