# Plan de Migración a Microservicios - Gestion-Restaurantes

## 📋 Análisis Comparativo

### Estructura Actual (Monolito)
```
Gestion-Restaurantes/
├── index.js (Entry point único)
├── configs/
│   ├── app.js
│   ├── config.js
│   ├── cors-configuration.js
│   ├── db.js
│   └── helmet-configuration.js
├── helpers/
│   ├── admin-seed.js
│   ├── auth-operations.js
│   ├── cloudinary-service.js
│   ├── email-service.js
│   ├── file-upload.js
│   ├── file-validator.js
│   ├── generate-jwt.js
│   ├── profile-operations.js
│   ├── role-constants.js
│   ├── role-db.js
│   ├── role-seed.js
│   ├── user-db.js
│   └── uuid-generator.js
├── middlewares/ (Compartidos)
│   ├── request-limit.js
│   ├── require-role.js
│   ├── server-genericError-handler.js
│   ├── validate-JWT.js
│   ├── validate-params.js
│   └── validation.js
├── src/ (Backend monolítico)
│   ├── auth/
│   │   ├── auth.controller.js
│   │   ├── auth.routes.js
│   │   └── role.model.js
│   ├── event/
│   ├── menu/
│   ├── order/
│   ├── report/
│   ├── reservation/
│   ├── restaurant/
│   ├── review/
│   ├── socket/
│   ├── statistics/
│   ├── table/
│   └── users/
├── utils/
├── frontend/
└── uploads/
```

### Estructura Target (Microservicios - Basada en Referencia)
```
Gestion-Restaurantes/
├── AuthService/
│   ├── index.js
│   ├── package.json
│   ├── .env
│   ├── configs/
│   │   ├── app.js
│   │   ├── config.js
│   │   ├── db.js
│   │   └── cors-configuration.js
│   ├── helpers/
│   ├── middlewares/
│   ├── src/
│   │   ├── auth/
│   │   │   └── auth routes & controllers
│   │   └── users/
│   │       └── user routes & controllers
│   └── uploads/
│
├── RestaurantesService/
│   ├── index.js
│   ├── package.json
│   ├── .env
│   ├── configs/
│   ├── helpers/
│   ├── middlewares/
│   ├── src/
│   │   ├── models/
│   │   │   ├── restaurantes/
│   │   │   ├── menus/
│   │   │   ├── platos/
│   │   │   ├── mesas/
│   │   │   ├── inventario/
│   │   │   └── reseñas/
│   │   └── helpers/
│   └── uploads/
│
├── PedidosReservacionesService/
│   ├── index.js
│   ├── package.json
│   ├── .env
│   ├── configs/
│   ├── helpers/
│   ├── middlewares/
│   ├── src/
│   │   ├── models/
│   │   │   ├── pedidos/
│   │   │   ├── detallePedidos/
│   │   │   ├── reservaciones/
│   │   │   ├── facturas/
│   │   │   ├── platos/ (ref)
│   │   │   ├── mesas/ (ref)
│   │   │   └── restaurantes/ (ref)
│   │   └── helpers/
│   └── uploads/
│
├── EventosReportesService/
│   ├── index.js
│   ├── package.json
│   ├── .env
│   ├── configs/
│   ├── helpers/
│   ├── middlewares/
│   ├── src/
│   │   ├── models/ (reportes + eventos)
│   │   └── helpers/
│   └── uploads/
│
├── frontend/
│   ├── (Sin cambios - React app intacta)
│   └── src/ (UI System intacto)
│
├── docs/
│   └── (Documentación de servicios)
│
├── scripts/
│   └── (Scripts de utilidad compartidos)
│
├── Endpoints/
│   └── (Documentación de APIs)
│
└── README.md
```

## 🗺️ Mapeo Funcional

### AuthService ✅
**Origen:** `src/auth/` + `src/users/` + `helpers/auth-operations.js`, `helpers/generate-jwt.js`
**Destino:** `AuthService/src/auth/` + `AuthService/src/users/`
**Funcionalidad:** Autenticación, JWT, usuarios, roles
**Base de datos:** PostgreSQL (usuarios) + MongoDB (roles)

### RestaurantesService ✅
**Origen:** `src/restaurant/` + `helpers/cloudinary-service.js`
**Destino:** `RestaurantesService/src/models/restaurantes/`
**Funcionalidad:** Restaurantes, menús, platos, mesas, inventario, reseñas
**Base de datos:** MongoDB

### PedidosReservacionesService ✅
**Origen:** `src/order/` + `src/reservation/` + helpers específicos
**Destino:** `PedidosReservacionesService/src/models/`
**Funcionalidad:** Pedidos, reservaciones, facturas, detalles de pedidos
**Base de datos:** MongoDB

### EventosReportesService ✅
**Origen:** `src/event/` + `src/report/` + `src/statistics/`
**Destino:** `EventosReportesService/src/models/`
**Funcionalidad:** Eventos, reportes, estadísticas
**Base de datos:** MongoDB

### shared/ui & frontend ✅
**Sin cambios** - Sistema UI y app React preservados intactos
**Ubicación:** `frontend/` mantiene estructura actual

## 🔧 Distribución de Helpers

| Helper | Destino | Servicios Afectados |
|--------|---------|-------------------|
| `auth-operations.js` | AuthService | AuthService |
| `generate-jwt.js` | AuthService | AuthService |
| `cloudinary-service.js` | RestaurantesService | RestaurantesService |
| `email-service.js` | Compartido/EventosReportesService | PedidosReservacionesService, EventosReportesService |
| `file-upload.js` | Compartido (shared) | Todos |
| `file-validator.js` | Compartido (shared) | Todos |
| `profile-operations.js` | AuthService | AuthService |
| `role-constants.js` | Compartido (shared) | Todos |
| `role-db.js` | AuthService | AuthService |
| `user-db.js` | AuthService | AuthService |
| `uuid-generator.js` | Compartido (shared) | Todos |
| `admin-seed.js` | Scripts | Todos |

## 📦 Estructura de Middlewares

**Compartidos (reutilizables):**
- `require-role.js` ➜ Cada servicio lo usa pero puede estar centralizado
- `validate-JWT.js` ➜ Usado por todos (puede estar en shared o ser replicado)
- `server-genericError-handler.js` ➜ Cada servicio tiene el suyo
- `request-limit.js` ➜ Cada servicio lo implementa
- `validate-params.js` ➜ Cada servicio lo implementa
- `validation.js` ➜ Cada servicio lo implementa

## 🚀 Fases de Migración

### Fase 1: Preparación (Git & Estructura)
- ✓ Crear rama `develop` (si no existe)
- ✓ Crear estructura de directorios de servicios
- ✓ Copiar configs base en cada servicio

### Fase 2: AuthService
- ✓ Crear `AuthService/` con estructura completa
- ✓ Migrar `src/auth/` → `AuthService/src/auth/`
- ✓ Migrar `src/users/` → `AuthService/src/users/`
- ✓ Migrar helpers de auth
- ✓ Crear `AuthService/package.json` con dependencias correctas
- ✓ Verificar conexión a BD

### Fase 3: RestaurantesService
- ✓ Crear `RestaurantesService/` con estructura
- ✓ Migrar `src/restaurant/` → `RestaurantesService/src/models/restaurantes/`
- ✓ Migrar `src/menu/` → `RestaurantesService/src/models/menus/`
- ✓ Migrar `src/table/` → `RestaurantesService/src/models/mesas/`
- ✓ Migrar helpers relacionados
- ✓ Crear `RestaurantesService/package.json`

### Fase 4: PedidosReservacionesService
- ✓ Crear `PedidosReservacionesService/`
- ✓ Migrar `src/order/` → `PedidosReservacionesService/src/models/pedidos/`
- ✓ Migrar `src/reservation/` → `PedidosReservacionesService/src/models/reservaciones/`
- ✓ Crear `PedidosReservacionesService/package.json`

### Fase 5: EventosReportesService
- ✓ Crear `EventosReportesService/`
- ✓ Migrar `src/event/` → `EventosReportesService/src/models/eventos/`
- ✓ Migrar `src/report/` → `EventosReportesService/src/models/reportes/`
- ✓ Migrar `src/statistics/` → `EventosReportesService/src/models/`
- ✓ Crear `EventosReportesService/package.json`

### Fase 6: Cleanup & Validación
- ✓ Eliminar `src/` original (ya distribuido)
- ✓ Crear carpeta `shared/` para código compartido
- ✓ Actualizar documentación
- ✓ Validar que todos los servicios funcionen

## 🔗 Comunicación Entre Servicios

**Importante:** La comunicación entre servicios se mantendrá a través de:
- APIs HTTP (REST)
- Socket.io (tiempo real)
- Variables de entorno para URLs de servicios

**Configuración necesaria:**
```
.env de cada servicio tendrá:
- AUTH_SERVICE_URL
- RESTAURANTES_SERVICE_URL
- PEDIDOS_RESERVACIONES_SERVICE_URL
- EVENTOS_REPORTES_SERVICE_URL
```

## ⚠️ Consideraciones Críticas

1. **Base de Datos Compartida**: Actualmente algunos servicios comparten la misma BD (MongoDB, PostgreSQL)
   - Se mantendrá así por ahora para evitar duplicación
   - Cada servicio tiene acceso a sus colecciones/tablas

2. **Socket.io**: Sistema de real-time será mantenido
   - Puede estar centralizado en un servicio o replicado
   - Frontend se conectará al servidor principal

3. **Autenticación**: AuthService es crítico
   - Todos los servicios validarán tokens vía AuthService
   - JWT seguirá siendo usado

4. **Frontend**: No requiere cambios
   - Continuará apuntando a mismo servidor principal o load balancer
   - Sistema UI intacto

## 📊 Resumen de Cambios

| Aspecto | Antes | Después |
|--------|-------|---------|
| Monolito | ❌ | Microservicios |
| Servicios | 1 | 4 |
| Escalabilidad | Limitada | Independiente por servicio |
| Despliegue | Monolítico | Independiente |
| BD | Compartida | Compartida (por ahora) |
| Frontend | Sin cambios | Sin cambios ✅ |

---

## ✅ Garantías de Seguridad

- ✅ **Sin romper funcionalidad**: Todos los endpoints continuarán funcionando
- ✅ **Preservar BD**: Las bases de datos no se modifican
- ✅ **Sistema UI intacto**: `frontend/src/shared/` preservado completamente
- ✅ **Autenticación vigente**: JWT y roles funcionan igual
- ✅ **Socket.io funcional**: Comunicación real-time continúa

---

**Próximo paso:** Ejecutar paso a paso siguiendo las fases de migración.
