import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'react-hot-toast';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { resetPassword, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('El enlace es inválido o no contiene un token.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }

    const result = await resetPassword(token, newPassword);
    
    if (result.success) {
      toast.success(result.message || 'Contraseña actualizada correctamente.');
      navigate('/login');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg text-center">
        
        <div className="flex justify-center">
          <ShieldCheckIcon className="w-16 h-16 text-indigo-600" />
        </div>
        
        <div>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            Nueva Contraseña
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.
          </p>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-gray-700 text-left block" htmlFor="newPassword">
              Nueva Contraseña
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              minLength="8"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="Min. 8 caracteres (1 Mayúscula, 1 Número)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 text-left block" htmlFor="confirmPassword">
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !token}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {isLoading ? 'Guardando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            &larr; Volver al inicio de sesión
          </Link>
        </div>

      </div>
    </div>
  );
};
