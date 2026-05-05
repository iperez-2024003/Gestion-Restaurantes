# BuenProvecho UI System - Guía de Uso

## Introducción

Los componentes y constantes de UI unificados garantizan consistencia visual en toda la aplicación. Sigue esta guía para usar correctamente cada componente.

---

## 1. Constantes UI (`uiConstants.js`)

Importa las constantes para acceder a colores, espaciado, tipografía, y sombras estandarizados.

```jsx
import { colors, spacing, typography, shadows, borderRadius, buttonStyles } from '@/shared/constants/uiConstants';

// Uso de colores
const bgColor = colors.amber[500]; // #f59e0b
const textColor = colors.gray[900]; // #111827

// Uso de spacing
const padding = spacing.lg; // 1.5rem (24px)
const gap = spacing.md; // 1rem (16px)

// Uso de tipografía
const headingStyle = typography.h3; // { fontSize, fontWeight, lineHeight, letterSpacing }

// Uso de sombras
const boxShadow = shadows.lg;

// Uso de border-radius
const borderRad = borderRadius.lg; // 1rem (16px)
```

---

## 2. LoadingSpinner

Muestra un indicador de carga consistente.

```jsx
import LoadingSpinner from '@/shared/components/states/LoadingSpinner';

// Spinner simple en componente
<LoadingSpinner size="md" text="Cargando..." />

// Fullpage spinner con overlay
<LoadingSpinner fullPage size="lg" text="Procesando..." />

// Variantes: 'default' o 'light'
<LoadingSpinner variant="light" text="Por favor espera..." />
```

**Props:**
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `text`: string de carga
- `fullPage`: boolean para overlay de pantalla completa
- `variant`: 'default' | 'light'

---

## 3. EmptyState

Muestra estado cuando no hay datos disponibles.

```jsx
import EmptyState from '@/shared/components/states/EmptyState';
import { InboxIcon } from 'lucide-react';

<EmptyState
  icon={InboxIcon}
  title="Sin pedidos"
  description="No hay pedidos pendientes en este momento"
  action={{
    label: 'Crear Pedido',
    onClick: () => handleCreateOrder()
  }}
  variant="neutral" // 'neutral' | 'info' | 'warning' | 'error'
/>
```

**Props:**
- `icon`: Componente de Lucide React
- `title`: Título del estado vacío
- `description`: Descripción corta
- `action`: { label, onClick } (opcional)
- `variant`: 'neutral' | 'info' | 'warning' | 'error'

---

## 4. ErrorState

Muestra un estado de error con opción de reintento.

```jsx
import ErrorState from '@/shared/components/states/ErrorState';

<ErrorState
  title="Error al cargar"
  message="No pudimos cargar los datos. Intenta de nuevo."
  actionLabel="Reintentar"
  onAction={() => handleRetry()}
  variant="error" // 'error' | 'warning'
/>

// Fullpage error
<ErrorState
  fullPage
  title="Error 500"
  message="Algo salió mal en el servidor"
  onAction={() => window.location.reload()}
/>
```

**Props:**
- `title`: Título del error
- `message`: Mensaje descriptivo
- `actionLabel`: Texto del botón (default: 'Reintentar')
- `onAction`: Callback del botón
- `variant`: 'error' | 'warning'
- `fullPage`: boolean para overlay de pantalla completa
- `showIcon`: boolean para mostrar icono

---

## 5. Toast Notifications

Sistema de notificaciones tipo toast.

```jsx
import { ToastContainer } from '@/shared/components/states/Toast';
import { useToastStore, useToast } from '@/shared/hooks/useToastStore';

// En el componente raíz (App.jsx)
function App() {
  const { toasts, removeToast } = useToastStore();
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </>
  );
}

// En cualquier componente
function MyComponent() {
  const toast = useToast();
  
  const handleAction = async () => {
    try {
      await someAsyncTask();
      toast.success('¡Éxito! Operación completada');
    } catch (error) {
      toast.error('Algo salió mal');
    }
  };

  return (
    <button onClick={handleAction}>
      Hacer algo
    </button>
  );
}

// Tipos de toast
toast.success('Mensaje de éxito');
toast.error('Mensaje de error');
toast.warning('Mensaje de advertencia');
toast.info('Mensaje informativo');

// Con opciones
toast.success('Guardado', {
  duration: 3000,
  action: {
    label: 'Deshacer',
    onClick: () => handleUndo()
  }
});
```

---

## 6. UnifiedButton

Botón consistente con múltiples variantes.

```jsx
import UnifiedButton from '@/shared/components/ui/UnifiedButton';
import { Save, Trash2 } from 'lucide-react';

// Variantes de color
<UnifiedButton variant="primary" size="md" onClick={handleSave}>
  Guardar
</UnifiedButton>

<UnifiedButton variant="secondary" size="md">
  Cancelar
</UnifiedButton>

<UnifiedButton variant="outline" size="sm">
  Opción
</UnifiedButton>

<UnifiedButton variant="danger" size="md" icon={Trash2}>
  Eliminar
</UnifiedButton>

<UnifiedButton variant="ghost" size="sm">
  Más opciones
</UnifiedButton>

// Con ícono
<UnifiedButton variant="primary" size="lg" icon={Save}>
  Guardar cambios
</UnifiedButton>

// Estado loading
<UnifiedButton variant="primary" loading disabled>
  Guardando...
</UnifiedButton>

// Disabled
<UnifiedButton disabled>
  No disponible
</UnifiedButton>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
- `size`: 'xs' | 'sm' | 'md' | 'lg'
- `icon`: Componente Lucide React
- `disabled`: boolean
- `loading`: boolean
- `onClick`: callback
- `type`: 'button' | 'submit' | 'reset'

---

## 7. Ejemplo de Componente Completo

```jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/shared/components/states/LoadingSpinner';
import EmptyState from '@/shared/components/states/EmptyState';
import UnifiedButton from '@/shared/components/ui/UnifiedButton';
import { useToast } from '@/shared/hooks/useToastStore';
import { colors, spacing, typography, shadows, borderRadius } from '@/shared/constants/uiConstants';
import { ShoppingCart } from 'lucide-react';

function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleCreateOrder = async () => {
    try {
      setLoading(true);
      // API call
      toast.success('Pedido creado exitosamente');
    } catch (error) {
      toast.error('Error al crear el pedido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Sin pedidos"
        description="No hay pedidos disponibles"
        action={{
          label: 'Crear Pedido',
          onClick: handleCreateOrder
        }}
        variant="info"
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        boxShadow: shadows.md,
        backgroundColor: colors.white
      }}
    >
      <h2 style={typography.h3}>Mis Pedidos</h2>
      
      {/* Contenido aquí */}
      
      <div style={{ marginTop: spacing.lg }}>
        <UnifiedButton 
          variant="primary" 
          size="md"
          onClick={handleCreateOrder}
        >
          Nuevo Pedido
        </UnifiedButton>
      </div>
    </motion.div>
  );
}

export default OrdersList;
```

---

## 8. Tipografía Estándar

Usa los estilos de tipografía del `uiConstants` para consistencia:

```jsx
import { typography } from '@/shared/constants/uiConstants';

// Headings
<h1 style={typography.h1}>Título Principal</h1>
<h2 style={typography.h2}>Subtítulo</h2>
<h3 style={typography.h3}>Encabezado menor</h3>
<h4 style={typography.h4}>Encabezado pequeño</h4>

// Body text
<p style={typography.body}>Texto del cuerpo estándar</p>
<p style={typography.bodySmall}>Texto pequeño</p>
<p style={typography.bodyXSmall}>Texto muy pequeño</p>

// Labels
<label style={typography.label}>ETIQUETA</label>
<span style={typography.caption}>Pie de foto</span>
```

---

## 9. Colores Estándar

Accede a la paleta de colores unificada:

```jsx
import { colors } from '@/shared/constants/uiConstants';

// Paleta principal (Crema/Ámbar)
colors.cream[500]  // #ead4b8 (principal cream)
colors.amber[500]  // #f59e0b (principal amber/accent)

// Escala de grises
colors.gray[50]    // #f9fafb
colors.gray[100]   // #f3f4f6
colors.gray[500]   // #6b7280
colors.gray[900]   // #111827

// Status colors
colors.success     // #10b981
colors.warning     // #f59e0b
colors.error       // #ef4444
colors.info        // #3b82f6
```

---

## 10. Mejores Prácticas

✅ **Hacer:**
- Usar `uiConstants` para todos los valores de estilo
- Importar estados (Loader, Empty, Error) en vez de crear custom loaders
- Usar `useToast` para notificaciones
- Usar `UnifiedButton` para botones consistentes
- Mantener el spacing grid-based (4px, 8px, 12px, 16px, etc.)

❌ **No hacer:**
- Hardcodear colores o valores de espaciado
- Crear componentes de botón custom
- Usar toasts o spinners inconsistentes
- Mezclar tipografía inline con estilos CSS
- Usar sombras o border-radius arbitrarios

---

## 11. Transiciones y Animaciones

Los componentes usan `transitions` estándar:

```jsx
import { transitions } from '@/shared/constants/uiConstants';

// Transiciones: fast (0.15s), base (0.3s), slow (0.5s), slower (0.75s)
style={{ transition: transitions.base }}
```

---

## Contacto

Para preguntas o sugerencias sobre el sistema UI, consulta la documentación o abre un issue en el repositorio.
