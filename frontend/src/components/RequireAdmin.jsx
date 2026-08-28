import { Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function RequireAdmin({ children }) {
  const { admin, loading, autoLoginError } = useAdminAuth();
  if (loading) return <p className="text-center text-gray-400 py-20">Cargando…</p>;

  if (!admin) {
    // Dentro de la APK no hay pantalla de login a la que mandar: si el
    // auto-login falló, se muestra el motivo en vez de redirigir a /login.
    if (Capacitor.isNativePlatform()) {
      return (
        <p className="text-center text-red-600 py-20 px-6 text-sm">
          {autoLoginError || 'No se pudo iniciar sesión.'}
        </p>
      );
    }
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
