import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { 
  LayoutDashboard, 
  Users, 
  Utensils, 
  ClipboardList, 
  Calendar, 
  BarChart3, 
  UserCircle, 
  LogOut,
  Flame,
  Settings,
  Star
} from 'lucide-react';
import { getImageUrl } from '../utils/getImageUrl';
import { BrandLogo } from './ui/BrandLogo';

export const Sidebar = () => {
  const { role, user, logout } = useAuthStore();
  const location = useLocation();
  const { id: urlId } = useParams();
  const id = urlId || user?.restaurantId;

  const handleLogout = () => {
    logout();
  };

  const roleMapper = {
    'SUPER_ADMIN_ROLE': 'Admin Global',
    'RESTAURANT_ADMIN_ROLE': 'Gerente',
    'STAFF_ROLE': 'Staff',
    'CLIENT_ROLE': 'Cliente'
  };

  const friendlyRole = roleMapper[role] || 'Usuario';

  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.includes(path)) return true;
    return false;
  };

  const NavLink = ({ to, icon: Icon, children }) => {
    const active = isActive(to);
    return (
      <Link 
        to={to} 
        className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group font-black uppercase tracking-widest text-[10px] ${
          active 
            ? 'bg-gradient-to-r from-[#d7b77f] to-[#b98c52] text-white shadow-lg shadow-[rgba(153,114,58,0.22)]' 
            : 'text-zinc-500 hover:text-[#94673a] hover:bg-[#f0e4d2]'
        }`}
      >
        <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-white' : 'text-zinc-600 group-hover:text-[#b98c52]'}`} />
        <span>{children}</span>
      </Link>
    );
  };

  return (
    <aside className="hidden md:flex md:w-72 h-screen bg-[#f6efe4] border-r border-[#dcc7a5] flex-col relative z-30 shadow-[0_20px_80px_rgba(119,89,52,0.08)]">
      <div className="h-20 md:h-24 flex items-center px-4 md:px-6 border-b border-[#dcc7a5]/80 bg-[#fffaf2]/90 backdrop-blur-3xl">
        <BrandLogo size="sm" className="mx-auto md:mx-0 w-full max-w-[13rem]" imageClassName="p-1" />
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 scrollbar-hide">
        <NavLink to="/dashboard" icon={LayoutDashboard}>Inicio</NavLink>

        {/* --- SUPER ADMIN --- */}
        {role === 'SUPER_ADMIN_ROLE' && (
          <div className="space-y-1 mt-6">
            <p className="px-4 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">Plataforma</p>
            <NavLink to="/dashboard/analytics" icon={BarChart3}>Estadísticas</NavLink>
            <NavLink to="/dashboard/restaurants" icon={Utensils}>Restaurantes</NavLink>
            <NavLink to="/dashboard/users" icon={Users}>Usuarios</NavLink>
            <NavLink to="/dashboard/vip-clients" icon={Star}>Clientes VIP</NavLink>
          </div>
        )}

        {/* --- RESTAURANT ADMIN --- */}
        {role === 'RESTAURANT_ADMIN_ROLE' && id && (
          <div className="space-y-1 mt-6">
            <p className="px-4 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">Mi Restaurante</p>
            <NavLink to={`/dashboard/restaurants/${id}`} icon={LayoutDashboard}>Resumen</NavLink>
            <NavLink to={`/dashboard/restaurants/${id}/menu`} icon={Utensils}>Menú</NavLink>
            <NavLink to={`/dashboard/restaurants/${id}/staff`} icon={Users}>Empleados</NavLink>
            <NavLink to={`/dashboard/restaurants/${id}/orders`} icon={ClipboardList}>Órdenes</NavLink>
            <NavLink to={`/dashboard/restaurants/${id}/kitchen`} icon={Flame}>Cocina</NavLink>
            <NavLink to={`/dashboard/restaurants/${id}/tables`} icon={LayoutDashboard}>Mesas</NavLink>
            <NavLink to={`/dashboard/restaurants/${id}/events`} icon={Calendar}>Eventos</NavLink>
            <NavLink to={`/dashboard/restaurants/${id}/analytics`} icon={BarChart3}>Reportes</NavLink>
          </div>
        )}

        {/* --- STAFF --- */}
        {role === 'STAFF_ROLE' && id && (
          <div className="space-y-1 mt-6">
            <p className="px-4 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">Operaciones</p>
            <NavLink to={`/dashboard/restaurants/${id}`} icon={LayoutDashboard}>Resumen</NavLink>
            <NavLink to={`/dashboard/restaurants/${id}/orders`} icon={ClipboardList}>Órdenes</NavLink>
            <NavLink to={`/dashboard/restaurants/${id}/kitchen`} icon={Flame}>Monitor Cocina</NavLink>
            <NavLink to={`/dashboard/restaurants/${id}/tables`} icon={LayoutDashboard}>Estado Mesas</NavLink>
          </div>
        )}

        {/* --- CLIENT --- */}
        {role === 'CLIENT_ROLE' && (
          <div className="space-y-1 mt-6">
            <p className="px-4 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">Mi Experiencia</p>
            <NavLink to="/dashboard/history" icon={ClipboardList}>Historial</NavLink>
            <NavLink to="/dashboard/events" icon={Calendar}>Eventos</NavLink>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-[#dcc7a5]/80 bg-[#fffaf2]/80 backdrop-blur-xl">
        <Link to="/dashboard/profile" className="flex items-center gap-3 mb-4 p-3 rounded-2xl hover:bg-[#efe1c9] transition-all group border border-transparent hover:border-[#d5b57b]/40">
          <div className="w-10 h-10 rounded-xl bg-[#d9bb88]/20 flex items-center justify-center text-[#94673a] font-black border border-[#d5b57b]/30 overflow-hidden">
            {user?.profilePicture ? (
              <img src={getImageUrl(user.profilePicture)} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg">{user?.name?.charAt(0) || 'U'}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-zinc-900 truncate uppercase tracking-tighter">{user?.name || user?.username}</p>
            <p className="text-[10px] text-[#9f7642] font-black uppercase tracking-widest">{friendlyRole}</p>
          </div>
          <Settings className="w-4 h-4 text-zinc-600 group-hover:text-[#b98c52]" />
        </Link>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#7f5530] hover:bg-[#eddcc0] transition-all font-black uppercase tracking-widest text-[10px] border border-[#dcc7a5]/70"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
