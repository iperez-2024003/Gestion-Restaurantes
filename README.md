# 🍽️ RestauManager — Plataforma Integral de Gestión Gastronómica

**RestauManager** es un ecosistema Full-Stack diseñado para transformar la operación de restaurantes. Conecta a dueños, gerentes, personal y comensales en tiempo real a través de una interfaz premium y una API robusta.

---

## 🏗️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Runtime** | Node.js v24 + ES Modules |
| **Framework Backend** | Express.js |
| **ORM** | Sequelize 6 |
| **Base de Datos** | PostgreSQL |
| **Autenticación** | JWT + Argon2 (hashing) |
| **Tiempo Real** | Socket.io |
| **Storage** | Cloudinary |
| **Email** | Nodemailer (Gmail SMTP) |
| **Frontend** | React 18 + Vite 8 |
| **Estado Global** | Zustand |
| **Estilos** | Tailwind CSS |
| **Animaciones** | Framer Motion + Three.js |

---

## 🚀 Instalación y Arranque

### Prerrequisitos
- Node.js 20+
- pnpm
- PostgreSQL corriendo localmente

### Backend
```bash
# En la raíz del proyecto
pnpm install
pnpm run dev         # Puerto 3005
```

### Frontend
```bash
cd frontend
pnpm install
pnpm run dev         # Puerto 5173
```

### Variables de entorno
Copia `.env` y configura las siguientes variables clave:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` — Conexión PostgreSQL
- `JWT_SECRET`, `JWT_EXPIRES_IN` — Configuración de tokens
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Storage de imágenes
- `EMAIL_USER`, `EMAIL_PASS` — Cuenta Gmail para envío de correos

---

## 🔑 Credenciales por Defecto

Estas cuentas se crean/sincronizan **automáticamente** al iniciar el servidor:

| Rol | Usuario / Email | Contraseña |
|---|---|---|
| Super Admin | `admin` / `admin@restaurantes.com` | `Admin123!` |
| Gerente | `gerente` / `gerente@kinal.com` | `Admin123!` |
| Staff | `staff` / `staff@kinal.com` | `Admin123!` |

> **Nota:** El cliente debe registrarse manualmente desde la app y verificar su correo de Gmail.

---

## 🛡️ Roles y Permisos

| Rol | Acceso |
|---|---|
| `SUPER_ADMIN_ROLE` | Gestión global: todos los restaurantes, usuarios y estadísticas |
| `RESTAURANT_ADMIN_ROLE` | Su restaurante: menú, staff, órdenes, reportes, eventos |
| `STAFF_ROLE` | Monitor de cocina, órdenes, mesas, reservaciones, menú (lectura) |
| `CLIENT_ROLE` | Menú público QR, historial de órdenes, reservaciones, eventos |

---

## 📡 API — Endpoints Principales

Base URL: `http://localhost:3005/api/v1`

### Autenticación (`/auth`)
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/login` | Login con email o username |
| POST | `/register` | Registro de nuevo cliente |
| GET | `/profile` | Perfil del usuario autenticado |
| POST | `/forgot-password` | Solicitud de reset por correo |
| POST | `/reset-password` | Reset con token recibido por email |
| GET | `/verify-email?token=...` | Verificación de correo |

### Restaurantes (`/restaurants`)
| Método | Ruta | Acceso |
|---|---|---|
| GET | `/` | Público |
| GET | `/:id` | Público |
| POST | `/` | Super Admin |
| PUT | `/:id` | Super Admin |
| PATCH | `/:id/verify` | Super Admin |
| DELETE | `/:id` | Super Admin |
| GET | `/:id/stats` | Admin / Gerente / Staff |
| GET | `/:id/staff` | Admin / Gerente |
| POST | `/:id/staff` | Admin / Gerente |

### Estadísticas (`/statistics`)
| Ruta | Acceso |
|---|---|
| `/restaurant/:id/overview` | Admin / Gerente |
| `/restaurant/:id/orders?period=month` | Admin / Gerente |
| `/restaurant/:id/popular-dishes?limit=5` | Admin / Gerente |
| `/restaurant/:id/peak-hours` | Admin / Gerente |
| `/restaurant/:id/export-excel` | Admin / Gerente |
| `/global/overview` | Super Admin |
| `/global/vip-clients` | Super Admin |

### Otros módulos
- `/menus` — Gestión de menús y categorías
- `/menus/items` — Platos e inventario
- `/orders` — Órdenes (CRUD + estados)
- `/orders/kitchen/:restaurantId` — Vista de cocina (KDS)
- `/tables` — Mesas y QRs
- `/reservations` — Reservaciones
- `/events` — Eventos del restaurante
- `/reviews` — Reseñas de clientes



## 🌊 Flujo de Trabajo Completo

### 1. Super Admin
1. Login → Crear Restaurante → Asignar Gerente → **Verificar** el restaurante (activa `is_active`)
2. Ver estadísticas globales y ranking de clientes VIP

### 2. Gerente (Restaurant Admin)
1. Configurar Menú → Crear Categorías → Agregar Platos con stock
2. Crear Mesas → Descargar QRs para impresión
3. Agregar Staff al restaurante
4. Ver Analíticas y exportar reportes en Excel

### 3. Staff / Mesero
1. Monitor de Cocina (KDS) — órdenes entrantes en tiempo real vía WebSocket
2. Gestionar estado de mesas y reservaciones del día
3. Consultar el menú actualizado

### 4. Cliente
1. Registrarse → Verificar correo → Login
2. Escanear QR de la mesa → Explorar menú → Realizar pedido
3. Acumular puntos de lealtad por cada compra
4. Consultar historial de pedidos y reservaciones

---

## 📦 Estructura del Proyecto

```
Gestion-Restaurantes/
├── src/                    # Módulos del backend
│   ├── auth/               # Login, JWT, roles
│   ├── restaurant/         # CRUD, stats, staff
│   ├── menu/               # Categorías, ítems, inventario
│   ├── order/              # Pedidos, estados, ítems
│   ├── reservation/        # Reservaciones
│   ├── event/              # Eventos del restaurante
│   ├── review/             # Reseñas de clientes
│   ├── statistics/         # Analíticas y reportes Excel
│   ├── table/              # Mesas y QRs
│   └── users/              # Perfiles de usuario
├── helpers/                # Servicios (email, cloudinary, JWT)
│   └── admin-seed.js       # Auto-provisioning de cuentas base
├── middlewares/            # Auth, validación, roles
├── configs/                # DB, app, dotenv
├── utils/                  # Password, helpers
└── frontend/               # React + Vite
    └── src/features/       # auth, restaurants, orders, events...
```

---

## 🔧 Notas Técnicas Importantes

> [!NOTE]
> **Seeder automático:** Al iniciar el servidor, `helpers/admin-seed.js` sincroniza automáticamente las contraseñas de `admin`, `gerente` y `staff` a `Admin123!`. Esto garantiza acceso siempre en desarrollo, incluso si la base de datos fue modificada.

> [!TIP]
> **Sincronización DB:** El proyecto usa `sequelize.sync({ force: false })`. Los datos **nunca se borran** al reiniciar el servidor. Solo se actualiza el esquema si hay columnas nuevas.

---

## 🗺️ Roadmap

- [x] Autenticación multi-rol con JWT + Argon2
- [x] CRUD de restaurantes con verificación por Super Admin
- [x] Menú digital con control de stock
- [x] Órdenes con flujo Kanban en tiempo real (Socket.io)
- [x] Monitor de Cocina / KDS en tiempo real
- [x] Gestión de mesas y generación de QRs
- [x] Sistema de reservaciones
- [x] Eventos por restaurante
- [x] Reseñas de clientes
- [x] Analíticas por restaurante y globales
- [x] Exportación de reportes a Excel
- [x] Upload de imágenes a Cloudinary
- [ ] Pasarela de pagos (Stripe / PayPal)
- [ ] Notificaciones push al cliente
- [ ] App móvil (React Native)

---

**RestauManager** — *Llevando la ingeniería de software a la mesa.*
