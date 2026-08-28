import { createContext, useContext, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import api from '../api/client';

const AdminAuthContext = createContext(null);

// Solo dentro de la APK: inicia sesión automáticamente sin mostrar el
// formulario de login. Las credenciales viven en frontend/.env (que NO se
// sube a GitHub) y solo quedan embebidas en el build cuando generas la APK
// con `npm run build` + `npx cap sync android`. El backend sigue exigiendo
// un usuario/contraseña reales — solo se salta la PANTALLA, no la
// seguridad del servidor.
const NATIVE_ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const NATIVE_ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoLoginError, setAutoLoginError] = useState('');

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('admin_token', res.data.token);
    setAdmin(res.data.admin);
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');

    const tryStoredSession = () =>
      api
        .get('/auth/me')
        .then((res) => {
          setAdmin(res.data.admin);
          return true;
        })
        .catch(() => {
          localStorage.removeItem('admin_token');
          return false;
        });

    const boot = async () => {
      if (token && (await tryStoredSession())) {
        setLoading(false);
        return;
      }

      // Dentro de la APK, sin sesión guardada: entra sola con las
      // credenciales embebidas, sin pasar por la pantalla de login.
      if (Capacitor.isNativePlatform() && NATIVE_ADMIN_EMAIL && NATIVE_ADMIN_PASSWORD) {
        try {
          await login(NATIVE_ADMIN_EMAIL, NATIVE_ADMIN_PASSWORD);
        } catch (err) {
          setAutoLoginError(
            'No se pudo iniciar sesión automáticamente. Revisa VITE_ADMIN_EMAIL y VITE_ADMIN_PASSWORD en frontend/.env y vuelve a generar la APK.'
          );
        }
      }
      setLoading(false);
    };

    boot();
  }, []);

  const logout = () => {
    localStorage.removeItem('admin_token');
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout, autoLoginError }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth debe usarse dentro de AdminAuthProvider');
  return ctx;
}
