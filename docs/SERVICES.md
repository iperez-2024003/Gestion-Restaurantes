# 🏢 Servicios de Microservicios - BuenProvecho

## 📋 Arquitectura

El proyecto ha sido restructurado de un monolito a una arquitectura de microservicios con 4 servicios independientes:

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| **AuthService** | 3001 | Autenticación y gestión de usuarios |
| **RestaurantesService** | 3002 | Restaurantes, menús, mesas y reseñas |
| **PedidosReservacionesService** | 3003 | Órdenes y reservaciones |
| **EventosReportesService** | 3004 | Eventos, reportes y estadísticas |
| **Frontend** | 5173 | Aplicación React (Vite) |

## 🚀 Ejecución

### Modo Desarrollo (Múltiples Terminales)

#### Terminal 1: AuthService
```bash
cd AuthService
pnpm install  # Primera vez
pnpm dev
```

#### Terminal 2: RestaurantesService
```bash
cd RestaurantesService
pnpm install  # Primera vez
pnpm dev
```

#### Terminal 3: PedidosReservacionesService
```bash
cd PedidosReservacionesService
pnpm install  # Primera vez
pnpm dev
```

#### Terminal 4: EventosReportesService
```bash
cd EventosReportesService
pnpm install  # Primera vez
pnpm dev
```

#### Terminal 5: Frontend
```bash
cd frontend
pnpm install  # Primera vez
pnpm dev
```

### URLs Locales

```
AuthService:                    http://localhost:3001
RestaurantesService:            http://localhost:3002
PedidosReservacionesService:    http://localhost:3003
EventosReportesService:         http://localhost:3004
Frontend (Vite):                http://localhost:5173
```

## 📦 Instalación de Dependencias (Una sola vez)

```bash
# Instalar dependencias en todos los servicios
cd AuthService && pnpm install && cd ..
cd RestaurantesService && pnpm install && cd ..
cd PedidosReservacionesService && pnpm install && cd ..
cd EventosReportesService && pnpm install && cd ..
cd frontend && pnpm install && cd ..
```

## 🔐 Variables de Entorno

Cada servicio tiene su propio `.env` copiado de la raíz. Asegúrate de que contenga:

```env
NODE_ENV=development
PORT=3001  # O el puerto correspondiente del servicio

# Base de Datos
DATABASE_URL=...
MONGO_URI=...

# Autenticación
JWT_SECRET=...

# Servicios de Terceros (si aplica)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## ✅ Verificación de Salud

Puedes verificar que cada servicio está funcionando llamando a su endpoint de health:

```bash
# AuthService
curl http://localhost:3001/api/v1/health

# RestaurantesService
curl http://localhost:3002/api/v1/health

# PedidosReservacionesService
curl http://localhost:3003/api/v1/health

# EventosReportesService
curl http://localhost:3004/api/v1/health
```

Respuesta esperada:
```json
{
  "status": "Healthy",
  "timestamp": "2026-05-04T...",
  "service": "🔐 AuthService"
}
```

## 📂 Estructura

```
Gestion-Restaurantes/
├── AuthService/
│   ├── index.js
│   ├── package.json
│   ├── .env
│   ├── configs/
│   ├── helpers/
│   ├── middlewares/
│   ├── src/
│   │   ├── auth/
│   │   └── users/
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
│   │   └── models/
│   │       ├── restaurantes/
│   │       ├── menus/
│   │       ├── platos/
│   │       ├── mesas/
│   │       ├── inventario/
│   │       └── reseñas/
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
│   │   └── models/
│   │       ├── pedidos/
│   │       ├── detallePedidos/
│   │       ├── reservaciones/
│   │       ├── facturas/
│   │       ├── mesas/ (ref)
│   │       ├── platos/ (ref)
│   │       └── restaurantes/ (ref)
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
│   │   └── models/
│   │       ├── eventos/
│   │       ├── reportes/
│   │       └── estadisticas/
│   └── uploads/
│
├── frontend/
│   ├── src/
│   │   └── shared/ (UI System intacto ✅)
│   │       ├── components/
│   │       │   ├── states/
│   │       │   │   ├── LoadingSpinner.jsx
│   │       │   │   ├── EmptyState.jsx
│   │       │   │   ├── ErrorState.jsx
│   │       │   │   └── Toast.jsx
│   │       │   ├── ui/
│   │       │   │   ├── UnifiedButton.jsx
│   │       │   │   ├── Modal.jsx
│   │       │   │   └── Card.jsx
│   │       │   └── forms/
│   │       │       └── FormInput.jsx
│   │       ├── constants/
│   │       │   └── uiConstants.js
│   │       └── hooks/
│   │           └── useToastStore.js
│   ├── package.json
│   └── vite.config.js
│
├── shared/
│   ├── helpers/
│   │   ├── uuid-generator.js
│   │   ├── role-constants.js
│   │   ├── file-upload.js
│   │   ├── file-validator.js
│   │   ├── admin-seed.js
│   │   └── generate-jwt.js
│   ├── utils/
│   └── constants/
│
├── docs/
│   └── SERVICES.md (este archivo)
│
├── scripts/
│   └── (Scripts de utilidad compartidos)
│
├── Endpoints/
│   └── (Documentación de APIs)
│
└── README.md
```

## 🔗 Comunicación Entre Servicios

Los servicios pueden comunicarse a través de:

1. **HTTP REST** - Para llamadas sincrónicas
2. **Socket.io** - Para comunicación en tiempo real (si aplica)

**Ejemplo de configuración entre servicios:**

En `.env` de cada servicio:
```env
AUTH_SERVICE_URL=http://localhost:3001
RESTAURANTES_SERVICE_URL=http://localhost:3002
PEDIDOS_RESERVACIONES_SERVICE_URL=http://localhost:3003
EVENTOS_REPORTES_SERVICE_URL=http://localhost:3004
```

## 🧪 Testing

Para verificar que los servicios están correctamente integrados:

```bash
# Obtener usuario (requiere token)
curl -X GET http://localhost:3001/api/v1/users \
  -H "Authorization: Bearer YOUR_TOKEN"

# Obtener restaurantes
curl http://localhost:3002/api/v1/restaurants

# Obtener órdenes (requiere token)
curl http://localhost:3003/api/v1/orders \
  -H "Authorization: Bearer YOUR_TOKEN"

# Obtener estadísticas (requiere token)
curl http://localhost:3004/api/v1/statistics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## ⚙️ Configuración de Base de Datos

Todos los servicios actualmente comparten las mismas bases de datos:

- **PostgreSQL**: Para datos de usuarios (Sequelize)
- **MongoDB**: Para datos de negocio (Mongoose)

Las variables de conexión se heredan del `.env` en cada servicio.

## 📝 Notas Importantes

✅ **Funcionalidad preservada**: Todos los endpoints continúan funcionando de la misma manera
✅ **Frontend intacto**: El sistema UI y la aplicación React no se han modificado
✅ **Autenticación vigente**: JWT y roles funcionan igual que antes
✅ **BD compartida**: Las bases de datos se mantienen sin cambios

## 🆘 Solución de Problemas

### Puerto ya en uso
```bash
# Linux/Mac - Encontrar proceso usando el puerto
lsof -i :3001

# Windows - PowerShell
Get-NetTCPConnection -LocalPort 3001
```

### Dependencias no instaladas
```bash
# Reinstalar en un servicio
cd AuthService
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Conexión a BD
- Verifica que `DATABASE_URL` y `MONGO_URI` estén configuradas correctamente
- Verifica que las BDs estén corriendo
- Revisa los logs de cada servicio para errores de conexión

### Validación JWT fallida
- Verifica que `JWT_SECRET` sea el mismo en todos los servicios
- Asegúrate de que el token no haya expirado
- Verifica el formato del header `Authorization: Bearer TOKEN`

## 🚀 Próximos Pasos

1. Instalar dependencias en cada servicio: `pnpm install`
2. Configurar variables de entorno (`.env` en cada servicio)
3. Iniciar servicios en terminales separadas
4. Verificar que frontend conecta correctamente
5. Probar endpoints con Postman o curl

---

**Documentación generada para arquitectura de microservicios de BuenProvecho**
