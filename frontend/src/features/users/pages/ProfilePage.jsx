import { useState, useEffect } from 'react';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { toast } from 'react-hot-toast';
import { User, Key, Mail, Phone, Camera, Shield, Trash2, Loader2, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export const ProfilePage = () => {
    const { user, getProfile, updateProfile, changePassword, isLoading } = useAuthStore();

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
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div>
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-[1.1] mb-2">
                        Mi <span className="text-purple-500">Perfil</span>
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
                        Gestiona tu identidad y seguridad en la plataforma
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Perfil Card */}
                <div className="lg:col-span-4">
                    <div className="bg-zinc-900/40 backdrop-blur-3xl rounded-[3rem] border border-purple-500/10 p-10 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-500/10 to-transparent" />

                        <div className="relative mb-8 group">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-zinc-800 border-4 border-zinc-900 overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-500">
                                {user?.profilePicture ? (
                                    <img src={user.profilePicture} alt="Perfil" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-purple-500">
                                        <User className="w-12 h-12" />
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-purple-600 rounded-2xl flex items-center justify-center border-4 border-zinc-900 text-white shadow-lg">
                                <Camera className="w-4 h-4" />
                            </div>
                        </div>

                        <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-1">{user?.name} {user?.surname}</h3>
                        <p className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em] mb-8">@{user?.username}</p>

                        <div className="w-full space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-zinc-950/40 rounded-2xl border border-zinc-800/50 text-left">
                                <Mail className="w-4 h-4 text-purple-500" />
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Email</span>
                                    <span className="text-xs font-bold text-zinc-300 truncate">{user?.email}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-zinc-950/40 rounded-2xl border border-zinc-800/50 text-left">
                                <Shield className="w-4 h-4 text-purple-500" />
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
                    <div className="bg-zinc-900/40 backdrop-blur-3xl rounded-[3rem] border border-purple-500/10 overflow-hidden shadow-2xl">
                        <div className="px-10 py-8 border-b border-purple-500/10 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                <User className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Datos Personales</h3>
                        </div>
                        <div className="p-10">
                            <form onSubmit={submitProfile} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Nombre</label>
                                        <input type="text" name="name" required value={profileData.name} onChange={handleProfileChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-purple-500 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Apellido</label>
                                        <input type="text" name="surname" required value={profileData.surname} onChange={handleProfileChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-purple-500 outline-none transition-all" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Teléfono Móvil</label>
                                    <div className="relative">
                                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                                        <input type="text" name="phone" required pattern="\d{8}" value={profileData.phone} onChange={handleProfileChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-white focus:border-purple-500 outline-none transition-all" placeholder="12345678" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Imagen de Perfil</label>
                                    <input type="file" id="profilePicture" name="profilePicture" accept="image/*" onChange={handleProfileChange} className="w-full text-[10px] text-zinc-500 font-black uppercase tracking-widest file:mr-6 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-purple-600/10 file:text-purple-500 hover:file:bg-purple-600 hover:file:text-white transition-all file:cursor-pointer" />
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button type="submit" disabled={isLoading} className="px-10 py-4 bg-purple-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-purple-500 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 flex items-center gap-3">
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Seguridad */}
                    <div className="bg-zinc-900/40 backdrop-blur-3xl rounded-[3rem] border border-purple-500/10 overflow-hidden shadow-2xl">
                        <div className="px-10 py-8 border-b border-purple-500/10 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                <Key className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Seguridad</h3>
                        </div>
                        <div className="p-10">
                            <form onSubmit={submitPassword} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Contraseña Actual</label>
                                    <input type="password" name="currentPassword" required value={passwordData.currentPassword} onChange={handlePasswordChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-purple-500 outline-none transition-all placeholder:text-zinc-800" placeholder="••••••••" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Nueva Contraseña</label>
                                        <input type="password" name="newPassword" required minLength="8" value={passwordData.newPassword} onChange={handlePasswordChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-purple-500 outline-none transition-all placeholder:text-zinc-800" placeholder="Min. 8 caracteres" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Confirmar Nueva</label>
                                        <input type="password" name="confirmPassword" required minLength="8" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-purple-500 outline-none transition-all placeholder:text-zinc-800" placeholder="Repite la contraseña" />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button type="submit" disabled={isLoading} className="px-10 py-4 bg-zinc-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-zinc-700 transition-all border border-zinc-700 disabled:opacity-50">
                                        {isLoading ? 'Sincronizando...' : 'Actualizar Contraseña'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Peligro */}
                    <div className="bg-red-600/5 rounded-[3rem] border border-red-600/20 p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-red-600/10 flex items-center justify-center text-red-500 shrink-0">
                                <Trash2 className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-white uppercase tracking-tight">Zona de Peligro</h4>
                                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">La eliminación de cuenta es irreversible</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                if (window.confirm('¿ESTÁS ABSOLUTAMENTE SEGURO?')) {
                                    toast.error('Acción restringida. Contacta a soporte.');
                                }
                            }}
                            className="px-8 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg shadow-red-600/10"
                        >
                            Eliminar Mi Cuenta
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};