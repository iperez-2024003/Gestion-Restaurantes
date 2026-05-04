import { Link, Outlet } from 'react-router-dom';
import { Sidebar } from '../../shared/components/Sidebar';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { useAuthStore } from '../../features/auth/store/useAuthStore';

export const DashboardLayout = () => {
  const { role, user } = useAuthStore();

  const quickAccess = (() => {
    if (role === 'SUPER_ADMIN_ROLE') {
      return { to: '/dashboard/restaurants', label: 'Sedes' };
    }

    if (role === 'RESTAURANT_ADMIN_ROLE') {
      return { to: '/dashboard/restaurants', label: 'Cambiar sede' };
    }

    if (role === 'STAFF_ROLE' && user?.restaurantId) {
      return { to: `/dashboard/restaurants/${user.restaurantId}`, label: 'Mi sede' };
    }

    return null;
  })();

  const getHeaderTitle = () => {
    switch (role) {
      case 'SUPER_ADMIN_ROLE':
        return { label: 'Administración Global', title: 'Global <span className="text-zinc-600">Control</span>' };
      case 'RESTAURANT_ADMIN_ROLE':
        return { label: 'Gestión de Sede', title: 'Operational <span className="text-zinc-600">Console</span>' };
      case 'STAFF_ROLE':
        return { label: 'Panel Operativo', title: 'Staff <span className="text-zinc-600">Station</span>' };
      case 'CLIENT_ROLE':
        return { label: 'Experiencia Gourmet', title: `Bienvenido, <span className="text-[#b98c52]">${user?.name || 'Gourmet'}</span>` };
      default:
        return { label: 'BuenProvecho Core', title: 'Console <span className="text-zinc-600">Access</span>' };
    }
  };

  const header = getHeaderTitle();

  return (
    <div className="flex h-screen bg-[#f7f1e7] overflow-hidden font-outfit text-zinc-900">
      {/* Sidebar fijo a la izquierda */}
      <Sidebar />
      
      {/* Contenido principal dinámico */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[#d8b47a]/10 blur-[120px] rounded-full pointer-events-none z-0" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-[#fff6e8] blur-[120px] rounded-full pointer-events-none z-0" />

        {/* Header superior Premium */}
        <header className="min-h-20 md:min-h-24 bg-[#fffaf3]/80 backdrop-blur-3xl border-b border-[#dcc7a5]/80 flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 py-4 md:px-12 md:py-0 z-20">
          <div className="flex flex-col">
            <span className="text-[9px] md:text-[10px] font-black text-[#a97d45] uppercase tracking-[0.3em] md:tracking-[0.4em] mb-1">{header.label}</span>
            <h2 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tighter uppercase leading-none" dangerouslySetInnerHTML={{ __html: header.title }} />
          </div>
          
          <div className="flex items-center gap-3 md:gap-6 flex-wrap justify-end">
            {quickAccess && (
              <Link
                to={quickAccess.to}
                className="inline-flex items-center justify-center px-4 md:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#d7b77f] to-[#b98c52] text-white font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-lg shadow-[rgba(185,140,82,0.18)] border border-[#d7b77f]/30"
              >
                {quickAccess.label}
              </Link>
            )}

            <div className="flex items-center gap-3 px-4 md:px-6 py-2.5 md:py-3 bg-white/70 border border-[#dcc7a5]/60 rounded-2xl shadow-lg">
               <div className="relative">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping absolute inset-0" />
                  <div className="w-2 h-2 bg-emerald-500 rounded-full relative" />
               </div>
               <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Sistemas Live</span>
            </div>
            
            <div className="hidden md:flex items-center gap-2 text-zinc-500 font-bold text-[10px] uppercase tracking-widest bg-white/70 px-4 py-2 rounded-xl border border-[#dcc7a5]/60">
               <Activity className="w-3 h-3 text-[#b98c52]" />
               <span className="text-[#9f7642]">99.9%</span> Uptime
            </div>
          </div>
        </header>

        {/* Zona del Outlet */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-4 md:p-12 relative z-10 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#d7b77f]/40 hover:scrollbar-thumb-[#b98c52]/50 transition-all">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};
