import { Navigate } from 'react-router-dom';
import { useAuthStore, getAuthToken } from '../app/store';

export default function PrivateRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  const hasToken = Boolean(token || getAuthToken());

  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
