import { createBrowserRouter, Navigate, useNavigate } from 'react-router-dom';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { RegisterPage } from '../../features/auth/pages/RegisterPage';
import { VerifyEmailPage } from '../../features/auth/pages/VerifyEmailPage';
import { ForgotPasswordPage } from '../../features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../../features/auth/pages/ResetPasswordPage';
import { ProfilePage } from '../../features/users/pages/ProfilePage';
import { RestaurantsPage } from '../../features/restaurants/components/RestaurantsPage';
import { RestaurantMenu } from '../../features/restaurants/components/RestaurantMenu';
import { TablesPage } from '../../features/restaurants/components/TablesPage';
import { StaffPage } from '../../features/restaurants/components/StaffPage';
import { RestaurantDashboard } from '../../features/restaurants/components/RestaurantDashboard';
import { OrdersKanban } from '../../features/orders/components/OrdersKanban';
import { ReservationsKanban } from '../../features/reservations/components/ReservationsKanban';
import { PublicMenu } from '../../features/public/pages/PublicMenu';
import { EventsFeed } from '../../features/events/pages/EventsFeed';
import { AdminUserManagement } from '../../features/users/pages/AdminUserManagement';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';

import { ClientDashboard } from '../../features/public/pages/ClientDashboard';
import { ClientHistory } from '../../features/public/pages/ClientHistory';
import { AdminEventsPage } from '../../features/events/pages/AdminEventsPage';
import { AnalyticsDashboard } from '../../features/restaurants/pages/AnalyticsDashboard';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { motion } from 'framer-motion';
import { GlobalAnalytics } from '../../features/restaurants/pages/GlobalAnalytics';
import { GlobalClients } from '../../features/users/pages/GlobalClients';
import { KitchenDisplay } from '../../features/orders/pages/KitchenDisplay';

import { ActionButton } from '../../shared/components/ui/ActionButton';
import { TransactionCard } from '../../shared/components/ui/TransactionCard';
import { 
  PlusCircle, 
  Search, 
  UserPlus, 
  FileText, 
  Zap,
  TrendingUp,
  LayoutGrid
} from 'lucide-react';

const DashboardIndex = () => {
  const { role, user } = useAuthStore();
  const navigate = useNavigate();

  if (role === 'CLIENT_ROLE') {
    return <ClientDashboard />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 font-outfit"
    >
      <motion.div variants={itemVariants} className="flex flex-col gap-2">
         <h3 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
           Bienvenido, <span className="text-purple-500">{user?.name || (role === 'SUPER_ADMIN_ROLE' ? 'Director' : 'Gestor')}</span>
         </h3>
         <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[9px]">Sistemas de Gestión de Alto Rendimiento</p>
         </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-zinc-900/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-purple-500/10 flex flex-col justify-between group shadow-2xl">
            <div>
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-14 h-14 bg-purple-600/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
                     <Zap className="w-6 h-6 text-purple-400" />
                  </div>
                  <h4 className="text-2xl font-black text-white uppercase tracking-tight">Acciones <span className="text-purple-500">Críticas</span></h4>
               </div>
               
               <div className="flex flex-wrap gap-4">
                  <ActionButton label="Nueva Orden" icon={PlusCircle} color="purple" onClick={() => {}} />
                  <ActionButton label="Buscar Cliente" icon={Search} color="blue" onClick={() => {}} />
                  <ActionButton label="Añadir Staff" icon={UserPlus} color="orange" onClick={() => {}} />
                  <ActionButton label="Reporte PDF" icon={FileText} color="cyan" onClick={() => {}} />
               </div>
            </div>
            
            <div className="mt-12 p-8 bg-black/40 rounded-3xl border border-zinc-800 group-hover:border-purple-500/30 transition-all">
               <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest leading-loose">
                  Optimiza tu flujo de trabajo diario personalizando estos accesos directos en la configuración de la terminal.
               </p>
            </div>
         </div>

         <div className="space-y-6">
            <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] px-6">Monitor de Rendimiento</h4>
            <TransactionCard label="Transacciones Activas" onClick={() => {}} />
            <TransactionCard label="Cierre de Jornada" onClick={() => {}} />
         </div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-zinc-900/40 backdrop-blur-xl p-12 rounded-[3rem] border border-purple-500/10 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl">
         <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-purple-600/20 rounded-[2rem] flex items-center justify-center text-4xl border border-purple-500/20 shadow-inner">🚀</div>
            <div>
               <h4 className="text-white font-black text-2xl tracking-tight uppercase mb-2">Manual de Operaciones</h4>
               <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed">Domina todas las herramientas de la plataforma con nuestra guía técnica.</p>
            </div>
         </div>
         <button className="px-10 py-5 bg-purple-600 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-purple-500 active:scale-95 transition-all shadow-2xl shadow-purple-500/20 border border-purple-400/20">
            Abrir Tutorial
         </button>
      </motion.div>
    </motion.div>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/menu/:restaurant_id',
    element: <PublicMenu />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/verify-email',
    element: <VerifyEmailPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardIndex />
      },
      {
        path: 'profile',
        element: <ProfilePage />
      },
      {
        path: 'history',
        element: (
          <ProtectedRoute allowedRoles={['CLIENT_ROLE']}>
            <ClientHistory />
          </ProtectedRoute>
        )
      },
      {
        path: 'events',
        element: (
          <ProtectedRoute allowedRoles={['CLIENT_ROLE']}>
            <EventsFeed />
          </ProtectedRoute>
        )
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN_ROLE']}>
            <AdminUserManagement />
          </ProtectedRoute>
        )
      },
      {
        path: 'restaurants',
        element: (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN_ROLE', 'RESTAURANT_ADMIN_ROLE']}>
            <RestaurantsPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'analytics',
        element: (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN_ROLE']}>
            <GlobalAnalytics />
          </ProtectedRoute>
        )
      },
      {
        path: 'vip-clients',
        element: (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN_ROLE']}>
            <GlobalClients />
          </ProtectedRoute>
        )
      },
      {
        path: 'restaurants/:id',
        element: (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN_ROLE', 'RESTAURANT_ADMIN_ROLE', 'STAFF_ROLE']}>
            <RestaurantDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'restaurants/:id/analytics',
        element: (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN_ROLE', 'RESTAURANT_ADMIN_ROLE']}>
            <AnalyticsDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'restaurants/:id/menu',
        element: (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN_ROLE', 'RESTAURANT_ADMIN_ROLE', 'STAFF_ROLE']}>
            <RestaurantMenu />
          </ProtectedRoute>
        )
      },
      {
        path: 'restaurants/:id/tables',
        element: (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN_ROLE', 'RESTAURANT_ADMIN_ROLE', 'STAFF_ROLE']}>
            <TablesPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'restaurants/:id/staff',
        element: (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN_ROLE', 'RESTAURANT_ADMIN_ROLE']}>
            <StaffPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'restaurants/:id/orders',
        element: (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN_ROLE', 'RESTAURANT_ADMIN_ROLE', 'STAFF_ROLE']}>
            <OrdersKanban />
          </ProtectedRoute>
        )
      },
      {
        path: 'restaurants/:id/kitchen',
        element: (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN_ROLE', 'RESTAURANT_ADMIN_ROLE', 'STAFF_ROLE']}>
            <KitchenDisplay />
          </ProtectedRoute>
        )
      },
      {
        path: 'restaurants/:id/reservations',
        element: (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN_ROLE', 'RESTAURANT_ADMIN_ROLE', 'STAFF_ROLE']}>
            <ReservationsKanban />
          </ProtectedRoute>
        )
      },
      {
        path: 'restaurants/:id/events',
        element: (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN_ROLE', 'RESTAURANT_ADMIN_ROLE']}>
            <AdminEventsPage />
          </ProtectedRoute>
        )
      },
    ]
  },
]);
