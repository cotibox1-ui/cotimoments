import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Box,
  Palette,
  Gift,
  Link2,
  Settings,
  MoreHorizontal,
  LogOut,
  X,
  Bell,
  ChevronDown,
} from 'lucide-react';
import logo from '../../assets/logo.png';
import { useAdminAuth } from '../../context/AdminAuthContext';

const links = [
  { to: '/admin', label: 'Dashboard', end: true, icon: LayoutDashboard },
  { to: '/admin/productos', label: 'Productos', icon: Package },
  { to: '/admin/cajas', label: 'Cajas', icon: Box },
  { to: '/admin/decoracion', label: 'Decoración', icon: Palette },
  { to: '/admin/acompanantes', label: 'Acompañantes', icon: Gift },
  { to: '/admin/propuestas', label: 'Propuestas', icon: Link2 },
  { to: '/admin/configuracion', label: 'Configuración', icon: Settings },
];

// En la APK / móvil, solo se muestran estos 3 + un botón "Más" con el
// resto — más cómodo para usar con el pulgar mientras se prepara un
// pedido (sección 21 del brief de diseño móvil).
const PRIMARY_MOBILE = ['/admin', '/admin/productos', '/admin/propuestas'];

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const primaryLinks = links.filter((l) => PRIMARY_MOBILE.includes(l.to));
  const moreLinks = links.filter((l) => !PRIMARY_MOBILE.includes(l.to));

  const currentSection =
    links.find((l) => (l.end ? location.pathname === l.to : location.pathname.startsWith(l.to)))?.label || 'Dashboard';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-rose-25">
      {/* ---- Sidebar (desktop / dashboard web) ---- */}
      <aside className="hidden md:flex md:flex-col w-60 shrink-0 bg-white border-r border-rose-50 p-4 gap-1 md:sticky md:top-0 md:h-screen">
        <div className="flex items-center gap-2 mb-6 px-1">
          <img src={logo} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-rose-100" />
          <p className="font-display font-bold text-sm text-rose-600 leading-tight">Momentos Divertidos</p>
        </div>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-rose-50 text-rose-600' : 'text-ink-600 hover:bg-rose-25'
              }`
            }
          >
            <l.icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
            {l.label}
          </NavLink>
        ))}
        <button
          onClick={logout}
          className="mt-auto flex items-center gap-2.5 text-sm text-ink-400 text-left px-3 py-2.5 hover:text-rose-600 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" strokeWidth={1.75} />
          Cerrar sesión
        </button>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* ---- Header (solo desktop) ---- */}
        <header className="hidden md:flex items-center justify-between px-6 lg:px-10 h-16 bg-white border-b border-rose-50 sticky top-0 z-10">
          <h1 className="font-display text-lg font-bold text-ink-900">{currentSection}</h1>
          <div className="flex items-center gap-4">
            <button className="w-9 h-9 rounded-full bg-rose-25 flex items-center justify-center text-ink-500 hover:text-rose-600 transition-colors">
              <Bell className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </button>
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-rose-25 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold shrink-0">
                  {admin?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <span className="text-sm font-medium text-ink-900">{admin?.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-ink-400" strokeWidth={2} />
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-11 bg-white rounded-2xl shadow-soft border border-rose-50 py-1.5 w-44 z-20">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-ink-600 hover:bg-rose-25 transition-colors"
                    >
                      <LogOut className="w-4 h-4" strokeWidth={1.75} />
                      Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ---- Contenido: centrado con ancho máximo en monitores grandes ---- */}
        <main className="flex-1 p-4 pb-24 md:p-6 lg:p-10 md:pb-6">
          <div className="max-w-[1440px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ---- Bottom nav (móvil / APK) ---- */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-rose-100 flex px-1 py-1.5 shadow-[0_-2px_12px_rgba(196,42,99,0.06)]">
        {primaryLinks.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-[10px] font-medium transition-colors ${
                isActive ? 'text-rose-600' : 'text-ink-400'
              }`
            }
          >
            <l.icon className="w-5 h-5" strokeWidth={1.75} />
            {l.label}
          </NavLink>
        ))}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-[10px] font-medium text-ink-400"
        >
          <MoreHorizontal className="w-5 h-5" strokeWidth={1.75} />
          Más
        </button>
      </nav>

      {/* ---- Hoja "Más" con el resto de secciones ---- */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/30" onClick={() => setMoreOpen(false)}>
          <div
            className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl p-4 pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-ink-900">Más opciones</p>
              <button onClick={() => setMoreOpen(false)} className="text-ink-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {moreLinks.map((l) => (
                <button
                  key={l.to}
                  onClick={() => {
                    setMoreOpen(false);
                    navigate(l.to);
                  }}
                  className="flex items-center gap-2 bg-rose-25 rounded-xl px-3 py-3 text-sm font-medium text-ink-600"
                >
                  <l.icon className="w-[18px] h-[18px] text-rose-600" strokeWidth={1.75} />
                  {l.label}
                </button>
              ))}
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 mt-3 py-3 text-sm font-medium text-ink-400"
            >
              <LogOut className="w-[18px] h-[18px]" strokeWidth={1.75} />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
