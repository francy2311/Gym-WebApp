import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import { APP_ROUTES } from './constants/app'
import ExercisesPage from './pages/ExercisesPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SchedulePage from './pages/SchedulePage'
import WorkoutDetailPage from './pages/WorkoutDetailPage'
import WorkoutsPage from './pages/WorkoutsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={APP_ROUTES.login} element={<LoginPage />} />
        <Route path={APP_ROUTES.register} element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path={APP_ROUTES.exercises.slice(1)} element={<ExercisesPage />} />
            <Route path={APP_ROUTES.workouts.slice(1)} element={<WorkoutsPage />} />
            <Route path="workouts/:id" element={<WorkoutDetailPage />} />
            <Route path={APP_ROUTES.schedule.slice(1)} element={<SchedulePage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to={APP_ROUTES.home} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
