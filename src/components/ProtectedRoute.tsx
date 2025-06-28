import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/auth.context'
import path from '../constants/path'

interface ProtectedRouteProps {
  requiredRole?: 'PARENT' | 'SCHOOL-NURSE' | 'ADMIN'
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={path.login} replace />
  }

  if (requiredRole) {
    if (user?.roleName !== requiredRole) {
      if (user?.roleName === 'PARENT') {
        return <Navigate to={path.home} replace />
      } else if (user?.roleName === 'SCHOOL-NURSE') {
        return <Navigate to={path.BASE_NURSE} replace />
      } else if (user?.roleName === 'ADMIN') {
        return <Navigate to={path.BASE_ADMIN} replace />
      }
    }
  }

  return <Outlet />
}
