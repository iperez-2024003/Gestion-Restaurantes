# 🍽️ BuenProvecho — Plataforma Integral de Gestión Gastronómica

**BuenProvecho** es un ecosistema Full-Stack diseñado para transformar la operación de restaurantes. Conecta a dueños, gerentes, personal y comensales en tiempo real a través de una interfaz premium y una API robusta.

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

El sistema trabaja con 4 roles conectados entre backend y frontend. La separación real de responsabilidades se apoya en `validateJWT` y en los middlewares de `helpers/require-role.js`.

| Rol | Qué hace | Cómo entra en la app |
|---|---|---|
| `SUPER_ADMIN_ROLE` | Administra toda la plataforma: restaurantes, usuarios, verificación, estadísticas globales | Entra al panel global del dashboard |
| `RESTAURANT_ADMIN_ROLE` | Administra una sede específica: menú, mesas, staff, órdenes, eventos y reportes | El frontend lo lleva directo a su `restaurantId` |
| `STAFF_ROLE` | Opera la sede asignada: cocina, órdenes y mesas | El frontend también lo dirige a su `restaurantId` |
| `CLIENT_ROLE` | Consume la experiencia: menú público, pedidos, historial, reseñas y eventos | Entra al dashboard de cliente o al menú público |

### Flujo de conexión

1. El usuario inicia sesión por `/auth/login`.
2. El backend valida credenciales y devuelve el perfil con el rol principal.
3. El frontend guarda el rol y, cuando aplica, el `restaurantId`.
4. El router del frontend redirige según el rol:
	- `CLIENT_ROLE` va al dashboard cliente.
	- `RESTAURANT_ADMIN_ROLE` y `STAFF_ROLE` van directo al restaurante asociado.
	- `SUPER_ADMIN_ROLE` entra al panel global.
5. El backend bloquea rutas sensibles con `requireRole`, evitando acceso fuera de permiso.

### Qué puede hacer cada rol

#### 1. `SUPER_ADMIN_ROLE`

Es el administrador global de la plataforma.

Puede:
- Crear y verificar restaurantes.
- Eliminar restaurantes.
- Ver estadísticas globales.
- Gestionar usuarios por rol.
- Asignar o cambiar roles administrativos.

En el backend tiene acceso a rutas como:
- `/restaurants/admin/:adminId`
- `/restaurants/:id/verify`
- `/users/by-role/:roleName`
- `/users/:userId/role`
- `/statistics/platform/summary`
- `/statistics/global/overview`

#### 2. `RESTAURANT_ADMIN_ROLE`

Es el gerente de una sede específica.

Puede:
- Administrar su restaurante.
- Gestionar menú, mesas, staff, órdenes, eventos y reportes.
- Ver estadísticas operativas de su sede.
- Crear staff dentro de su restaurante.

En el frontend ve el menú del restaurante asociado y el sistema lo lleva a ese `restaurantId`.

#### 3. `STAFF_ROLE`

Es el personal operativo del restaurante.

Puede:
- Ver el resumen de la sede.
- Gestionar órdenes y cocina.
- Consultar el estado de mesas.
- Trabajar solo dentro del restaurante asignado.

No administra la plataforma completa ni modifica datos globales.

#### 4. `CLIENT_ROLE`

Es el cliente final.

Puede:
- Explorar menús públicos.
- Hacer pedidos.
- Ver su historial.
- Dejar reseñas.
- Consultar eventos.

No administra restaurantes ni personal.

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
1. Inicia sesión.
2. Crea o verifica restaurantes.
3. Asigna gerentes.
4. Revisa estadísticas globales y usuarios.

### 2. Gerente de Sede
1. Entra a su restaurante.
2. Configura menú, mesas y eventos.
3. Da de alta staff.
4. Consulta analíticas y reportes.

### 3. Staff / Mesero
1. Entra a la sede asignada.
2. Atiende órdenes y cocina.
3. Gestiona mesas y reservaciones.
4. Opera solo dentro de su restaurante.

### 4. Cliente
1. Entra al menú público o inicia sesión.
2. Explora restaurantes y platillos.
3. Hace pedidos o reservaciones.
4. Revisa historial, reseñas y eventos.

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

**BuenProvecho** — *Llevando la ingeniería de software a la mesa.*
