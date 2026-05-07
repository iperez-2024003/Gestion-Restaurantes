import { createBrowserRouter, Navigate } from 'react-router-dom';
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

import { ClientHistory } from '../../features/public/pages/ClientHistory';
import { AdminEventsPage } from '../../features/events/pages/AdminEventsPage';
import { AnalyticsDashboard } from '../../features/restaurants/pages/AnalyticsDashboard';
import { GlobalAnalytics } from '../../features/restaurants/pages/GlobalAnalytics';
import { GlobalClients } from '../../features/users/pages/GlobalClients';
import { KitchenDisplay } from '../../features/orders/pages/KitchenDisplay';
import { DashboardIndex } from '../../features/dashboard/pages/DashboardIndex';


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
