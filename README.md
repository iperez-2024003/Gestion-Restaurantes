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

### 1️⃣ Instalar dependencias en cada servicio
```bash
# AuthService
cd AuthService && pnpm install && cd ..

# RestaurantesService
cd RestaurantesService && pnpm install && cd ..

# PedidosReservacionesService
cd PedidosReservacionesService && pnpm install && cd ..

# EventosReportesService
cd EventosReportesService && pnpm install && cd ..

# Frontend
cd frontend && pnpm install && cd ..
```

### 2️⃣ Ejecutar los servicios (5 terminales separadas)

**Terminal 1 — AuthService**
```bash
cd AuthService
pnpm dev           # Puerto 3001
```

**Terminal 2 — RestaurantesService**
```bash
cd RestaurantesService
pnpm dev           # Puerto 3002
```

**Terminal 3 — PedidosReservacionesService**
```bash
cd PedidosReservacionesService
pnpm dev           # Puerto 3003
```

**Terminal 4 — EventosReportesService**
```bash
cd EventosReportesService
pnpm dev           # Puerto 3004
```

**Terminal 5 — Frontend**
```bash
cd frontend
pnpm dev           # Puerto 5173 → http://localhost:5173
```

### 3️⃣ Verificar que los servicios estén corriendo
```bash
# Cada servicio responde a:
curl http://localhost:3001/api/v1/health   # AuthService
curl http://localhost:3002/api/v1/health   # RestaurantesService
curl http://localhost:3003/api/v1/health   # PedidosReservacionesService
curl http://localhost:3004/api/v1/health   # EventosReportesService
```

### 4️⃣ Variables de entorno
Cada servicio tiene su propio `.env` con:
- `PORT` — Puerto del servicio
- `DATABASE_URL` — PostgreSQL (compartida)
- `MONGO_URI` — MongoDB (compartida)
- `JWT_SECRET` — Secreto JWT (compartido)
- `CLOUDINARY_*` — Credenciales de Cloudinary
- `EMAIL_USER`, `EMAIL_PASS` — Gmail para notificaciones

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

## 📦 Arquitectura de Microservicios

```
Gestion-Restaurantes/
├── AuthService/                          (Puerto 3001)
│   ├── src/
│   │   ├── auth/                         # Login, JWT, roles
│   │   └── users/                        # Gestión de usuarios
│   ├── helpers/                          # Operaciones de auth
│   ├── middlewares/                      # Validación JWT, roles
│   ├── configs/                          # DB, CORS, Helmet
│   ├── index.js                          # Entry point
│   ├── package.json
│   └── .env
│
├── RestaurantesService/                  (Puerto 3002)
│   ├── src/
│   │   └── models/
│   │       ├── restaurantes/             # CRUD restaurantes
│   │       ├── menus/                    # Categorías y ítems
│   │       ├── platos/                   # Platillos
│   │       ├── mesas/                    # Gestión de mesas
│   │       ├── inventario/               # Stock
│   │       └── reseñas/                  # Reseñas de clientes
│   ├── helpers/                          # Cloudinary, file-upload
│   ├── middlewares/                      # Validación, roles
│   ├── configs/                          # DB, CORS, Helmet
│   ├── index.js
│   ├── package.json
│   └── .env
│
├── PedidosReservacionesService/          (Puerto 3003)
│   ├── src/
│   │   └── models/
│   │       ├── pedidos/                  # Órdenes y KDS
│   │       ├── reservaciones/            # Reservas de mesas
│   │       ├── detallePedidos/           # Items de orden
│   │       ├── facturas/                 # Facturación
│   │       ├── mesas/ (ref)              # Referencias
│   │       └── restaurantes/ (ref)
│   ├── helpers/                          # Email service
│   ├── middlewares/
│   ├── configs/
│   ├── index.js
│   ├── package.json
│   └── .env
│
├── EventosReportesService/               (Puerto 3004)
│   ├── src/
│   │   └── models/
│   │       ├── eventos/                  # Eventos del restaurante
│   │       ├── reportes/                 # Reportes y analíticas
│   │       └── estadisticas/             # KPIs y dashboards
│   ├── helpers/                          # Email, Excel export
│   ├── middlewares/
│   ├── configs/
│   ├── index.js
│   ├── package.json
│   └── .env
│
├── frontend/                             (Puerto 5173)
│   ├── src/
│   │   ├── shared/
│   │   │   ├── components/               # UI System (Button, Modal, Card, etc)
│   │   │   ├── constants/                # Design tokens
│   │   │   └── hooks/                    # useToastStore, etc
│   │   ├── features/                     # Módulos por feature
│   │   │   ├── auth/
│   │   │   ├── restaurants/
│   │   │   ├── orders/
│   │   │   ├── reservations/
│   │   │   └── events/
│   │   └── app/
│   │       ├── router/                   # Rutas y permisos
│   │       └── layouts/                  # Layouts principales
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env
│
├── .env                                  # Vars compartidas
├── .gitignore
├── .eslintrc.json
├── eslint.config.js
├── .prettierrc.json
├── docker-compose.yml                    # Para PostgreSQL + MongoDB
├── Gestion_Restaurantes_COMPLETO.postman_collection.json
└── README.md
```

### 🔄 Comunicación entre Servicios

Los servicios se comunican vía **HTTP REST** usando las siguientes URLs:

- **AuthService** → Valida JWT para otros servicios
- **RestaurantesService** → Sirve datos de restaurantes a otros servicios  
- **PedidosReservacionesService** → Consume datos de restaurantes y menús
- **EventosReportesService** → Consume datos de órdenes para reportes

Cada servicio tiene su propio `.env` con las URLs de los otros servicios si lo requiere.

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
