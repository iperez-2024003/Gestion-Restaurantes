# 🚀 GUÍA PASO A PASO: Migración a Microservicios

## ⚠️ ANTES DE EMPEZAR

**Ubicación:** `c:\ProyectoKinal\Gestion-Restaurantes\`

**Verificaciones previas:**
```powershell
# 1. Estar en el directorio correcto
cd c:\ProyectoKinal\Gestion-Restaurantes

# 2. Verificar estado de git
git status

# 3. Verificar rama actual (debe estar en main o master)
git branch

# 4. Verificar que no haya cambios pendientes
git status --porcelain
```

---

## FASE 1️⃣: Preparación

### Paso 1.1: Crear rama `develop` (si no existe)
```powershell
cd c:\ProyectoKinal\Gestion-Restaurantes

# Verificar si develop existe
git branch -a

# Si NO existe, crear:
git checkout -b develop

# Si YA existe, cambiar a ella:
git checkout develop

# Verificar que estamos en develop
git branch
```

### Paso 1.2: Crear estructura de directorios para servicios
```powershell
cd c:\ProyectoKinal\Gestion-Restaurantes

# Crear directorios principales
mkdir -Force AuthService
mkdir -Force RestaurantesService
mkdir -Force PedidosReservacionesService
mkdir -Force EventosReportesService
mkdir -Force docs
mkdir -Force Endpoints
mkdir -Force scripts
mkdir -Force shared

# Verificar creación
ls -Directory
```

### Paso 1.3: Crear subdirectorios dentro de cada servicio
```powershell
# Para cada servicio, crear estructura
foreach ($service in @('AuthService', 'RestaurantesService', 'PedidosReservacionesService', 'EventosReportesService')) {
    mkdir -Force "$service/configs"
    mkdir -Force "$service/helpers"
    mkdir -Force "$service/middlewares"
    mkdir -Force "$service/src"
    mkdir -Force "$service/uploads"
}

# Verificar
ls AuthService
```

### Paso 1.4: Copiar archivos de configuración base

```powershell
# Copiar configs a AuthService
Copy-Item configs/app.js AuthService/configs/
Copy-Item configs/config.js AuthService/configs/
Copy-Item configs/cors-configuration.js AuthService/configs/
Copy-Item configs/db.js AuthService/configs/
Copy-Item configs/helmet-configuration.js AuthService/configs/

# Copiar a RestaurantesService
Copy-Item configs/app.js RestaurantesService/configs/
Copy-Item configs/cors-configuration.js RestaurantesService/configs/
Copy-Item configs/db.js RestaurantesService/configs/
Copy-Item configs/helmet-configuration.js RestaurantesService/configs/

# Copiar a PedidosReservacionesService
Copy-Item configs/app.js PedidosReservacionesService/configs/
Copy-Item configs/cors-configuration.js PedidosReservacionesService/configs/
Copy-Item configs/db.js PedidosReservacionesService/configs/
Copy-Item configs/helmet-configuration.js PedidosReservacionesService/configs/

# Copiar a EventosReportesService
Copy-Item configs/app.js EventosReportesService/configs/
Copy-Item configs/cors-configuration.js EventosReportesService/configs/
Copy-Item configs/db.js EventosReportesService/configs/
Copy-Item configs/helmet-configuration.js EventosReportesService/configs/
```

### Paso 1.5: Copiar middlewares compartidos
```powershell
foreach ($service in @('AuthService', 'RestaurantesService', 'PedidosReservacionesService', 'EventosReportesService')) {
    Copy-Item middlewares/* "$service/middlewares/" -Force
}
```

### Paso 1.6: Copiar helpers compartidos a carpeta `shared/`
```powershell
# Crear estructura de shared
mkdir -Force shared/helpers
mkdir -Force shared/utils
mkdir -Force shared/constants

# Copiar helpers compartidos
Copy-Item helpers/uuid-generator.js shared/helpers/
Copy-Item helpers/role-constants.js shared/helpers/
Copy-Item helpers/file-upload.js shared/helpers/
Copy-Item helpers/file-validator.js shared/helpers/
Copy-Item helpers/admin-seed.js shared/helpers/

# Copiar utils compartidos
Copy-Item utils/* shared/utils/ -Force
Copy-Item helpers/generate-jwt.js shared/helpers/ # Para que otros servicios puedan validar tokens
```

### Paso 1.7: Copiar frontend (sin cambios)
```powershell
# El frontend NO se toca, pero asegurarse que está:
ls -Path frontend
# Debe mostrar: eslint.config.js, index.html, package.json, vite.config.js, public/, src/
```

---

## FASE 2️⃣: AuthService

### Paso 2.1: Copiar código fuente de auth y users
```powershell
# Crear subdirectorios en AuthService/src
mkdir -Force AuthService/src/auth
mkdir -Force AuthService/src/users

# Copiar rutas y controladores de auth
Copy-Item src/auth/auth.controller.js AuthService/src/auth/
Copy-Item src/auth/auth.routes.js AuthService/src/auth/
Copy-Item src/auth/role.model.js AuthService/src/auth/

# Copiar todo el directorio de users (si existe)
if (Test-Path src/users) {
    Copy-Item src/users/* AuthService/src/users/ -Recurse -Force
}
```

### Paso 2.2: Copiar helpers de auth a AuthService
```powershell
mkdir -Force AuthService/helpers

Copy-Item helpers/auth-operations.js AuthService/helpers/
Copy-Item helpers/generate-jwt.js AuthService/helpers/
Copy-Item helpers/profile-operations.js AuthService/helpers/
Copy-Item helpers/role-db.js AuthService/helpers/
Copy-Item helpers/user-db.js AuthService/helpers/
Copy-Item helpers/role-constants.js AuthService/helpers/ # Si es específico de auth

# Si hay referencia a shared:
# Copy-Item shared/helpers/uuid-generator.js AuthService/helpers/
```

### Paso 2.3: Crear `AuthService/index.js`
```javascript
// AuthService/index.js
import app from './configs/app.js';
import config from './configs/config.js';
import corsConfiguration from './configs/cors-configuration.js';
import helmetConfiguration from './configs/helmet-configuration.js';
import db from './configs/db.js';
import authRoutes from './src/auth/auth.routes.js';

// Aplicar configuraciones
corsConfiguration(app);
helmetConfiguration(app);

// Rutas
app.use('/api/auth', authRoutes);

// Manejo de errores global
import errorHandler from './middlewares/server-genericError-handler.js';
app.use(errorHandler);

// Iniciar servidor
const PORT = config.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔐 AuthService escuchando en puerto ${PORT}`);
});
```

### Paso 2.4: Crear `AuthService/package.json`
```powershell
# Ver el package.json actual para copiar versiones
cat package.json
```

Basado en las dependencias, crear AuthService/package.json con:
```json
{
  "name": "auth-service",
  "version": "1.0.0",
  "type": "module",
  "description": "Authentication Service for BuenProvecho",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "seed": "node helpers/admin-seed.js"
  },
  "dependencies": {
    "express": "^4.21.1",
    "sequelize": "^6.37.0",
    "pg": "^8.11.3",
    "pg-hstore": "^2.3.4",
    "mongoose": "^8.9.4",
    "argon2": "^0.31.2",
    "jsonwebtoken": "^9.1.2",
    "dotenv": "^16.4.5",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "cloudinary": "^1.41.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "eslint": "^8.56.0"
  }
}
```

### Paso 2.5: Crear `AuthService/.env`
```powershell
# Copiar .env actual si existe y está en gitignore
if (Test-Path .env) {
    Copy-Item .env AuthService/
    Write-Host "✅ .env copiado a AuthService"
} else {
    Write-Host "⚠️ No existe .env en raíz, crear uno en AuthService/"
}

# Modificar AuthService/.env para que tenga:
# PORT=3001 (diferente al monolito)
# DATABASE_URL=... (igual)
# MONGO_URI=... (igual)
# JWT_SECRET=... (igual)
# CLOUDINARY_... (si existe)
```

### Paso 2.6: Instalar dependencias de AuthService
```powershell
cd AuthService
pnpm install
cd ..

# Verificar instalación
ls AuthService/node_modules
```

---

## FASE 3️⃣: RestaurantesService

### Paso 3.1: Copiar código fuente de restaurants
```powershell
# Crear estructura de modelos
mkdir -Force RestaurantesService/src/models/restaurantes
mkdir -Force RestaurantesService/src/models/menus
mkdir -Force RestaurantesService/src/models/platos
mkdir -Force RestaurantesService/src/models/mesas
mkdir -Force RestaurantesService/src/models/inventario
mkdir -Force RestaurantesService/src/models/reseñas
mkdir -Force RestaurantesService/src/helpers

# Copiar restaurantes
if (Test-Path src/restaurant) {
    Copy-Item src/restaurant/* RestaurantesService/src/models/restaurantes/ -Recurse -Force
}

# Copiar menús
if (Test-Path src/menu) {
    Copy-Item src/menu/* RestaurantesService/src/models/menus/ -Recurse -Force
}

# Copiar platos (puede estar en menu también)
if (Test-Path src/menu) {
    Copy-Item src/menu/* RestaurantesService/src/models/platos/ -Recurse -Force
}

# Copiar mesas/tables
if (Test-Path src/table) {
    Copy-Item src/table/* RestaurantesService/src/models/mesas/ -Recurse -Force
}

# Copiar reseñas
if (Test-Path src/review) {
    Copy-Item src/review/* RestaurantesService/src/models/reseñas/ -Recurse -Force
}
```

### Paso 3.2: Copiar helpers específicos de Restaurantes
```powershell
Copy-Item helpers/cloudinary-service.js RestaurantesService/helpers/
Copy-Item helpers/file-upload.js RestaurantesService/helpers/
Copy-Item helpers/file-validator.js RestaurantesService/helpers/
Copy-Item helpers/uuid-generator.js RestaurantesService/helpers/
```

### Paso 3.3: Crear `RestaurantesService/index.js`
```javascript
// RestaurantesService/index.js
import app from './configs/app.js';
import config from './configs/config.js';
import corsConfiguration from './configs/cors-configuration.js';
import helmetConfiguration from './configs/helmet-configuration.js';
import db from './configs/db.js';

// Importar rutas (se reexportarán desde modelos)
import restaurantesRoutes from './src/models/restaurantes/restaurant.routes.js';
import menusRoutes from './src/models/menus/menu.routes.js';
import tablasRoutes from './src/models/mesas/table.routes.js';
import reseniasRoutes from './src/models/reseñas/review.routes.js';

// Aplicar configuraciones
corsConfiguration(app);
helmetConfiguration(app);

// Rutas
app.use('/api/restaurantes', restaurantesRoutes);
app.use('/api/menus', menusRoutes);
app.use('/api/mesas', tablasRoutes);
app.use('/api/reseñas', reseniasRoutes);

// Manejo de errores
import errorHandler from './middlewares/server-genericError-handler.js';
app.use(errorHandler);

const PORT = config.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🏪 RestaurantesService escuchando en puerto ${PORT}`);
});
```

### Paso 3.4: Crear `RestaurantesService/package.json`
```json
{
  "name": "restaurantes-service",
  "version": "1.0.0",
  "type": "module",
  "description": "Restaurantes Service for BuenProvecho",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.21.1",
    "mongoose": "^8.9.4",
    "dotenv": "^16.4.5",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "cloudinary": "^1.41.0",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "eslint": "^8.56.0"
  }
}
```

### Paso 3.5: Copiar .env y instalar dependencias
```powershell
Copy-Item .env RestaurantesService/.env -Force
cd RestaurantesService
pnpm install
cd ..
```

---

## FASE 4️⃣: PedidosReservacionesService

### Paso 4.1: Copiar código fuente
```powershell
# Crear estructura
mkdir -Force PedidosReservacionesService/src/models/pedidos
mkdir -Force PedidosReservacionesService/src/models/detallePedidos
mkdir -Force PedidosReservacionesService/src/models/reservaciones
mkdir -Force PedidosReservacionesService/src/models/facturas
mkdir -Force PedidosReservacionesService/src/models/mesas
mkdir -Force PedidosReservacionesService/src/models/platos
mkdir -Force PedidosReservacionesService/src/models/restaurantes
mkdir -Force PedidosReservacionesService/src/helpers

# Copiar código
Copy-Item src/order/* PedidosReservacionesService/src/models/pedidos/ -Recurse -Force
Copy-Item src/reservation/* PedidosReservacionesService/src/models/reservaciones/ -Recurse -Force

# Copiar referencias a otras entidades
Copy-Item src/menu/* PedidosReservacionesService/src/models/platos/ -Recurse -Force
Copy-Item src/table/* PedidosReservacionesService/src/models/mesas/ -Recurse -Force
Copy-Item src/restaurant/restaurant.model.js PedidosReservacionesService/src/models/restaurantes/ -Force
```

### Paso 4.2: Copiar helpers
```powershell
Copy-Item helpers/email-service.js PedidosReservacionesService/helpers/
Copy-Item helpers/uuid-generator.js PedidosReservacionesService/helpers/
Copy-Item helpers/file-upload.js PedidosReservacionesService/helpers/
```

### Paso 4.3: Crear `PedidosReservacionesService/index.js`
```javascript
// PedidosReservacionesService/index.js
import app from './configs/app.js';
import config from './configs/config.js';
import corsConfiguration from './configs/cors-configuration.js';
import helmetConfiguration from './configs/helmet-configuration.js';
import db from './configs/db.js';

// Importar rutas
import pedidosRoutes from './src/models/pedidos/order.routes.js';
import reservacionesRoutes from './src/models/reservaciones/reservation.routes.js';

corsConfiguration(app);
helmetConfiguration(app);

// Rutas
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/reservaciones', reservacionesRoutes);

import errorHandler from './middlewares/server-genericError-handler.js';
app.use(errorHandler);

const PORT = config.PORT || 3003;
app.listen(PORT, () => {
  console.log(`📋 PedidosReservacionesService escuchando en puerto ${PORT}`);
});
```

### Paso 4.4: Crear `PedidosReservacionesService/package.json`
```json
{
  "name": "pedidos-reservaciones-service",
  "version": "1.0.0",
  "type": "module",
  "description": "Pedidos y Reservaciones Service for BuenProvecho",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.21.1",
    "mongoose": "^8.9.4",
    "dotenv": "^16.4.5",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "nodemailer": "^6.9.7"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "eslint": "^8.56.0"
  }
}
```

### Paso 4.5: Instalar
```powershell
Copy-Item .env PedidosReservacionesService/.env -Force
cd PedidosReservacionesService
pnpm install
cd ..
```

---

## FASE 5️⃣: EventosReportesService

### Paso 5.1: Copiar código
```powershell
# Crear estructura
mkdir -Force EventosReportesService/src/models/eventos
mkdir -Force EventosReportesService/src/models/reportes
mkdir -Force EventosReportesService/src/models/estadisticas
mkdir -Force EventosReportesService/src/helpers

# Copiar eventos
Copy-Item src/event/* EventosReportesService/src/models/eventos/ -Recurse -Force

# Copiar reportes
Copy-Item src/report/* EventosReportesService/src/models/reportes/ -Recurse -Force

# Copiar estadísticas
Copy-Item src/statistics/* EventosReportesService/src/models/estadisticas/ -Recurse -Force
```

### Paso 5.2: Copiar helpers
```powershell
Copy-Item helpers/email-service.js EventosReportesService/helpers/
Copy-Item helpers/uuid-generator.js EventosReportesService/helpers/
```

### Paso 5.3: Crear `EventosReportesService/index.js`
```javascript
// EventosReportesService/index.js
import app from './configs/app.js';
import config from './configs/config.js';
import corsConfiguration from './configs/cors-configuration.js';
import helmetConfiguration from './configs/helmet-configuration.js';
import db from './configs/db.js';

import eventosRoutes from './src/models/eventos/event.routes.js';
import reportesRoutes from './src/models/reportes/report.routes.js';
import estadisticasRoutes from './src/models/estadisticas/statistics.routes.js';

corsConfiguration(app);
helmetConfiguration(app);

app.use('/api/eventos', eventosRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/estadisticas', estadisticasRoutes);

import errorHandler from './middlewares/server-genericError-handler.js';
app.use(errorHandler);

const PORT = config.PORT || 3004;
app.listen(PORT, () => {
  console.log(`📊 EventosReportesService escuchando en puerto ${PORT}`);
});
```

### Paso 5.4: Crear `EventosReportesService/package.json`
```json
{
  "name": "eventos-reportes-service",
  "version": "1.0.0",
  "type": "module",
  "description": "Eventos y Reportes Service for BuenProvecho",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.21.1",
    "mongoose": "^8.9.4",
    "dotenv": "^16.4.5",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "eslint": "^8.56.0"
  }
}
```

### Paso 5.5: Instalar
```powershell
Copy-Item .env EventosReportesService/.env -Force
cd EventosReportesService
pnpm install
cd ..
```

---

## FASE 6️⃣: Cleanup y Validación

### Paso 6.1: Crear carpeta `socket` compartida (si es necesario)
```powershell
# Si hay configuración de socket.io:
if (Test-Path src/socket) {
    mkdir -Force shared/socket
    Copy-Item src/socket/* shared/socket/ -Recurse -Force
}
```

### Paso 6.2: Documentación
```powershell
# Crear README en docs/
@"
# Servicios de BuenProvecho

## Arquitectura de Microservicios

- **AuthService** (Puerto 3001): Autenticación y usuarios
- **RestaurantesService** (Puerto 3002): Restaurantes, menús, mesas
- **PedidosReservacionesService** (Puerto 3003): Pedidos y reservaciones
- **EventosReportesService** (Puerto 3004): Eventos y reportes

## Ejecutar Servicios

### Desarrollo
```powershell
# Terminal 1: AuthService
cd AuthService
pnpm dev

# Terminal 2: RestaurantesService
cd RestaurantesService
pnpm dev

# Terminal 3: PedidosReservacionesService
cd PedidosReservacionesService
pnpm dev

# Terminal 4: EventosReportesService
cd EventosReportesService
pnpm dev

# Terminal 5: Frontend
cd frontend
pnpm dev
```

## URLs de Servicios

- AuthService: http://localhost:3001
- RestaurantesService: http://localhost:3002
- PedidosReservacionesService: http://localhost:3003
- EventosReportesService: http://localhost:3004
- Frontend: http://localhost:5173

"@ | Out-File docs/SERVICES.md -Encoding UTF8
```

### Paso 6.3: Eliminar `src/` original (ya distribuido)
```powershell
# ⚠️ CUIDADO: Verificar primero que todo está copiado
# Listar qué hay en src/
ls src/

# Si todo está ok, renombrar (no eliminar, por si acaso)
Rename-Item src src.backup

Write-Host "✅ src/ renombrado a src.backup (seguridad)"
```

### Paso 6.4: Crear raíz .env actualizado
```powershell
# Crear .env raíz que apunte a servicios
@"
# Configuración para acceso a servicios (Frontend y cross-service)
AUTH_SERVICE_URL=http://localhost:3001
RESTAURANTES_SERVICE_URL=http://localhost:3002
PEDIDOS_RESERVACIONES_SERVICE_URL=http://localhost:3003
EVENTOS_REPORTES_SERVICE_URL=http://localhost:3004

# Database compartidas (mismo que antes)
DATABASE_URL=...
MONGO_URI=...
JWT_SECRET=...

"@ | Out-File .env.services -Encoding UTF8

Write-Host "✅ .env.services creado con URLs de servicios"
```

### Paso 6.5: Validación de estructura
```powershell
# Verificar estructura final
Write-Host "========== ESTRUCTURA FINAL ==========" -ForegroundColor Green
ls -Directory
Write-Host "=====================================`n"

# Verificar que cada servicio tiene package.json
@('AuthService', 'RestaurantesService', 'PedidosReservacionesService', 'EventosReportesService') | ForEach-Object {
    if (Test-Path "$_/package.json") {
        Write-Host "✅ $_/package.json" -ForegroundColor Green
    } else {
        Write-Host "❌ $_/package.json FALTA" -ForegroundColor Red
    }
}

# Verificar que frontend está intacto
if (Test-Path frontend/src/shared/constants/uiConstants.js) {
    Write-Host "✅ Frontend UI System intacto" -ForegroundColor Green
} else {
    Write-Host "⚠️ Frontend no verificado" -ForegroundColor Yellow
}
```

### Paso 6.6: Commit a develop
```powershell
# Agregar cambios
git add -A

# Status
git status

# Commit
git commit -m "feat: restructure project to microservices architecture

- Created AuthService for authentication and user management
- Created RestaurantesService for restaurants, menus, and tables
- Created PedidosReservacionesService for orders and reservations
- Created EventosReportesService for events and reporting
- Preserved frontend with complete UI System
- Maintained database connections and authentication flow
- No breaking changes to functionality"

# Push a develop
git push origin develop
```

---

## ✅ VERIFICACIÓN FINAL

### Checklist de Validación

- [ ] Rama `develop` creada y activa
- [ ] Estructura de directorios creada
- [ ] AuthService con código migrando y package.json
- [ ] RestaurantesService con código migrando y package.json
- [ ] PedidosReservacionesService con código migrando y package.json
- [ ] EventosReportesService con código migrando y package.json
- [ ] Frontend preservado con UI System intacto
- [ ] shared/ con helpers compartidos
- [ ] Documentación en docs/
- [ ] .env actualizado en raíz
- [ ] Git commit exitoso en develop

### Pruebas Recomendadas

```powershell
# Test 1: Iniciar AuthService
cd AuthService
pnpm install
pnpm dev
# Debe escuchar en puerto 3001

# Test 2: Iniciar frontend
cd frontend
pnpm dev
# Debe escuchar en puerto 5173 y mostrar UI System intacto

# Test 3: Verificar endpoints
# Usar Postman con URLs:
# POST http://localhost:3001/api/auth/login
# GET http://localhost:3002/api/restaurantes
# etc.
```

---

## 🆘 Rollback (si algo sale mal)

```powershell
# Volver al commit anterior
git reset --hard HEAD~1

# O volver a main/master
git checkout main
```

---

**Documento generado para guía paso a paso sin romper funcionalidad.**
