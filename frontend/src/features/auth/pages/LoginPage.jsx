import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const { login, resendVerification, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNeedsVerification(false);
    // Le pasamos el valor de email como 'emailOrUsername'
    const result = await login(email, password);
    
    if (result.success) {
      toast.success('¡Bienvenido!');
      navigate('/dashboard'); 
    } else {
      toast.error(result.error);
      if (result.error.toLowerCase().includes('verificar tu email')) {
        setNeedsVerification(true);
      }
    }
  };

  const handleResend = async () => {
    if (!email) return;
    const result = await resendVerification(email);
    if (result.success) {
      toast.success(result.message);
      setNeedsVerification(false);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa a tu portal de Gestión de Restaurantes
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="sr-only" htmlFor="email-address">Email</label>
              <input
                id="email-address"
                name="email"
                type="text"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Correo o Nombre de Usuario"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="password">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {isLoading ? 'Cargando...' : 'Entrar'}
            </button>
          </div>

          {needsVerification && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-md">
              <p className="text-sm text-orange-800 text-center mb-3">
                Tu cuenta no está verificada.
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-orange-300 rounded-md shadow-sm text-sm font-medium text-orange-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                {isLoading ? 'Enviando...' : 'Reenviar enlace de verificación'}
              </button>
            </div>
          )}
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
