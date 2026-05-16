import { useState, useEffect } from 'react';
import api from '../../../shared/api/axios';
import { toast } from 'react-hot-toast';
import { useRestaurantStore } from '../../restaurants/store/useRestaurantStore';
import { UserPlus, ShieldCheck, Mail, Phone, Lock, Building2, User, Loader2, Rocket, UserCheck, Edit2, Check, X, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';

export const AdminUserManagement = () => {
  const [loading, setLoading] = useState(false);
  const [managersLoading, setManagersLoading] = useState(true);
  const [managers, setManagers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const { restaurants, getRestaurants } = useRestaurantStore();
  const [formData, setFormData] = useState({
    name: '', surname: '', username: '', email: '', password: '', phone: '', role: 'RESTAURANT_ADMIN_ROLE', restaurant_id: ''
  });

  useEffect(() => { 
    getRestaurants();
    fetchManagers();
  }, [getRestaurants]);

  const fetchManagers = async () => {
    try {
      setManagersLoading(true);
      const res = await api.get('/auth/managers');
      if (res.data.success) {
        setManagers(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching managers:', error);
      toast.error('Error al cargar gerentes');
    } finally {
      setManagersLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.restaurant_id) return toast.error('Selecciona una sede asignada');

    try {
      setLoading(true);
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
        fetchManagers();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error al crear el usuario';
      toast.error(errorMessage);
      console.error('Error al crear gerente:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateManagerRestaurant = async (managerId, newRestaurantId) => {
    if (!newRestaurantId) {
      toast.error('Selecciona una sede');
      return;
    }

    try {
      const res = await api.patch(`/auth/managers/${managerId}/restaurant`, {
        restaurant_id: newRestaurantId,
      });
      if (res.data.success) {
        toast.success('Sede actualizada exitosamente');
        setEditingId(null);
        fetchManagers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar sede');
    }
  };

  const handleDeleteManager = async (managerId, name) => {
    if (!window.confirm(`¿Seguro que deseas eliminar a ${name}? Esta acción es permanente.`)) return;

    try {
      const res = await api.delete(`/auth/managers/${managerId}`);
      if (res.data.success) {
        toast.success('Gerente eliminado exitosamente');
        fetchManagers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar gerente');
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
            <div className="w-16 h-16 bg-[#fffaf3] text-[#1c1712] rounded-none flex items-center justify-center border-2 border-[#1c1712] shadow-[4px_4px_0px_#b98c52]">
              <UserPlus size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#1c1712] uppercase tracking-tight">Dar de Alta Gerente</h2>
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Asignación de administrador de sede oficial</p>
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
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Rango del Perfil</label>
                  <div className="h-11 px-4 bg-[#fffaf3] rounded-none border-2 border-[#1c1712] text-[#1c1712] text-xs font-black flex items-center gap-3 uppercase tracking-widest">
                    <ShieldCheck size={18} className="text-[#b98c52]" /> Gerente de Sede
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
                  className="w-full h-11 pl-12 pr-4 bg-white border-2 border-[#1c1712] rounded-none text-sm font-bold text-[#1c1712] outline-none focus:shadow-[4px_4px_0px_#b98c52] transition-all appearance-none cursor-pointer uppercase tracking-widest"
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

      {/* Tabla de Gerentes Existentes */}
      <div className="mt-16">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-[#fffaf3] text-[#1c1712] rounded-none flex items-center justify-center border-2 border-[#1c1712] shadow-[3px_3px_0px_#b98c52]">
            <UserCheck size={20} />
          </div>
          <h2 className="text-2xl font-black text-[#1c1712] uppercase tracking-tight">Gerentes Asignados</h2>
        </div>

        {managersLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : managers.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-brown font-medium">No hay gerentes registrados aún</p>
          </Card>
        ) : (
          <Card className="overflow-hidden border-primary-100 shadow-premium">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-primary-50 border-b border-primary-100">
                    <th className="px-6 py-6 text-left text-[10px] font-black uppercase text-ink/80 tracking-widest">Nombre</th>
                    <th className="px-6 py-6 text-left text-[10px] font-black uppercase text-ink/80 tracking-widest">Credenciales</th>
                    <th className="px-6 py-6 text-left text-[10px] font-black uppercase text-ink/80 tracking-widest">Sede Asignada</th>
                    <th className="px-6 py-6 text-center text-[10px] font-black uppercase text-ink/80 tracking-widest">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-100">
                  {managers.map((manager) => (
                    <motion.tr key={manager.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-primary-50/50 transition-colors group">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 font-black border border-primary-200">
                            {manager.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-ink">{manager.name} {manager.surname}</p>
                            <p className="text-[10px] text-muted-brown font-black uppercase tracking-widest">ID: {manager.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <p className="text-xs font-bold text-ink">{manager.email}</p>
                        <p className="text-[10px] text-muted-brown font-black uppercase tracking-widest">{manager.phone}</p>
                      </td>
                      <td className="px-6 py-6">
                        {editingId === manager.id ? (
                          <select
                            value={editingRestaurant || manager.restaurant_id}
                            onChange={(e) => setEditingRestaurant(e.target.value)}
                          className="w-full px-3 py-2 text-[10px] font-black uppercase tracking-widest border border-primary-200 rounded-lg bg-white text-ink outline-none focus:border-primary-500 transition-all"
                          >
                            <option value="">Seleccionar...</option>
                            {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                          </select>
                        ) : (
                          <Badge variant="primary" className="px-3 py-1">{manager.restaurantName}</Badge>
                        )}
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center justify-center gap-2">
                          {editingId === manager.id ? (
                            <>
                              <button
                                onClick={() => handleUpdateManagerRestaurant(manager.id, editingRestaurant || manager.restaurant_id)}
                                className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all border border-emerald-100"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => { setEditingId(null); setEditingRestaurant(null); }}
                                className="p-2 bg-ink/5 text-ink rounded-xl hover:bg-ink hover:text-white transition-all border border-ink/10"
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => { setEditingId(manager.id); setEditingRestaurant(manager.restaurant_id); }}
                                className="p-2 bg-primary-100 text-primary-600 rounded-xl hover:bg-primary-500 hover:text-white transition-all border border-primary-200 shadow-sm"
                                title="Cambiar sede"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteManager(manager.id, manager.name)}
                                className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-100 shadow-sm"
                                title="Eliminar usuario"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
