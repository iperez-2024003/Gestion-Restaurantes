import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    profilePicture: null
  });
  
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePicture') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Armar el FormData
    const data = new FormData();
    data.append('name', formData.name);
    data.append('surname', formData.surname);
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('phone', formData.phone);
    if (formData.profilePicture) {
      data.append('profilePicture', formData.profilePicture);
    }

    const result = await register(data);
    
    if (result.success) {
      toast.success(result.message || '¡Registro exitoso! Por favor verifica tu correo.');
      navigate('/login');
    } else {
      toast.error(result.error);
      if (result.details && result.details.length > 0) {
        // Mostrar el primer error de validación específico
        toast.error(result.details[0].message);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Crear una Cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Únete y comienza a pedir en los mejores restaurantes
          </p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700" htmlFor="name">Nombre</label>
              <input
                id="name" name="name" type="text" required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                value={formData.name} onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700" htmlFor="surname">Apellido</label>
              <input
                id="surname" name="surname" type="text" required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                value={formData.surname} onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="username">Usuario</label>
            <input
              id="username" name="username" type="text" required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              value={formData.username} onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="email">Email</label>
            <input
              id="email" name="email" type="email" required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              value={formData.email} onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="password">Contraseña</label>
            <input
              id="password" name="password" type="password" required minLength="8"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              value={formData.password} onChange={handleChange}
            />
            <p className="mt-1 text-xs text-gray-500">Mínimo 8 caracteres, 1 mayúscula, 1 número.</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="phone">Teléfono</label>
            <input
              id="phone" name="phone" type="text" required pattern="\d{8}"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="12345678"
              value={formData.phone} onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="profilePicture">Foto de Perfil (Opcional)</label>
            <input
              id="profilePicture" name="profilePicture" type="file" accept="image/jpeg, image/png, image/webp"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              onChange={handleChange}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit" disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Inicia sesión
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
