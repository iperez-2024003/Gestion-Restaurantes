import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { RegisterPage } from '../../features/auth/pages/RegisterPage';
import { VerifyEmailPage } from '../../features/auth/pages/VerifyEmailPage';
import { ForgotPasswordPage } from '../../features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../../features/auth/pages/ResetPasswordPage';
import { ProfilePage } from '../../features/users/pages/ProfilePage';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
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
        element: (
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800">Vista General</h3>
            <p className="text-gray-600 mt-2">Bienvenido a tu panel administrativo.</p>
            <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <p className="text-indigo-800">
                Usa el menú lateral para navegar por las diferentes opciones de tu rol.
              </p>
            </div>
          </div>
        )
      },
      {
        path: 'profile',
        element: <ProfilePage />
      },
      // Aquí se agregarían las demás sub-rutas protegidas
      // Ejemplo: { path: 'global-stats', element: <GlobalStats /> }
    ]
  },
]);
