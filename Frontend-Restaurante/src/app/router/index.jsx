import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ProtectedRoute } from './ProtectedRoute';

const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-primary-50">
    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mb-4" />
    <p className="text-[10px] font-black uppercase tracking-widest text-primary-500">Cargando...</p>
  </div>
);

const Loadable = (Component) => (props) => (
  <Suspense fallback={<PageLoader />}>
    <Component {...props} />
  </Suspense>
);

const LoginPage = Loadable(lazy(() => import('../../features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage }))));
const RegisterPage = Loadable(lazy(() => import('../../features/auth/pages/RegisterPage').then(m => ({ default: m.RegisterPage }))));
const VerifyEmailPage = Loadable(lazy(() => import('../../features/auth/pages/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage }))));
const ForgotPasswordPage = Loadable(lazy(() => import('../../features/auth/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage }))));
const ResetPasswordPage = Loadable(lazy(() => import('../../features/auth/pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage }))));
const ProfilePage = Loadable(lazy(() => import('../../features/users/pages/ProfilePage').then(m => ({ default: m.ProfilePage }))));
const RestaurantsPage = Loadable(lazy(() => import('../../features/restaurants/components/RestaurantsPage').then(m => ({ default: m.RestaurantsPage }))));
const RestaurantMenu = Loadable(lazy(() => import('../../features/restaurants/components/RestaurantMenu').then(m => ({ default: m.RestaurantMenu }))));
const TablesPage = Loadable(lazy(() => import('../../features/restaurants/components/TablesPage').then(m => ({ default: m.TablesPage }))));
const StaffPage = Loadable(lazy(() => import('../../features/restaurants/components/StaffPage').then(m => ({ default: m.StaffPage }))));
const RestaurantDashboard = Loadable(lazy(() => import('../../features/restaurants/components/RestaurantDashboard').then(m => ({ default: m.RestaurantDashboard }))));
const OrdersKanban = Loadable(lazy(() => import('../../features/orders/components/OrdersKanban').then(m => ({ default: m.OrdersKanban }))));
const ReservationsKanban = Loadable(lazy(() => import('../../features/reservations/components/ReservationsKanban').then(m => ({ default: m.ReservationsKanban }))));
const PublicMenu = Loadable(lazy(() => import('../../features/public/pages/PublicMenu').then(m => ({ default: m.PublicMenu }))));
const EventsFeed = Loadable(lazy(() => import('../../features/events/pages/EventsFeed').then(m => ({ default: m.EventsFeed }))));
const AdminUserManagement = Loadable(lazy(() => import('../../features/users/pages/AdminUserManagement').then(m => ({ default: m.AdminUserManagement }))));
const DashboardLayout = Loadable(lazy(() => import('../layouts/DashboardLayout').then(m => ({ default: m.DashboardLayout }))));

const ClientHistory = Loadable(lazy(() => import('../../features/public/pages/ClientHistory').then(m => ({ default: m.ClientHistory }))));
const AdminEventsPage = Loadable(lazy(() => import('../../features/events/pages/AdminEventsPage').then(m => ({ default: m.AdminEventsPage }))));
const AnalyticsDashboard = Loadable(lazy(() => import('../../features/restaurants/pages/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard }))));
const GlobalAnalytics = Loadable(lazy(() => import('../../features/restaurants/pages/GlobalAnalytics').then(m => ({ default: m.GlobalAnalytics }))));
const ExportAnalytics = Loadable(lazy(() => import('../../features/restaurants/pages/ExportAnalytics').then(m => ({ default: m.ExportAnalytics }))));
const GlobalClients = Loadable(lazy(() => import('../../features/users/pages/GlobalClients').then(m => ({ default: m.GlobalClients }))));
const KitchenDisplay = Loadable(lazy(() => import('../../features/orders/pages/KitchenDisplay').then(m => ({ default: m.KitchenDisplay }))));
const DashboardIndex = Loadable(lazy(() => import('../../features/dashboard/pages/DashboardIndex').then(m => ({ default: m.DashboardIndex }))));


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
        path: 'analytics/export',
        element: (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN_ROLE']}>
            <ExportAnalytics />
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
