import { useState, useEffect } from 'react';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useToast } from '../../../shared/hooks/useToastStore';
import { User, Key, Mail, Phone, Camera, Shield, Trash2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import FormInput, { FormTextarea } from '../../../shared/components/forms/FormInput';
import UnifiedButton from '../../../shared/components/ui/UnifiedButton';
import Card from '../../../shared/components/ui/Card';
import { spacing, typography } from '../../../shared/constants/uiConstants';

export const ProfilePage = () => {
  const { user, getProfile, updateProfile, changePassword, isLoading } = useAuthStore();
  const toast = useToast();
  
  const [profileData, setProfileData] = useState({
    name: '', surname: '', phone: '', profilePicture: null
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const result = await getProfile();
      if (result.success && result.data) {
        setProfileData({
          name: result.data.name || '',
          surname: result.data.surname || '',
          phone: result.data.phone || '',
          profilePicture: null,
        });
      }
    };
    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePicture') setProfileData({ ...profileData, [name]: files[0] });
    else setProfileData({ ...profileData, [name]: value });
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
    if (profileData.profilePicture) formData.append('profilePicture', profileData.profilePicture);

    const result = await updateProfile(formData);
    if (result.success) {
      toast.success('Perfil actualizado con éxito');
      if (document.getElementById('profilePicture')) document.getElementById('profilePicture').value = '';
      setProfileData(prev => ({ ...prev, profilePicture: null }));
    } else toast.error(result.error);
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }
    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
    if (result.success) {
      toast.success('Contraseña actualizada');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else toast.error(result.error);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 px-4 md:px-0">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black text-zinc-900 tracking-tighter uppercase leading-[1.1] mb-2">
            Mi <span className="text-[#b98c52]">Perfil</span>
          </h1>
          <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">
            Gestiona tu identidad y seguridad en la plataforma
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Perfil Card */}
        <div className="lg:col-span-4">
          <div className="bg-white/80 backdrop-blur-3xl rounded-[3rem] border border-[#dcc7a5]/70 p-6 md:p-10 flex flex-col items-center text-center shadow-[0_30px_100px_rgba(110,80,45,0.14)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#f4e7cf] to-transparent" />
            
            <div className="relative mb-8 group">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] bg-[#fffaf3] border-4 border-[#dcc7a5] overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-500">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#fffaf3] text-[#b98c52]">
                    <User className="w-12 h-12" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#d7b77f] rounded-2xl flex items-center justify-center border-4 border-white text-white shadow-lg">
                <Camera className="w-4 h-4" />
              </div>
            </div>

            <h3 className="text-xl md:text-2xl font-black text-zinc-900 uppercase tracking-tight mb-1">{user?.name} {user?.surname}</h3>
            <p className="text-[10px] font-black text-[#b98c52] uppercase tracking-[0.2em] mb-8">@{user?.username}</p>
            
            <div className="w-full space-y-4">
              <div className="flex items-center gap-4 p-4 bg-[#fffaf3] rounded-2xl border border-[#dcc7a5] text-left">
                <Mail className="w-4 h-4 text-[#b98c52]" />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Email</span>
                  <span className="text-xs font-bold text-zinc-700 truncate">{user?.email}</span>
                  </div>
               </div>
              <div className="flex items-center gap-4 p-4 bg-[#fffaf3] rounded-2xl border border-[#dcc7a5] text-left">
                <Shield className="w-4 h-4 text-[#b98c52]" />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Estado</span>
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Verificado</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Formularios */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Actualizar Perfil */}
            <Card title="Datos Personales" variant="elevated">
            <form onSubmit={submitProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Nombre"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  required
                />
                <FormInput
                  label="Apellido"
                  name="surname"
                  value={profileData.surname}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              <FormInput
                label="Teléfono"
                name="phone"
                type="tel"
                value={profileData.phone}
                onChange={handleProfileChange}
                required
                icon={Phone}
                pattern="\d{8}"
                placeholder="12345678"
              />

              <div className="space-y-2">
                <label style={typography.label} className="text-zinc-500 px-1">
                  Imagen de Perfil
                </label>
                <input 
                  type="file" 
                  id="profilePicture" 
                  name="profilePicture" 
                  accept="image/*" 
                  onChange={handleProfileChange} 
                  className="w-full text-[10px] text-zinc-500 font-black uppercase tracking-widest file:mr-6 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-[#f3e4ca] file:text-[#8b6435] hover:file:bg-[#d7b77f] hover:file:text-white transition-all file:cursor-pointer" 
                />
              </div>

              <div className="flex justify-end pt-4">
                <UnifiedButton 
                  variant="primary" 
                  size="md"
                  icon={Save}
                  type="submit"
                  disabled={isLoading}
                  loading={isLoading}
                >
                  Guardar Cambios
                </UnifiedButton>
              </div>
            </form>
          </Card>

          {/* Seguridad */}
          <Card title="Seguridad" variant="elevated">
            <form onSubmit={submitPassword} className="space-y-6">
              <FormInput
                label="Contraseña Actual"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                icon={Key}
                placeholder="••••••••"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Nueva Contraseña"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                  placeholder="Min. 8 caracteres"
                  helpText="Mínimo 8 caracteres"
                />
                <FormInput
                  label="Confirmar Nueva"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                  placeholder="Repite la contraseña"
                />
              </div>

              <div className="flex justify-end pt-4">
                <UnifiedButton 
                  variant="secondary"
                  size="md"
                  type="submit"
                  disabled={isLoading}
                  loading={isLoading}
                >
                  Actualizar Contraseña
                </UnifiedButton>
              </div>
            </form>
          </Card>

          {/* Peligro */}
          <Card variant="elevated" padding="lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 style={typography.h4} className="text-zinc-900 uppercase">Zona de Peligro</h4>
                  <p style={typography.bodySmall} className="text-zinc-500 mt-1">La eliminación de cuenta es irreversible</p>
                </div>
              </div>
              <UnifiedButton 
                variant="danger"
                size="md"
                onClick={() => {
                  if (window.confirm('¿ESTÁS ABSOLUTAMENTE SEGURO?')) {
                    toast.error('Acción restringida. Contacta a soporte.');
                  }
                }}
              >
                Eliminar Mi Cuenta
              </UnifiedButton>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};
