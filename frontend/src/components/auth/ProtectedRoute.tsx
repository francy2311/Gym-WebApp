import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { APP_ROUTES } from '../../constants/app'
import { isAuthenticated } from '../../lib/auth'

export default function ProtectedRoute() {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to={APP_ROUTES.login} replace state={{ from: location }} />
  }

  return <Outlet />
}
