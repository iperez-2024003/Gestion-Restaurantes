import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../shared/components/Sidebar';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { useAuthStore } from '../../features/auth/store/useAuthStore';

export const DashboardLayout = () => {
  const { role, user } = useAuthStore();

  const getHeaderTitle = () => {
    switch (role) {
      case 'SUPER_ADMIN_ROLE':
        return { label: 'Administración Global', title: 'Global <span className="text-zinc-600">Control</span>' };
      case 'RESTAURANT_ADMIN_ROLE':
        return { label: 'Gestión de Sede', title: 'Operational <span className="text-zinc-600">Console</span>' };
      case 'STAFF_ROLE':
        return { label: 'Panel Operativo', title: 'Staff <span className="text-zinc-600">Station</span>' };
      case 'CLIENT_ROLE':
        return { label: 'Experiencia Gourmet', title: `Bienvenido, <span className="text-purple-500">${user?.name || 'Gourmet'}</span>` };
      default:
        return { label: 'RestauManager Core', title: 'Console <span className="text-zinc-600">Access</span>' };
    }
  };

  const header = getHeaderTitle();

  return (
    <div className="flex h-screen bg-black overflow-hidden font-outfit">
      {/* Sidebar fijo a la izquierda */}
      <Sidebar />
      
      {/* Contenido principal dinámico */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-purple-600/5 blur-[120px] rounded-full pointer-events-none z-0" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none z-0" />

        {/* Header superior Premium */}
        <header className="h-24 bg-black/60 backdrop-blur-3xl border-b border-purple-500/10 flex items-center justify-between px-12 z-20">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-purple-500 uppercase tracking-[0.4em] mb-1">{header.label}</span>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-none" dangerouslySetInnerHTML={{ __html: header.title }} />
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-6 py-3 bg-zinc-900/50 border border-purple-500/10 rounded-2xl shadow-2xl">
               <div className="relative">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping absolute inset-0" />
                  <div className="w-2 h-2 bg-emerald-500 rounded-full relative" />
               </div>
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Sistemas Live</span>
            </div>
            
            <div className="hidden md:flex items-center gap-2 text-zinc-500 font-bold text-[10px] uppercase tracking-widest bg-zinc-900/30 px-4 py-2 rounded-xl border border-zinc-800">
               <Activity className="w-3 h-3 text-purple-500" />
               <span className="text-purple-500/80">99.9%</span> Uptime
            </div>
          </div>
        </header>

        {/* Zona del Outlet */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-12 relative z-10 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800 hover:scrollbar-thumb-purple-500/20 transition-all">
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
