import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function RequireAdmin({ children }) {
  const { admin, loading } = useAdminAuth();
  if (loading) return <p className="text-center text-gray-400 py-20">Cargando…</p>;
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
}
