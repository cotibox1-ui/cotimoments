import { NavLink, Outlet } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { useAdminAuth } from '../../context/AdminAuthContext';

const links = [
  { to: '/admin', label: 'Pedidos', end: true },
  { to: '/admin/productos', label: 'Productos' },
  { to: '/admin/cajas', label: 'Cajas' },
  { to: '/admin/decoracion', label: 'Decoración' },
  { to: '/admin/acompanantes', label: 'Acompañantes' },
  { to: '/admin/propuestas', label: 'Propuestas' },
  { to: '/admin/configuracion', label: 'Configuración' },
];

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <aside className="hidden md:flex md:flex-col w-56 bg-white border-r border-gray-100 p-4 gap-1">
        <div className="flex items-center gap-2 mb-4">
          <img src={logo} alt="Momentos Divertidos" className="w-8 h-8 rounded-full object-cover" />
          <p className="font-display font-bold text-sm text-rose-600 leading-tight">Momentos Divertidos</p>
        </div>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `px-3 py-2 rounded-xl text-sm font-medium ${isActive ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'}`
            }
          >
            {l.label}
          </NavLink>
        ))}
        <button onClick={logout} className="mt-auto text-sm text-gray-400 text-left px-3 py-2">
          Cerrar sesión ({admin?.name})
        </button>
      </aside>

      <main className="flex-1 p-4 pb-20 md:pb-4">
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 flex overflow-x-auto">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `flex-1 text-center py-3 text-[11px] font-medium whitespace-nowrap px-2 ${isActive ? 'text-rose-600' : 'text-gray-400'}`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
