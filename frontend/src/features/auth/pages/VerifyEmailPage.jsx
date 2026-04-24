import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Verificando tu cuenta...');
  const { verifyEmail } = useAuthStore();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('El enlace es inválido o no contiene un token.');
      return;
    }

    const processVerification = async () => {
      const result = await verifyEmail(token);
      if (result.success) {
        setStatus('success');
        setMessage(result.message || 'Tu correo ha sido verificado exitosamente.');
      } else {
        setStatus('error');
        setMessage(result.error);
      }
    };

    processVerification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg text-center">
        
        {status === 'loading' && (
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900">{message}</h2>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircleIcon className="w-20 h-20 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Cuenta Verificada!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              to="/login"
              className="w-full flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Ir a Iniciar Sesión
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <XCircleIcon className="w-20 h-20 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error de Verificación</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              to="/login"
              className="w-full flex justify-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Volver al Inicio
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};
