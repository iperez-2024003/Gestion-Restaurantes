import { useState, useEffect } from 'react';
import api from '../../../shared/api/axios';
import { useRestaurantStore } from '../../restaurants/store/useRestaurantStore';
import { UserPlus, ShieldCheck, Mail, Phone, Lock, Building2, User, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import FormInput, { FormSelect } from '../../../shared/components/forms/FormInput';
import UnifiedButton from '../../../shared/components/ui/UnifiedButton';
import Card from '../../../shared/components/ui/Card';
import { useToast } from '../../../shared/hooks/useToastStore';
import { spacing, typography } from '../../../shared/constants/uiConstants';

export const AdminUserManagement = () => {
  const [loading, setLoading] = useState(false);
  const { restaurants, getRestaurants } = useRestaurantStore();
  const toast = useToast();
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
    <div className="space-y-8 animate-in fade-in duration-700 px-4 md:px-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 style={typography.h2} className="text-zinc-900 uppercase mb-2">
          Gestión de <span className="text-[#b98c52]">Usuarios</span>
        </h1>
        <p style={typography.bodySmall} className="text-zinc-600">
          Administración global de accesos y jerarquías
        </p>
      </motion.div>

      <Card title="Crear Nuevo Gerente" subtitle="Asignación de administrador de sede" variant="elevated">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Nombre"
              name="name"
              value={formData.name}
              onChange={handleChange}
              icon={User}
              required
              placeholder="Ej: Juan"
            />
            <FormInput
              label="Apellido"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              required
              placeholder="Ej: García"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Nombre de Usuario"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="admin_sede"
              helpText="Identificador único para login"
            />
            <FormInput
              label="Teléfono"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              icon={Phone}
              pattern="\d{8}"
              required
              placeholder="12345678"
            />
          </div>

          <FormInput
            label="Email Institucional"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            icon={Mail}
            required
            placeholder="gerente@buenprovecho.com"
            helpText="Correo para notificaciones y recuperación"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Contraseña Provisoria"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
              required
              placeholder="••••••••"
              minLength={8}
              helpText="Mínimo 8 caracteres"
            />
            <FormSelect
              label="Rango del Perfil"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled
              options={[
                { value: 'RESTAURANT_ADMIN_ROLE', label: 'Gerente de Sede' }
              ]}
            />
          </div>

          <FormSelect
            label="Sede Asignada"
            name="restaurant_id"
            value={formData.restaurant_id}
            onChange={handleChange}
            required
            placeholder={restaurants.length === 0 ? '⚠️ No hay sedes activas' : 'Selecciona un restaurante...'}
            options={restaurants.map(r => ({ value: r.id, label: r.name }))}
            error={restaurants.length === 0 ? 'No hay sedes activas en el sistema' : ''}
          />

          <div style={{ marginTop: spacing.lg }} className="flex justify-end">
            <UnifiedButton
              variant="primary"
              size="lg"
              icon={Rocket}
              type="submit"
              disabled={loading || restaurants.length === 0}
              loading={loading}
            >
              {loading ? 'Procesando Registro...' : 'Dar de Alta Gerente'}
            </UnifiedButton>
          </div>
        </form>
      </Card>
    </div>
  );
};
