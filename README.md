# 🍽️ RestauManager — Plataforma Integral de Gestión Gastronómica

**RestauManager** es un ecosistema Full-Stack diseñado para transformar la operación de restaurantes. Conecta a dueños, gerentes, personal y comensales en tiempo real a través de una interfaz premium y una API robusta.

---

## 🏗️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Runtime** | Node.js v24 + ES Modules |
| **Framework Backend** | Express.js |
| **ORM** | Sequelize 6 |
| **Bases de Datos** | PostgreSQL (Auth) & MongoDB (Negocio) |
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
- PostgreSQL & MongoDB corriendo localmente

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
Configura tu archivo `.env` con las siguientes claves:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` — PostgreSQL
- `MONGODB_URI` — MongoDB
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `EMAIL_USER`, `EMAIL_PASS`
- `JWT_SECRET`

---

## 🔑 Credenciales por Defecto

Estas cuentas se sincronizan automáticamente al iniciar el servidor:

| Rol | Usuario / Email | Contraseña |
|---|---|---|
| Super Admin | `admin` / `admin@restaurantes.com` | `Admin123!` |
| Gerente | `gerente` / `gerente@manager.com` | `Admin123!` |
| Staff | `staff` / `staff@manager.com` | `Admin123!` |

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

### Autenticación (`/auth`)
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/login` | Login con email o username |
| POST | `/register` | Registro de nuevo cliente |
| GET | `/profile` | Perfil del usuario autenticado |
| POST | `/forgot-password` | Solicitud de reset por correo |

### Restaurantes (`/restaurants`)
| Método | Ruta | Acceso |
|---|---|---|
| GET | `/` | Público |
| POST | `/` | Super Admin |
| DELETE | `/:id` | Super Admin (Borrado en Cascada) |
| GET | `/:id/stats` | Admin / Gerente / Staff |
| GET | `/:id/staff` | Admin / Gerente |
| POST | `/:id/staff` | Admin / Gerente |

### Estadísticas (`/statistics`)
| Ruta | Acceso |
|---|---|
| `/restaurant/:id/overview` | Admin / Gerente |
| `/restaurant/:id/orders` | Admin / Gerente |
| `/restaurant/:id/export-excel` | Admin / Gerente |
| `/global/overview` | Super Admin |

---

## 🌊 Flujo de Trabajo Completo

### 1. Super Admin
1. Login → Crear Restaurante → Asignar Gerente → **Verificar** el restaurante (activa `is_active`)
2. Ver estadísticas globales y ranking de clientes VIP

### 2. Gerente (Restaurant Admin)
1. Configurar Menú → Crear Categorías → Agregar Platos con stock e imágenes (Cloudinary)
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

---

## 📦 Estructura del Proyecto

```
Gestion-Restaurantes/
├── src/                    # Módulos del backend
│   ├── auth/               # Login, JWT, roles
│   ├── restaurant/         # CRUD, stats, staff
│   ├── menu/               # Categorías, ítems, inventario
│   ├── order/              # Pedidos, estados (KDS)
│   ├── statistics/         # Analíticas y reportes Excel
│   └── ...
├── helpers/                # Cloudinary, Email, JWT
├── middlewares/            # Auth, validación, roles
├── configs/                # Conexión DB y App
└── frontend/               # React 18 + Vite
```

---

## 🔧 Notas Técnicas Importantes

> [!IMPORTANT]
> **Borrado en Cascada:** Al eliminar un restaurante, el sistema elimina físicamente todos los registros asociados en MongoDB y destruye los assets (imágenes) en Cloudinary.

> [!TIP]
> **WebSockets:** El monitor de cocina utiliza `Socket.io` sobre un servidor HTTP unificado para garantizar baja latencia en las notificaciones de nuevos pedidos.

---

## 🗺️ Roadmap

- [x] Autenticación multi-rol
- [x] Gestión de imágenes con Cloudinary (Upload/Delete)
- [x] Órdenes en tiempo real (Socket.io)
- [x] Borrado en cascada de restaurantes
- [x] Exportación a Excel
- [ ] Pasarela de pagos (Stripe)
- [ ] Notificaciones push

---

**RestauManager** — *Llevando la ingeniería de software a la mesa.*
