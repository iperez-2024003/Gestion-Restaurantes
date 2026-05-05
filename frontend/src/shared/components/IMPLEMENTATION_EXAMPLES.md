# Ejemplos de Implementación del UI System

## Ejemplo 1: Component con Loading, Empty y Error States

```jsx
import React, { useState, useEffect } from 'react';
import LoadingSpinner from '@/shared/components/states/LoadingSpinner';
import EmptyState from '@/shared/components/states/EmptyState';
import ErrorState from '@/shared/components/states/ErrorState';
import Card from '@/shared/components/ui/Card';
import UnifiedButton from '@/shared/components/ui/UnifiedButton';
import { useToast } from '@/shared/hooks/useToastStore';
import { ShoppingCart, Plus } from 'lucide-react';

function RestaurantOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
      toast.error('Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return <LoadingSpinner text="Cargando pedidos..." />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title="Error al cargar"
        message={error}
        onAction={fetchOrders}
      />
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Sin pedidos"
        description="No hay pedidos pendientes en este momento"
        action={{
          label: 'Crear pedido',
          onClick: () => toast.info('Redireccionar a crear pedido')
        }}
        variant="info"
      />
    );
  }

  // Content
  return (
    <div>
      {orders.map((order) => (
        <Card key={order.id} title={`Pedido #${order.id}`}>
          <p>Estado: {order.status}</p>
          <p>Total: ${order.total}</p>
        </Card>
      ))}
    </div>
  );
}

export default RestaurantOrders;
```

## Ejemplo 2: Modal con Formulario

```jsx
import React, { useState } from 'react';
import Modal from '@/shared/components/ui/Modal';
import FormInput, { FormSelect, FormTextarea } from '@/shared/components/forms/FormInput';
import UnifiedButton from '@/shared/components/ui/UnifiedButton';
import { useToast } from '@/shared/hooks/useToastStore';
import { Mail } from 'lucide-react';

function CreateMenuItemModal({ isOpen, onClose, restaurantId }) {
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`/api/restaurants/${restaurantId}/menu-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Error al crear');
      
      toast.success('Elemento de menú creado exitosamente');
      onClose();
    } catch (error) {
      toast.error(error.message);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Elemento de Menú"
      size="lg"
      footer={
        <>
          <UnifiedButton variant="secondary" onClick={onClose}>
            Cancelar
          </UnifiedButton>
          <UnifiedButton 
            variant="primary" 
            onClick={handleSubmit}
            loading={loading}
            disabled={loading}
          >
            Crear
          </UnifiedButton>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <FormInput
          label="Nombre del plato"
          placeholder="Ej: Carne Asada"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          error={errors.name}
        />

        <FormSelect
          label="Categoría"
          name="category"
          value={formData.category}
          onChange={handleChange}
          options={[
            { value: 'entrada', label: 'Entrada' },
            { value: 'plato-fuerte', label: 'Plato Fuerte' },
            { value: 'postre', label: 'Postre' },
            { value: 'bebida', label: 'Bebida' },
          ]}
          required
          error={errors.category}
        />

        <FormInput
          label="Precio"
          type="number"
          placeholder="0.00"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
          error={errors.price}
        />

        <FormTextarea
          label="Descripción"
          placeholder="Describe el plato..."
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          error={errors.description}
        />

        {errors.submit && (
          <p style={{ color: '#ef4444', marginBottom: '1rem' }}>
            {errors.submit}
          </p>
        )}
      </form>
    </Modal>
  );
}

export default CreateMenuItemModal;
```

## Ejemplo 3: Card con Acciones

```jsx
import React from 'react';
import Card from '@/shared/components/ui/Card';
import UnifiedButton from '@/shared/components/ui/UnifiedButton';
import { Trash2, Edit2 } from 'lucide-react';
import { spacing } from '@/shared/constants/uiConstants';

function RestaurantCard({ restaurant, onEdit, onDelete }) {
  return (
    <Card
      variant="elevated"
      hoverable
      title={restaurant.name}
      subtitle={`Dirección: ${restaurant.address}`}
      footer={
        <div style={{ display: 'flex', gap: spacing.md }}>
          <UnifiedButton 
            variant="secondary" 
            size="sm"
            icon={Edit2}
            onClick={() => onEdit(restaurant)}
          >
            Editar
          </UnifiedButton>
          <UnifiedButton 
            variant="danger" 
            size="sm"
            icon={Trash2}
            onClick={() => onDelete(restaurant.id)}
          >
            Eliminar
          </UnifiedButton>
        </div>
      }
    >
      <div style={{ marginBottom: spacing.md }}>
        <p><strong>Teléfono:</strong> {restaurant.phone}</p>
        <p><strong>Email:</strong> {restaurant.email}</p>
        <p><strong>Horarios:</strong> {restaurant.hours}</p>
      </div>
    </Card>
  );
}

export default RestaurantCard;
```

## Ejemplo 4: Toast Notifications

```jsx
import React from 'react';
import { useToast } from '@/shared/hooks/useToastStore';
import UnifiedButton from '@/shared/components/ui/UnifiedButton';

function NotificationExample() {
  const toast = useToast();

  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <UnifiedButton 
        variant="primary"
        onClick={() => toast.success('¡Operación completada!')}
      >
        Éxito
      </UnifiedButton>

      <UnifiedButton 
        variant="danger"
        onClick={() => toast.error('Ocurrió un error')}
      >
        Error
      </UnifiedButton>

      <UnifiedButton 
        variant="outline"
        onClick={() => toast.warning('Advertencia importante')}
      >
        Advertencia
      </UnifiedButton>

      <UnifiedButton 
        onClick={() => toast.info('Información útil')}
      >
        Información
      </UnifiedButton>

      <UnifiedButton 
        onClick={() => toast.success('Con acción', {
          action: {
            label: 'Deshacer',
            onClick: () => toast.info('Acción deshecha')
          }
        })}
      >
        Con acción
      </UnifiedButton>
    </div>
  );
}

export default NotificationExample;
```

## Ejemplo 5: Página Completa con UI System

```jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/shared/components/states/LoadingSpinner';
import EmptyState from '@/shared/components/states/EmptyState';
import Card from '@/shared/components/ui/Card';
import UnifiedButton from '@/shared/components/ui/UnifiedButton';
import Modal from '@/shared/components/ui/Modal';
import FormInput from '@/shared/components/forms/FormInput';
import { useToast } from '@/shared/hooks/useToastStore';
import { colors, spacing, typography } from '@/shared/constants/uiConstants';
import { Plus, Users } from 'lucide-react';

function StaffManagementPage({ restaurantId }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchStaff();
  }, [restaurantId]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/staff`);
      const data = await response.json();
      setStaff(data);
    } catch (error) {
      toast.error('Error al cargar el personal');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: spacing.lg }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: spacing.xl }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={typography.h2}>Personal del Restaurante</h1>
            <p style={{ ...typography.bodySmall, color: colors.gray[500], marginTop: spacing.sm }}>
              Gestiona el equipo de tu restaurante
            </p>
          </div>
          <UnifiedButton 
            variant="primary"
            size="lg"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          >
            Agregar Personal
          </UnifiedButton>
        </div>
      </motion.div>

      {/* Content */}
      {staff.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin personal"
          description="Comienza agregando miembros a tu equipo"
          action={{
            label: 'Agregar personal',
            onClick: () => setIsModalOpen(true)
          }}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: spacing.lg,
          }}
        >
          {staff.map((member) => (
            <Card 
              key={member.id}
              title={member.name}
              subtitle={member.role}
              variant="elevated"
            >
              <p><strong>Email:</strong> {member.email}</p>
              <p><strong>Estado:</strong> {member.status === 'active' ? '✓ Activo' : 'Inactivo'}</p>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Modal */}
      <AddStaffModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        restaurantId={restaurantId}
        onAdd={fetchStaff}
      />
    </div>
  );
}

function AddStaffModal({ isOpen, onClose, restaurantId, onAdd }) {
  const [formData, setFormData] = useState({ name: '', email: '', role: 'STAFF_ROLE' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Error al agregar');
      
      toast.success('Personal agregado exitosamente');
      onClose();
      onAdd();
      setFormData({ name: '', email: '', role: 'STAFF_ROLE' });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agregar Personal"
      size="md"
      footer={
        <>
          <UnifiedButton variant="secondary" onClick={onClose}>
            Cancelar
          </UnifiedButton>
          <UnifiedButton 
            variant="primary"
            loading={loading}
            onClick={handleSubmit}
          >
            Agregar
          </UnifiedButton>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <FormInput
          label="Nombre"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
        <FormInput
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
        <FormSelect
          label="Rol"
          value={formData.role}
          onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
          options={[
            { value: 'STAFF_ROLE', label: 'Personal' },
            { value: 'KITCHEN_STAFF', label: 'Cocina' },
            { value: 'WAITER', label: 'Mesero' },
          ]}
        />
      </form>
    </Modal>
  );
}

export default StaffManagementPage;
```

---

Estos ejemplos muestran cómo integrar los componentes del UI System de manera coherente. Cada ejemplo demuestra:

1. **Manejo de estados** (loading, error, empty, success)
2. **Uso de componentes unificados** (Cards, Modals, Buttons)
3. **Notificaciones** mediante Toast
4. **Formularios consistentes** con inputs validados
5. **Animaciones suaves** con Framer Motion
6. **Responsividad** automática mediante Tailwind + mobile-first design
