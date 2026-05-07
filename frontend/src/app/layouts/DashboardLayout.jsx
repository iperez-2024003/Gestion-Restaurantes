import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Sidebar } from '../../shared/components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Menu, X, Radio } from 'lucide-react';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { Button } from '../../shared/components/ui/Button';

export const DashboardLayout = () => {
  const { role, user } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const quickAccess = (() => {
    if (role === 'SUPER_ADMIN_ROLE') return { to: '/dashboard/restaurants', label: 'Gestionar Sedes' };
    if (role === 'RESTAURANT_ADMIN_ROLE') return { to: '/dashboard/restaurants', label: 'Cambiar Sede' };
    if (role === 'STAFF_ROLE' && user?.restaurantId) return { to: `/dashboard/restaurants/${user.restaurantId}`, label: 'Mi Sede' };
    return null;
  })();

  const getHeaderInfo = () => {
    const roles = {
      'SUPER_ADMIN_ROLE': { label: 'Administración Global', title: 'Global <span>Console</span>' },
      'RESTAURANT_ADMIN_ROLE': { label: 'Gestión Operativa', title: 'Sede <span>Dashboard</span>' },
      'STAFF_ROLE': { label: 'Panel de Turno', title: 'Operational <span>Station</span>' },
      'CLIENT_ROLE': { label: 'BuenProvecho Club', title: `Hola, <span class="text-primary-500">${user?.name?.split(' ')[0] || 'Gourmet'}</span>` }
    };
    return roles[role] || { label: 'Panel Central', title: 'BuenProvecho <span>Core</span>' };
  };

  const info = getHeaderInfo();

  return (
    <div className="flex h-screen bg-primary-50 overflow-hidden font-outfit text-ink">
      {/* Sidebar Desktop */}
      <Sidebar />

      {/* Sidebar Móvil (Drawer) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] z-[70] md:hidden"
            >
              <div className="h-full relative bg-white shadow-2xl">
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute top-6 right-[-45px] w-10 h-10 bg-white rounded-xl flex items-center justify-center text-ink shadow-lg"
                >
                  <X size={20} />
                </button>
                <Sidebar />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header Superior Premium */}
        <header className="h-20 md:h-24 bg-white/70 backdrop-blur-xl border-b border-primary-200/50 flex items-center justify-between px-6 md:px-12 z-50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl bg-primary-100 text-primary-600"
            >
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-primary-500 uppercase tracking-[0.4em] mb-1 leading-none">{info.label}</span>
              <h2 
                className="text-xl md:text-2xl font-black text-ink tracking-tighter uppercase leading-none [&>span]:text-muted-brown" 
                dangerouslySetInnerHTML={{ __html: info.title }} 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4 mr-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-100/50 rounded-full border border-primary-200">
                <div className="relative w-2 h-2">
                  <div className="absolute inset-0 bg-green-500 rounded-full animate-ping" />
                  <div className="relative w-2 h-2 bg-green-500 rounded-full" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-primary-700">Sistema Activo</span>
              </div>
              
              <div className="flex items-center gap-2 text-muted-brown font-bold text-[10px] uppercase tracking-widest">
                 <Radio size={12} className="text-primary-500" />
                 <span>99.9% Uptime</span>
              </div>
            </div>

            {quickAccess && (
              <Button 
                variant="primary" 
                onClick={() => window.location.href = quickAccess.to}
                className="hidden sm:flex text-[10px] px-5"
              >
                {quickAccess.label}
              </Button>
            )}
          </div>
        </header>

        {/* Zona de Contenido */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 lg:p-12 relative z-10 scrollbar-hide">
          {/* Background Accents */}
          <div className="fixed top-24 right-0 w-[500px] h-[500px] bg-primary-300/10 blur-[120px] rounded-full pointer-events-none -z-10" />
          <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-primary-400/5 blur-[120px] rounded-full pointer-events-none -z-10" />

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};
