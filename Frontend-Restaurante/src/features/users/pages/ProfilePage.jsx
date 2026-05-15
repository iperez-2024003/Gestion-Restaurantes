import { useState, useEffect } from 'react';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { toast } from 'react-hot-toast';
import { User, Key, Mail, Phone, Camera, Shield, Trash2, Loader2, Save, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';

export const ProfilePage = () => {
  const { user, getProfile, updateProfile, changePassword, isLoading } = useAuthStore();

  const [profileData, setProfileData] = useState({ name: '', surname: '', phone: '', profilePicture: null });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

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
  }, [getProfile]);

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
      toast.success('Perfil actualizado');
      if (document.getElementById('profilePicture')) document.getElementById('profilePicture').value = '';
      setProfileData(prev => ({ ...prev, profilePicture: null }));
    } else toast.error(result.error);
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) return toast.error('Las contraseñas no coinciden');
    const result = await changePassword(
      passwordData.currentPassword,
      passwordData.newPassword,
      passwordData.confirmPassword
    );
    if (result.success) {
      toast.success('Contraseña actualizada');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else toast.error(result.error);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Badge variant="primary" className="mb-2">Configuración de Usuario</Badge>
          <h1 className="text-4xl md:text-5xl font-black text-ink tracking-tighter uppercase leading-none">
            Mi <span className="text-primary-500">Perfil</span>
          </h1>
          <p className="text-muted-brown font-medium mt-2">Gestiona tu identidad y seguridad en BuenProvecho.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Info Lateral */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="text-center p-8">
            <div className="relative inline-block mb-6 group">
              <div className="w-32 h-32 rounded-3xl bg-primary-100 border-2 border-primary-200 overflow-hidden shadow-gold">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary-600">
                    <User size={48} />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary-500 rounded-2xl flex items-center justify-center border-4 border-primary-50 text-white shadow-lg">
                <Camera size={16} />
              </div>
            </div>

            <h3 className="text-2xl font-black text-ink uppercase tracking-tight leading-none mb-1">{user?.name} {user?.surname}</h3>
            <p className="text-xs font-bold text-primary-500 uppercase tracking-widest mb-6">@{user?.username}</p>

            <div className="space-y-3 text-left">
              <div className="p-4 bg-primary-50/50 rounded-2xl border border-primary-100 flex items-center gap-3">
                <Mail size={16} className="text-primary-500" />
                <div className="min-w-0">
                  <p className="text-[8px] font-black uppercase text-muted-brown tracking-widest">Email</p>
                  <p className="text-xs font-bold text-ink truncate">{user?.email}</p>
                </div>
              </div>
              <div className="p-4 bg-primary-50/50 rounded-2xl border border-primary-100 flex items-center gap-3">
                <Shield size={16} className="text-primary-500" />
                <div className="min-w-0">
                  <p className="text-[8px] font-black uppercase text-muted-brown tracking-widest">Rol del Sistema</p>
                  <p className="text-xs font-bold text-ink uppercase">{user?.role?.replace('_ROLE', '')}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-ink border-none p-6">
            <div className="flex items-center gap-4 text-black">
              <div className="p-2 bg-white/10 rounded-xl"><Sparkles size={20} className="text-primary-400" /></div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest">Club BuenProvecho</p>
                <p className="text-[10px] text-black/60 font-medium">Miembro desde {new Date(user?.createdAt).getFullYear() || '2024'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Formularios */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                <User size={20} />
              </div>
              <h3 className="text-xl font-black text-ink uppercase tracking-tight">Datos Personales</h3>
            </div>

            <form onSubmit={submitProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Nombre" name="name" value={profileData.name} onChange={handleProfileChange} required />
                <Input label="Apellido" name="surname" value={profileData.surname} onChange={handleProfileChange} required />
              </div>
              <Input label="Teléfono Móvil" name="phone" value={profileData.phone} onChange={handleProfileChange} required icon={Phone} placeholder="12345678" />

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-brown uppercase tracking-widest ml-1">Imagen de Perfil</label>
                <input type="file" id="profilePicture" name="profilePicture" accept="image/*" onChange={handleProfileChange} className="w-full text-[10px] text-muted-brown font-black file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:bg-primary-100 file:text-primary-700 hover:file:bg-primary-500 hover:file:text-white transition-all cursor-pointer" />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" isLoading={isLoading} className="w-full md:w-auto px-6 md:px-10">
                  <Save size={18} className="mr-2" /> Guardar Cambios
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                <Key size={20} />
              </div>
              <h3 className="text-xl font-black text-ink uppercase tracking-tight">Seguridad</h3>
            </div>

            <form onSubmit={submitPassword} className="space-y-6">
              <Input label="Contraseña Actual" name="currentPassword" type="password" value={passwordData.currentPassword} onChange={handlePasswordChange} required placeholder="••••••••" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Nueva Contraseña" name="newPassword" type="password" value={passwordData.newPassword} onChange={handlePasswordChange} required placeholder="Min. 8 caracteres" />
                <Input label="Confirmar Nueva" name="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={handlePasswordChange} required placeholder="Repite contraseña" />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" variant="ghost" isLoading={isLoading} className="w-full md:w-auto px-6 md:px-10 border-primary-200">
                  Actualizar Contraseña
                </Button>
              </div>
            </form>
          </Card>

          {/* Peligro */}
          <div className="bg-red-50 rounded-[2.5rem] border border-red-100 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6 text-center md:text-left">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-500"><Trash2 size={32} /></div>
              <div>
                <h4 className="text-xl font-black text-ink uppercase tracking-tight">Zona de Peligro</h4>
                <p className="text-xs text-red-600/70 font-medium mt-1 uppercase tracking-widest">La eliminación es irreversible</p>
              </div>
            </div>
            <Button variant="danger" className="w-full md:w-auto px-6 md:px-8" onClick={() => toast.error('Contacta a soporte para eliminar tu cuenta')}>
              Eliminar Cuenta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
