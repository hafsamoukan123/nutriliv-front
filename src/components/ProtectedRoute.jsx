import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

// ✅ يمنع الدخول إذا لم يكن المستخدم مسجلاً أو ليس له الدور المطلوب
export default function ProtectedRoute({ children, role }) {
  const { user, token } = useAuthStore()

  if (!token || !user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/login" replace />

  return children
}