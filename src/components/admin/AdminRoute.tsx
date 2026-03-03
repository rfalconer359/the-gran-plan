import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin } from '../../config/admin';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!isAdmin(user?.uid)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
