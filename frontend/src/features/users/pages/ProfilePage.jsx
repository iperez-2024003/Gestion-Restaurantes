import { useState, useEffect } from 'react';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { toast } from 'react-hot-toast';
import { UserCircleIcon, KeyIcon } from '@heroicons/react/24/outline';

export const ProfilePage = () => {
  const { user, getProfile, updateProfile, changePassword, isLoading } = useAuthStore();
  
  // Estados del Formulario de Perfil
  const [profileData, setProfileData] = useState({
    name: '',
    surname: '',
    phone: '',
    profilePicture: null
  });
  
  // Estados del Formulario de Contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Cargar perfil al montar
  useEffect(() => {
    const fetchProfile = async () => {
      const result = await getProfile();
      if (result.success && result.data) {
        setProfileData({
          name: result.data.Name || '',
          surname: result.data.Surname || '',
          phone: result.data.UserProfile?.Phone || '',
          profilePicture: null // Se resetea para no enviar nulo por accidente
        });
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProfileChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePicture') {
      setProfileData({ ...profileData, [name]: files[0] });
    } else {
      setProfileData({ ...profileData, [name]: value });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const submitProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', profileData.name);
    formData.append('surname', profileData.surname);
    formData.append('phone', profileData.phone);
    if (profileData.profilePicture) {
      formData.append('profilePicture', profileData.profilePicture);
    }

    const result = await updateProfile(formData);
    if (result.success) {
      toast.success(result.message || 'Perfil actualizado correctamente');
      // Limpiar el input de file visualmente
      document.getElementById('profilePicture').value = '';
      setProfileData(prev => ({ ...prev, profilePicture: null }));
    } else {
      toast.error(result.error);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }

    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
    if (result.success) {
      toast.success(result.message || 'Contraseña cambiada exitosamente');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mi Perfil</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Panel Izquierdo: Información Básica */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="relative inline-block">
              {user?.UserProfile?.ProfilePicture ? (
                <img 
                  src={user.UserProfile.ProfilePicture} 
                  alt="Perfil" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-indigo-50 shadow-md mx-auto"
                />
              ) : (
                <UserCircleIcon className="w-32 h-32 text-gray-300 mx-auto" />
              )}
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900">{user?.Name} {user?.Surname}</h3>
            <p className="text-sm text-gray-500">@{user?.Username}</p>
            <p className="text-sm text-indigo-600 font-medium mt-1">{user?.Email}</p>
            
            <div className="mt-6 border-t border-gray-100 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Estado</span>
                <span className="font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Activo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Formularios */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Formulario de Perfil */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <UserCircleIcon className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-semibold text-gray-800">Actualizar Datos</h3>
            </div>
            <div className="p-6">
              <form onSubmit={submitProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text" name="name" required
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      value={profileData.name} onChange={handleProfileChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                    <input
                      type="text" name="surname" required
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      value={profileData.surname} onChange={handleProfileChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="text" name="phone" required pattern="\d{8}"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    value={profileData.phone} onChange={handleProfileChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Foto de Perfil (Opcional)</label>
                  <input
                    type="file" id="profilePicture" name="profilePicture" accept="image/*"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit" disabled={isLoading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-70 font-medium text-sm"
                  >
                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Formulario de Contraseña */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <KeyIcon className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-semibold text-gray-800">Cambiar Contraseña</h3>
            </div>
            <div className="p-6">
              <form onSubmit={submitPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                  <input
                    type="password" name="currentPassword" required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    value={passwordData.currentPassword} onChange={handlePasswordChange}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                    <input
                      type="password" name="newPassword" required minLength="8"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      value={passwordData.newPassword} onChange={handlePasswordChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva</label>
                    <input
                      type="password" name="confirmPassword" required minLength="8"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      value={passwordData.confirmPassword} onChange={handlePasswordChange}
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit" disabled={isLoading}
                    className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors disabled:opacity-70 font-medium text-sm"
                  >
                    {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
