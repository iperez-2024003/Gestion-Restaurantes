import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { 
  HomeIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  DocumentTextIcon, 
  Cog6ToothIcon,
  Squares2X2Icon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

export const Sidebar = () => {
  const { role, user, logout } = useAuthStore();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const roleMapper = {
    'SUPER_ADMIN_ROLE': 'Administrador Global',
    'RESTAURANT_ADMIN_ROLE': 'Gerente de Restaurante',
    'STAFF_ROLE': 'Mesero / Staff',
    'CLIENT_ROLE': 'Cliente'
  };

  const friendlyRole = roleMapper[role] || 'Usuario';

  // Helper para pintar el background si estamos en la ruta actual
  const isActive = (path) => location.pathname.includes(path) ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-100';

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-indigo-600">RestauManager</h1>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {/* Siempre visible para el Dashboard en general */}
        <Link to="/dashboard" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/dashboard') && location.pathname === '/dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`}>
          <HomeIcon className="w-5 h-5" />
          <span className="font-medium">Inicio</span>
        </Link>

        {/* --- SUPER ADMIN --- */}
        {role === 'SUPER_ADMIN_ROLE' && (
          <>
            <div className="pt-4 pb-1">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Plataforma (Global)
              </p>
            </div>
            <Link to="/dashboard/global-stats" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('global-stats')}`}>
              <ChartBarIcon className="w-5 h-5" />
              <span className="font-medium">Estadísticas Globales</span>
            </Link>
            <Link to="/dashboard/restaurants" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('restaurants')}`}>
              <Squares2X2Icon className="w-5 h-5" />
              <span className="font-medium">Restaurantes</span>
            </Link>
            <Link to="/dashboard/vip-customers" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('vip-customers')}`}>
              <UserGroupIcon className="w-5 h-5" />
              <span className="font-medium">Clientes VIP</span>
            </Link>
          </>
        )}

        {/* --- RESTAURANT ADMIN --- */}
        {role === 'RESTAURANT_ADMIN_ROLE' && (
          <>
            <div className="pt-4 pb-1">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Mi Restaurante
              </p>
            </div>
            <Link to="/dashboard/menu" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('menu')}`}>
              <Squares2X2Icon className="w-5 h-5" />
              <span className="font-medium">Mi Menú (Inventario)</span>
            </Link>
            <Link to="/dashboard/staff" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('staff')}`}>
              <UserGroupIcon className="w-5 h-5" />
              <span className="font-medium">Mis Empleados</span>
            </Link>
            <Link to="/dashboard/reports" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('reports')}`}>
              <DocumentTextIcon className="w-5 h-5" />
              <span className="font-medium">Reportes y Excel</span>
            </Link>
          </>
        )}

        {/* --- STAFF (Meseros) --- */}
        {role === 'STAFF_ROLE' && (
          <>
            <div className="pt-4 pb-1">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Operaciones
              </p>
            </div>
            <Link to="/dashboard/orders" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('orders')}`}>
              <DocumentTextIcon className="w-5 h-5" />
              <span className="font-medium">Órdenes Activas</span>
            </Link>
            <Link to="/dashboard/tables" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('tables')}`}>
              <Squares2X2Icon className="w-5 h-5" />
              <span className="font-medium">Estado de Mesas</span>
            </Link>
          </>
        )}

      </div>

      <div className="p-4 border-t border-gray-200">
        <Link to="/dashboard/profile" className="flex items-center gap-3 mb-4 p-2 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer border border-transparent hover:border-gray-200">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold group-hover:bg-indigo-200 transition-colors overflow-hidden">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <>{user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}</>
            )}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{user?.name || user?.username}</p>
            <p className="text-xs text-indigo-500 font-semibold truncate">{friendlyRole}</p>
          </div>
          <Cog6ToothIcon className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
        </Link>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
