import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'react-hot-toast';
import { KeyIcon } from '@heroicons/react/24/outline';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const { forgotPassword, isLoading } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await forgotPassword(email);
    
    if (result.success) {
      setIsSent(true);
      toast.success(result.message || 'Correo de recuperación enviado.');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg text-center">
        
        <div className="flex justify-center">
          <KeyIcon className="w-16 h-16 text-indigo-600" />
        </div>
        
        {!isSent ? (
          <>
            <div>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                Recuperar Contraseña
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Ingresa tu correo y te enviaremos un enlace para restablecerla.
              </p>
            </div>
            
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="sr-only">Correo Electrónico</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
                >
                  {isLoading ? 'Enviando...' : 'Enviar enlace'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">¡Correo Enviado!</h2>
            <p className="text-gray-600">
              Revisa la bandeja de entrada de <strong>{email}</strong> para continuar con el proceso.
            </p>
            <p className="text-sm text-gray-500">
              Si no lo ves, revisa tu carpeta de Spam.
            </p>
          </div>
        )}

        <div className="mt-6">
          <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            &larr; Volver al inicio de sesión
          </Link>
        </div>

      </div>
    </div>
  );
};
