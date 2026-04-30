<<<<<<< Updated upstream
Sistema de Gestión de Restaurantes - Guía de Uso
API REST - Proyecto Kinal IN6BM

📖 Descripción
Sistema completo de gestión para restaurantes que permite administrar restaurantes, menús, mesas, pedidos, reservaciones, eventos y generar estadísticas.
Tecnologías: Node.js + Express + PostgreSQL + JWT + Sequelize
Es un proyecto desarrollado con la metodología Scrum hecho por mi Iverson Pérez Maldonado - 2024003 
El proyecto es funcional pruebas adjundas en trello 
Cualquier duda comunicarse con mi persona iperez-2024003@kinal.edu.gt 

🚀 Iniciar el Proyecto
1. Iniciar Base de Datos con Docker
bash# Iniciar PostgreSQL y pgAdmin
docker-compose up -d

# Verificar que estén corriendo
docker ps
Servicios activos:

🐘 PostgreSQL: localhost:5432
🖥️ pgAdmin: http://localhost:5050

2. Iniciar el Servidor API
bash# En la carpeta del proyecto
pnpm run dev

# O si usas npm
npm run dev
Servidor corriendo en: http://localhost:3000
Health Check: http://localhost:3000/api/v1/health

🔐 Autenticación y Uso
Paso 1: Registrar Usuario
Endpoint: POST /api/v1/auth/register
json{
  "username": "admin_test",
  "email": "admin@test.com",
  "password": "Admin123!",
  "phone": "12345678"
}
Respuesta:
json{
  "ok": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid-generado",
    "username": "admin_test",
    "email": "admin@test.com"
  }
}
🔑 Guarda el id del usuario

Paso 2: Iniciar Sesión
Endpoint: POST /api/v1/auth/login
json{
  "email": "admin@test.com",
  "password": "Admin123!"
}
Respuesta:
json{
  "ok": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
🎫 Copia el token completo - Lo necesitas para todas las demás peticiones

Paso 3: Crear Restaurante
Endpoint: POST /api/v1/restaurants
Headers:
Authorization: Bearer TU_TOKEN_AQUI
Content-Type: application/json
Body:
json{
  "name": "La Trattoria Italiana",
  "description": "Auténtica cocina italiana",
  "address": "5ta Avenida 12-30, Zona 10, Guatemala",
  "phone": "+502 2345-6789",
  "email": "contacto@latrattoria.gt",
  "category": "fine_dining",
  "cuisine_type": "Italiana",
  "price_range": "$$$",
  "capacity": 80,
  "opening_time": "11:00:00",
  "closing_time": "23:00:00",
  "operating_days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
  "accepts_reservations": true,
  "admin_id": "TU_USER_ID_AQUI"
}
🏪 Guarda el id del restaurante

🐳 Uso de Docker
Comandos Básicos
bash# Ver contenedores corriendo
docker ps

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs solo de PostgreSQL
docker-compose logs -f postgres

# Detener servicios
docker-compose down

# Reiniciar servicios
docker-compose restart

# Limpiar todo (⚠️ BORRA LA BD)
docker-compose down -v
Acceder a PostgreSQL desde terminal
bashdocker exec -it gestion-restaurantes bash
psql -U root -d Gestion-Restaurantes
Comandos útiles en psql:
sql\l              -- Listar bases de datos
\c Gestion-Restaurantes  -- Conectar a BD
\dt             -- Listar tablas
\d users        -- Ver estructura de tabla
\q              -- Salir

🖥️ Uso de pgAdmin
Acceder a pgAdmin

Abre tu navegador
Ve a: http://localhost:5050
Login:

Email: admin@admin.com
Password: admin



Conectar al Servidor (Primera vez)

Click derecho en "Servers" → "Register" → "Server"
Tab General:

Name: Gestion Restaurantes


Tab Connection:

Host: postgres-restaurantes (nombre del contenedor)
Port: 5432
Database: Gestion-Restaurantes
Username: root
Password: root


Click "Save"

Ver las Tablas
Servers 
→ Gestion Restaurantes 
→ Databases 
→ Gestion-Restaurantes 
→ Schemas 
→ public 
→ Tables
Tablas creadas:

📁 users - Usuarios del sistema
📁 roles - Roles (admin, waiter, customer)
📁 restaurant - Restaurantes
📁 menu - Categorías de menú
📁 menu_item - Platillos
📁 table - Mesas
📁 order - Pedidos
📁 order_item - Items de pedidos
📁 reservation - Reservaciones
📁 event - Eventos gastronómicos
📁 event_participant - Participantes en eventos

Consultas SQL Útiles
Ver todos los restaurantes:
sqlSELECT 
  id, name, category, rating, 
  is_active, created_at
FROM restaurant
WHERE is_active = true
ORDER BY created_at DESC;
Ver menú completo de un restaurante:
sqlSELECT 
  m.name AS categoria,
  mi.name AS platillo,
  mi.price AS precio,
  mi.is_available AS disponible
FROM menu m
JOIN menu_item mi ON mi.menu_id = m.id
WHERE m.restaurant_id = 'TU_RESTAURANT_ID'
  AND m.is_active = true
ORDER BY m.display_order, mi.name;
Ver pedidos de hoy:
sqlSELECT 
  o.order_number,
  o.customer_name,
  o.status,
  o.total,
  o.created_at
FROM "order" o
WHERE DATE(o.created_at) = CURRENT_DATE
ORDER BY o.created_at DESC;
Ver reservaciones próximas:
sqlSELECT 
  r.reservation_number,
  r.customer_name,
  r.reservation_date,
  r.reservation_time,
  r.party_size,
  r.status,
  rest.name AS restaurante
FROM reservation r
JOIN restaurant rest ON rest.id = r.restaurant_id
WHERE r.reservation_date >= CURRENT_DATE
  AND r.status IN ('pending', 'confirmed')
ORDER BY r.reservation_date, r.reservation_time;
Ejecutar Consultas

Click derecho en Gestion-Restaurantes
Select "Query Tool"
Pega tu consulta SQL
Click en ▶ Execute o presiona F5

Crear Backup

Click derecho en Gestion-Restaurantes
"Backup..."
Filename: backup_gestion_restaurantes_2026-02-16.sql
Format: Plain
Click "Backup"


📋 Endpoints Principales
Base URL: http://localhost:3000/api/v1
Autenticación

POST /auth/register - Registrarse
POST /auth/login - Login

Restaurantes

POST /restaurants - Crear restaurante 🔒
GET /restaurants - Listar todos
GET /restaurants/:id - Ver uno
PUT /restaurants/:id - Actualizar 🔒
DELETE /restaurants/:id - Eliminar 🔒

Menús

POST /menus - Crear categoría 🔒
GET /menus - Listar categorías
POST /menus/items - Crear platillo 🔒
GET /menus/items/all - Listar platillos
PATCH /menus/items/:id/toggle - Cambiar disponibilidad 🔒

Mesas

POST /tables - Crear mesa 🔒
GET /tables - Listar mesas
GET /tables/available - Mesas disponibles
PATCH /tables/:id/status - Cambiar estado 🔒

Pedidos

POST /orders - Crear pedido 🔒
GET /orders - Listar pedidos 🔒
PATCH /orders/:id/status - Cambiar estado 🔒
POST /orders/:id/items - Agregar item 🔒

Reservaciones

POST /reservations - Crear reservación 🔒
GET /reservations - Listar 🔒
GET /reservations/check-availability - Verificar disponibilidad
PATCH /reservations/:id/confirm - Confirmar 🔒

Eventos

POST /events - Crear evento 🔒
GET /events - Listar eventos
POST /events/:id/register - Registrarse 🔒
GET /events/:id/participants - Ver participantes 🔒

Estadísticas

GET /statistics/restaurant/:id/overview - Resumen 🔒
GET /statistics/restaurant/:id/orders - Stats de pedidos 🔒
GET /statistics/restaurant/:id/popular-dishes - Top platillos 🔒
GET /statistics/platform/summary - Resumen plataforma 🔒

🔒 = Requiere token JWT en header Authorization: Bearer TOKEN
Total: ~60 endpoints

📬 Uso de Postman
Importar Colección

Abre Postman
Click en "Import"
Selecciona: Gestion_Restaurantes.postman_collection.json
Click "Import"

Configurar Environment

Click en el icono del ojo 👁️ (esquina superior derecha)
Click en "Add" (nuevo environment)
Nombre: Gestion Restaurantes - Local
Variables:

VariableValorbase_urlhttp://localhost:3000/api/v1token(vacío - se llena después del login)restaurant_id(vacío - se llena después de crear restaurante)user_id(vacío - se llena después del register)

Click "Save"
Selecciona el environment en el dropdown superior

Flujo de Prueba

Register → Copia user_id
Login → Copia token
Create Restaurant → Copia restaurant_id
Ahora puedes usar todos los demás endpoints


🔧 Solución de Problemas
Error: Cannot connect to PostgreSQL
bash# Verifica que Docker esté corriendo
docker ps

# Si no está, inicia:
docker-compose up -d

# Ver logs:
docker-compose logs postgres
Error: Port 3000 already in use
bash# Opción 1: Cambiar puerto en .env
PORT=3001

# Opción 2: Matar proceso
# Windows:
netstat -ano | findstr :3000
taskkill /PID <numero> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
Error: JWT token invalid

Verifica que el header tenga: Authorization: Bearer TU_TOKEN
Genera un nuevo token haciendo login de nuevo
Asegúrate de copiar el token completo

Reiniciar todo desde cero
bash# 1. Detener servidor (Ctrl+C)
# 2. Detener Docker
docker-compose down -v

# 3. Limpiar node_modules
rm -rf node_modules
npm cache clean --force

# 4. Reinstalar
npm install

# 5. Iniciar Docker
docker-compose up -d

# 6. Iniciar servidor
pnpm run dev

 Integración Entre Módulos
Los módulos no funcionan aislados, están conectados entre sí:
RESTAURANTE
    ↓
    ├─→ MENÚS (un restaurante tiene muchos menús)
    │      ↓
    │      └─→ PLATILLOS (cada menú tiene muchos platillos)
    │
    ├─→ MESAS (un restaurante tiene muchas mesas)
    │
    ├─→ PEDIDOS (los pedidos son de un restaurante específico)
    │      ↓
    │      └─→ ITEMS DEL PEDIDO (cada pedido tiene platillos del menú)
    │
    ├─→ RESERVACIONES (las reservaciones son para un restaurante)
    │
    └─→ EVENTOS (los eventos se realizan en un restaurante)
           ↓
           └─→ PARTICIPANTES (cada evento tiene participantes registrados)
Ejemplo de Integración Completa:
Un cliente hace una reservación para 4 personas → Sistema verifica mesas disponibles con capacidad suficiente → Reserva la Mesa #5 → Cliente llega y confirma → Mesero crea pedido asociado a Mesa #5 → Agrega platillos del menú → Sistema calcula total automáticamente → Pedido va a cocina → Se sirve → Cliente paga → Mesa vuelve a disponible → Toda la información queda registrada para estadísticas.

🛡️ Seguridad y Validaciones
El sistema implementa múltiples capas de seguridad:
Autenticación JWT:

Los usuarios deben hacer login para acceder
Cada petición protegida requiere un token válido
Los tokens expiran después de 24 horas

Validaciones de Negocio:

No se puede crear un pedido de platillos que no están disponibles
No se puede reservar en horarios fuera de operación del restaurante
No se pueden registrar más participantes de los permitidos en un evento
Los precios deben ser positivos
Las fechas de reservación deben ser futuras

Soft Delete:

Nada se borra permanentemente de la base de datos
Los registros se marcan como inactivos
Se mantiene historial completo para auditoría

Cálculos Automáticos:

El sistema calcula automáticamente IVA (12%)
Previene errores humanos en cuentas
Mantiene consistencia en precios


🎓 Valor Académico del Proyecto
Este proyecto demuestra conocimientos en:
✅ Backend Development: API REST con Node.js y Express
✅ Bases de Datos: Diseño relacional con PostgreSQL y Sequelize ORM
✅ Seguridad: Autenticación JWT, encriptación de passwords con Argon2
✅ Arquitectura: Microservicios, separación de responsabilidades (MVC)
✅ DevOps: Dockerización, docker-compose, ambientes de desarrollo
✅ Metodología Ágil: SCRUM con sprints de 7 días
✅ Trabajo en Equipo: Organización en equipos (Backend A y B)
✅ Documentación: API documentada, README completo, Postman Collection
✅ Testing: Validaciones robustas, manejo de errores
✅ Buenas Prácticas: Código limpio, comentado, modular y escalable

👥 Equipo de Desarrollo
Scrum Master: Iverson Armando Pérez Maldonado
Desarrolladores:

1. Iverson Armando Pérez Maldonado - 2024003
2. Jeremy Jhoel Méndez Palencia - 2021550
3. Oscar Sebastian Cumatz Lopez - 2021660
4. Carlos Daniel Chacón Duarte - 2021560
5. Jorge Eliam Aquino Reyes - 2021159
6. Jorge Lisandro Magzul Tzuquén - 2024029
7. Iverson Armando Pérez Maldonado - 2024003

Institución: Centro Educativo Técnico Laboral Kinal
Curso: IN6BM - Taller de Programación III
Profesor: Elmer Rodrigo Santos García
Período: Marzo - Junio 2026
=======
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
>>>>>>> Stashed changes
