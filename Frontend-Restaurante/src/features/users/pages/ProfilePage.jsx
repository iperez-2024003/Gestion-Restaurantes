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
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="bg-[#b98c52] text-[#1c1712] rounded-none p-8 md:p-14 shadow-[16px_16px_0px_#1c1712] border-4 border-[#1c1712] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-20 hidden md:block">
           <User className="w-48 h-48 text-[#1c1712]" />
        </div>
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center rounded-none border-2 border-[#1c1712] bg-[#fffaf3] px-4 py-2 shadow-[4px_4px_0px_#1c1712]">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1c1712]">Security & Identity</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8] mb-8">
            Mi <span className="text-[#fffaf3]">Perfil</span>
          </h1>
          <p className="max-w-2xl text-[#1c1712] font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs leading-relaxed">
            Gestiona tu identidad y seguridad en BuenProvecho. Diseño neobrutalista premium para tu cuenta personal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Info Lateral */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white border-4 border-[#1c1712] rounded-none p-4 shadow-[10px_10px_0px_#1c1712] text-center">
            <div className="relative inline-block mb-8 group">
              <div className="w-36 h-36 rounded-none bg-[#fffaf3] border-4 border-[#1c1712] overflow-hidden shadow-[6px_6px_0px_#b98c52]">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#1c1712]">
                    <User size={64} />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-[#b98c52] rounded-none border-4 border-[#1c1712] flex items-center justify-center text-[#fffaf3] shadow-[4px_4px_0px_#1c1712]">
                <Camera size={20} />
              </div>
            </div>

            <h3 className="text-xl font-black text-[#1c1712] uppercase tracking-tighter leading-tight mb-2 break-words px-2">{user?.name} {user?.surname}</h3>
            <p className="text-xs font-black text-[#b98c52] uppercase tracking-[0.5em] mb-8">@{user?.username}</p>

            <div className="space-y-5 text-left">
              <div className="p-4 bg-[#fffaf3] border-4 border-[#1c1712] rounded-none shadow-[4px_4px_0px_#1c1712] flex items-center gap-4">
                <Mail size={18} className="text-[#b98c52]" />
                <div className="min-w-0">
                  <p className="text-[8px] font-black uppercase text-zinc-500 tracking-[0.3em] mb-1">Email Verificado</p>
                  <p className="text-xs font-black text-[#1c1712] truncate">{user?.email}</p>
                </div>
              </div>
              <div className="p-4 bg-[#fffaf3] border-4 border-[#1c1712] rounded-none shadow-[4px_4px_0px_#1c1712] flex items-center gap-4">
                <Shield size={18} className="text-[#b98c52]" />
                <div className="min-w-0">
                  <p className="text-[8px] font-black uppercase text-zinc-500 tracking-[0.3em] mb-1">Autorización</p>
                  <p className="text-xs font-black text-[#1c1712] uppercase tracking-tighter">{user?.role?.replace('_ROLE', '')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1c1712] border-4 border-[#1c1712] rounded-none p-6 shadow-[10px_10px_0px_#b98c52]">
            <div className="flex items-center gap-4 text-[#fffaf3]">
              <div className="p-3 bg-[#fffaf3] rounded-none border-2 border-[#1c1712]"><Sparkles size={24} className="text-[#b98c52]" /></div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#b98c52]">Club Gourmet</p>
                <p className="text-[9px] text-[#fffaf3]/60 font-black uppercase tracking-[0.4em]">Miembro desde {new Date(user?.createdAt).getFullYear() || '2024'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-9 space-y-16">
          <div className="bg-white border-4 border-[#1c1712] rounded-none p-10 md:p-14 shadow-[12px_12px_0px_#1c1712]">
            <div className="flex items-center gap-5 mb-14">
              <div className="w-14 h-14 bg-[#fffaf3] border-4 border-[#1c1712] rounded-none flex items-center justify-center text-[#1c1712] shadow-[4px_4px_0px_#1c1712]">
                <User size={32} />
              </div>
              <h3 className="text-4xl font-black text-[#1c1712] uppercase tracking-tighter">Datos Personales</h3>
            </div>

            <form onSubmit={submitProfile} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <Input label="Nombre" name="name" value={profileData.name} onChange={handleProfileChange} required />
                <Input label="Apellido" name="surname" value={profileData.surname} onChange={handleProfileChange} required />
              </div>
              <Input label="Teléfono Móvil" name="phone" value={profileData.phone} onChange={handleProfileChange} required icon={Phone} placeholder="12345678" />

              <div className="space-y-4">
                <label className="text-[11px] font-black text-[#1c1712] uppercase tracking-[0.4em] block">Subir Avatar</label>
                <input type="file" id="profilePicture" name="profilePicture" accept="image/*" onChange={handleProfileChange} className="w-full text-[10px] text-[#1c1712] font-black file:mr-8 file:py-4 file:px-8 file:rounded-none file:border-4 file:border-[#1c1712] file:text-[11px] file:font-black file:uppercase file:bg-[#fffaf3] file:text-[#1c1712] file:shadow-[4px_4px_0px_#1c1712] hover:file:shadow-[6px_6px_0px_#1c1712] file:cursor-pointer transition-all" />
              </div>

              <div className="flex justify-end pt-8">
                <button type="submit" disabled={isLoading} className="w-full md:w-auto px-12 py-6 bg-[#1c1712] text-[#fffaf3] border-4 border-[#1c1712] rounded-none font-black uppercase tracking-[0.3em] text-xs shadow-[8px_8px_0px_#b98c52] transition-all hover:-translate-y-2 hover:shadow-[12px_12px_0px_#b98c52] active:translate-y-2 active:shadow-none disabled:opacity-50">
                  {isLoading ? <Loader2 className="animate-spin mx-auto" /> : <><Save size={24} className="mr-4" /> Guardar Cambios</>}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white border-4 border-[#1c1712] rounded-none p-10 md:p-14 shadow-[12px_12px_0px_#1c1712]">
            <div className="flex items-center gap-5 mb-14">
              <div className="w-14 h-14 bg-[#fffaf3] border-4 border-[#1c1712] rounded-none flex items-center justify-center text-[#1c1712] shadow-[4px_4px_0px_#1c1712]">
                <Key size={32} />
              </div>
              <h3 className="text-4xl font-black text-[#1c1712] uppercase tracking-tighter">Seguridad de la Cuenta</h3>
            </div>

            <form onSubmit={submitPassword} className="space-y-10">
              <Input label="Contraseña Actual" name="currentPassword" type="password" value={passwordData.currentPassword} onChange={handlePasswordChange} required placeholder="••••••••" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <Input label="Nueva Contraseña" name="newPassword" type="password" value={passwordData.newPassword} onChange={handlePasswordChange} required placeholder="Mín. 8 caracteres" />
                <Input label="Confirmar Nueva" name="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={handlePasswordChange} required placeholder="Repite contraseña" />
              </div>
              <div className="flex justify-end pt-8">
                <button type="submit" disabled={isLoading} className="w-full md:w-auto px-12 py-6 bg-[#fffaf3] text-[#1c1712] border-4 border-[#1c1712] rounded-none font-black uppercase tracking-[0.3em] text-xs shadow-[8px_8px_0px_#1c1712] transition-all hover:-translate-y-2 hover:shadow-[12px_12px_0px_#1c1712] active:translate-y-2 active:shadow-none disabled:opacity-50">
                  {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Actualizar Contraseña'}
                </button>
              </div>
            </form>
          </div>

          {/* Peligro */}
          <div className="bg-[#fffaf3] rounded-none border-4 border-[#1c1712] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 shadow-[12px_12px_0px_#ef4444]">
            <div className="flex items-center gap-8 text-center md:text-left">
              <div className="w-20 h-20 bg-[#ef4444] rounded-none border-4 border-[#1c1712] flex items-center justify-center text-[#fffaf3] shadow-[6px_6px_0px_#1c1712]"><Trash2 size={40} /></div>
              <div>
                <h4 className="text-3xl font-black text-[#1c1712] uppercase tracking-tight leading-none mb-2">Zona de Peligro</h4>
                <p className="text-[11px] text-[#ef4444] font-black uppercase tracking-[0.4em]">Eliminación permanente de la cuenta</p>
              </div>
            </div>
            <button className="w-full md:w-auto px-12 py-6 bg-[#ef4444] text-[#fffaf3] border-4 border-[#1c1712] rounded-none font-black uppercase tracking-[0.3em] text-xs shadow-[6px_6px_0px_#1c1712] transition-all hover:-translate-y-2 hover:shadow-[10px_10px_0px_#1c1712] active:translate-y-2 active:shadow-none" onClick={() => toast.error('Contacta a soporte para eliminar tu cuenta')}>
              Eliminar Cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
