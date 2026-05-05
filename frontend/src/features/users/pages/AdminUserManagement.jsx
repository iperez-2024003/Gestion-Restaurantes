import { useState, useEffect } from 'react';
import api from '../../../shared/api/axios';
import { toast } from 'react-hot-toast';
import { useRestaurantStore } from '../../restaurants/store/useRestaurantStore';
import { UserPlus, ShieldCheck, Mail, Phone, Lock, Building2, User, Loader2, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

export const AdminUserManagement = () => {
  const [loading, setLoading] = useState(false);
  const { restaurants, getRestaurants } = useRestaurantStore();
  const [formData, setFormData] = useState({
    name: '', surname: '', username: '', email: '', password: '', phone: '', role: 'RESTAURANT_ADMIN_ROLE', restaurant_id: ''
  });

  useEffect(() => {
    getRestaurants();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      const res = await api.post('/auth/register', data);
      if (res.data.success) {
        toast.success('¡Gerente creado exitosamente!');
        setFormData({ name: '', surname: '', username: '', email: '', password: '', phone: '', role: 'RESTAURANT_ADMIN_ROLE', restaurant_id: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tighter uppercase leading-[1.1] mb-2">
            Gestión de <span className="text-[#b98c52]">Usuarios</span>
        </h1>
          <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">
           Administración global de accesos y jerarquías
        </p>
      </div>

        <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-3xl rounded-[3rem] border border-[#dcc7a5]/70 shadow-[0_30px_100px_rgba(110,80,45,0.14)] overflow-hidden px-4 md:px-0">
        <div className="p-4 md:p-12">
          <div className="flex items-center gap-6 mb-8 md:mb-12">
            <div className="w-10 h-10 md:w-16 md:h-16 bg-[#f3e4ca] text-[#b98c52] rounded-[1.5rem] flex items-center justify-center">
              <UserPlus className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">Crear Nuevo Gerente</h2>
               <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Asignación de administrador de sede</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Nombre</label>
                <div className="relative">
                   <User className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                   <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-[#fffaf3] border border-[#dcc7a5] rounded-2xl pl-10 md:pl-14 pr-4 md:pr-6 py-3 md:py-4 text-zinc-900 font-bold focus:border-[#b98c52] transition-all outline-none" placeholder="Nombre" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Apellido</label>
                <input required name="surname" value={formData.surname} onChange={handleChange} className="w-full bg-[#fffaf3] border border-[#dcc7a5] rounded-2xl px-4 md:px-6 py-3 md:py-4 text-zinc-900 font-bold focus:border-[#b98c52] transition-all outline-none" placeholder="Apellido" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Nombre de Usuario</label>
                <input required name="username" value={formData.username} onChange={handleChange} className="w-full bg-[#fffaf3] border border-[#dcc7a5] rounded-2xl px-4 md:px-6 py-3 md:py-4 text-zinc-900 font-bold focus:border-[#b98c52] transition-all outline-none" placeholder="admin_sede" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Teléfono</label>
                <div className="relative">
                   <Phone className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                   <input required name="phone" pattern="\d{8}" value={formData.phone} onChange={handleChange} className="w-full bg-[#fffaf3] border border-[#dcc7a5] rounded-2xl pl-10 md:pl-14 pr-4 md:pr-6 py-3 md:py-4 text-zinc-900 font-bold focus:border-[#b98c52] transition-all outline-none" placeholder="12345678" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Email Institucional</label>
              <div className="relative">
                 <Mail className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                 <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#fffaf3] border border-[#dcc7a5] rounded-2xl pl-12 md:pl-14 pr-6 py-4 text-zinc-900 font-bold focus:border-[#b98c52] transition-all outline-none" placeholder="gerente@buenprovecho.com" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Contraseña Provisoria</label>
                <div className="relative">
                   <Lock className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                   <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-[#fffaf3] border border-[#dcc7a5] rounded-2xl pl-12 md:pl-14 pr-6 py-4 text-zinc-900 font-bold focus:border-[#b98c52] transition-all outline-none" placeholder="••••••••" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Rango del Perfil</label>
                <div className="w-full bg-[#f3e4ca] border border-[#dcc7a5] rounded-2xl px-6 py-4 text-[#8b6435] font-black text-xs flex items-center gap-3 uppercase tracking-widest">
                  <ShieldCheck className="w-5 h-5" /> Gerente de Sede
                </div>
                <input type="hidden" name="role" value="RESTAURANT_ADMIN_ROLE" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Sede Asignada</label>
              <div className="relative">
                <Building2 className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                <select required name="restaurant_id" value={formData.restaurant_id} onChange={handleChange} className="w-full bg-[#fffaf3] border border-[#dcc7a5] rounded-2xl pl-10 md:pl-14 pr-4 md:pr-6 py-3 md:py-4 text-zinc-900 font-bold focus:border-[#b98c52] transition-all outline-none appearance-none cursor-pointer uppercase text-xs tracking-widest">
                   <option value="">Selecciona un restaurante...</option>
                   {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                 </select>
              </div>
              {restaurants.length === 0 && (
                <p className="text-[10px] text-red-500 font-black uppercase tracking-widest px-2 mt-2">⚠️ No hay sedes activas en el sistema</p>
              )}
            </div>

            <div className="pt-6 md:pt-8">
              <button type="submit" disabled={loading} className="w-full py-4 md:py-6 rounded-[2rem] bg-gradient-to-r from-[#d7b77f] to-[#b98c52] text-white font-black hover:to-[#a97d45] transition-all uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 group shadow-lg shadow-[rgba(185,140,82,0.18)] disabled:opacity-50">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5 group-hover:scale-125 transition-transform" />}
                {loading ? 'Procesando Registro...' : 'Dar de Alta Gerente'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
