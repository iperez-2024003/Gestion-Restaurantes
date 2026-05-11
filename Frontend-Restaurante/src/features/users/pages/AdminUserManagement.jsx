import { useState, useEffect } from 'react';
import api from '../../../shared/api/axios';
import { toast } from 'react-hot-toast';
import { useRestaurantStore } from '../../restaurants/store/useRestaurantStore';
import { UserPlus, ShieldCheck, Mail, Phone, Lock, Building2, User, Loader2, Rocket, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';

export const AdminUserManagement = () => {
  const [loading, setLoading] = useState(false);
  const { restaurants, getRestaurants } = useRestaurantStore();
  const [formData, setFormData] = useState({
    name: '', surname: '', username: '', email: '', password: '', phone: '', role: 'RESTAURANT_ADMIN_ROLE', restaurant_id: ''
  });

  useEffect(() => { getRestaurants(); }, [getRestaurants]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.restaurant_id) return toast.error('Selecciona una sede asignada');

    try {
      setLoading(true);
      // Enviar como JSON en lugar de FormData
      const res = await api.post('/auth/create-manager', {
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        role: formData.role,
        restaurant_id: formData.restaurant_id,
      });
      if (res.data.success) {
        toast.success('¡Gerente creado exitosamente!');
        setFormData({ name: '', surname: '', username: '', email: '', password: '', phone: '', role: 'RESTAURANT_ADMIN_ROLE', restaurant_id: '' });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error al crear el usuario';
      toast.error(errorMessage);
      console.error('Error al crear gerente:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Badge variant="primary" className="mb-2">Control de Accesos</Badge>
          <h1 className="text-4xl md:text-5xl font-black text-ink tracking-tighter uppercase leading-none">
            Gestión de <span className="text-primary-500">Usuarios</span>
          </h1>
          <p className="text-muted-brown font-medium mt-2">Administración global de gerencias y jerarquías operativas.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="p-8 md:p-12">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-[1.5rem] flex items-center justify-center border border-primary-200">
              <UserPlus size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-ink uppercase tracking-tight">Dar de Alta Gerente</h2>
              <p className="text-[10px] font-black uppercase text-muted-brown tracking-[0.2em]">Asignación de administrador de sede oficial</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sección 1: Identidad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Nombre" name="name" value={formData.name} onChange={handleChange} required icon={User} />
              <Input label="Apellido" name="surname" value={formData.surname} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Nombre de Usuario" name="username" value={formData.username} onChange={handleChange} required placeholder="ej: mario_chef" />
              <Input label="Teléfono Móvil" name="phone" value={formData.phone} onChange={handleChange} required icon={Phone} placeholder="12345678" />
            </div>

            {/* Sección 2: Credenciales */}
            <div className="space-y-6">
              <Input label="Email Institucional" name="email" type="email" value={formData.email} onChange={handleChange} required icon={Mail} placeholder="gerente@buenprovecho.com" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Contraseña Temporal" name="password" type="password" value={formData.password} onChange={handleChange} required icon={Lock} placeholder="••••••••" />
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-muted-brown tracking-widest ml-1">Rango del Perfil</label>
                  <div className="h-11 px-4 bg-primary-100/50 rounded-xl border border-primary-200 text-primary-700 text-xs font-black flex items-center gap-3 uppercase tracking-widest">
                    <ShieldCheck size={18} /> Gerente de Sede
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 3: Asignación */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-muted-brown tracking-widest ml-1">Sede de Operación</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={18} />
                <select
                  name="restaurant_id" value={formData.restaurant_id} onChange={handleChange} required
                  className="w-full h-11 pl-12 pr-4 bg-white border border-primary-200 rounded-xl text-sm font-bold text-ink outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none cursor-pointer uppercase tracking-widest"
                >
                  <option value="">Seleccionar Sede...</option>
                  {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              {restaurants.length === 0 && (
                <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mt-2 px-1 flex items-center gap-2">
                  ⚠️ Debes crear una sede primero
                </p>
              )}
            </div>

            <div className="pt-8 border-t border-primary-100">
              <Button type="submit" isLoading={loading} className="w-full py-6 text-xs tracking-[0.2em]">
                {loading ? 'Dando de Alta...' : <><Rocket size={18} className="mr-2" /> Activar Credenciales de Gerencia</>}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
