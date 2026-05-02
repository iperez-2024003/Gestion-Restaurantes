# 🍽️ API Gestión de Restaurantes (SaaS)

Bienvenido a la API RESTful de **Gestión de Restaurantes**, una arquitectura Multi-Tenant de alto nivel (Senior-grade) construida con **Node.js, Express, PostgreSQL y Sequelize**. Este sistema permite administrar múltiples restaurantes, controlando de manera transaccional inventarios, facturación, y órdenes en tiempo real mediante WebSockets.

---

## 🚀 Instalación y Puesta en Marcha

Sigue estos pasos para levantar el proyecto de forma local:

### 1. Clonar el Repositorio
Abre tu terminal y ejecuta:
```bash
git clone <url_de_tu_repositorio>
cd Gestion-Restaurantes
```

### 2. Variables de Entorno
Asegúrate de que existe el archivo `.env` en la raíz del proyecto. Debe contener la configuración base (puertos, bases de datos y llaves JWT):
```env
PORT=3005
DB_HOST=localhost
DB_PORT=5436
DB_NAME=Gestion-Restaurantes
DB_USERNAME=root
DB_PASSWORD=admin
JWT_SECRET=TuSecretoMuySeguro...
```

### 3. Levantar la Base de Datos (Docker)
El proyecto usa PostgreSQL. Levanta el contenedor utilizando el archivo `docker-compose.yml` incluido:
```bash
docker-compose up -d
```

### 4. Instalar Dependencias
Se recomienda utilizar `pnpm` (aunque `npm` también funciona):
```bash
pnpm install
```

### 5. Iniciar el Servidor
Inicia la aplicación en entorno de desarrollo. Sequelize se encargará de crear y sincronizar las tablas de tu base de datos automáticamente.
```bash
pnpm run dev
```
🎉 El servidor estará corriendo en: `http://localhost:3005/api/v1`

---

## 🎭 Arquitectura de Roles (¿Cómo usar el sistema?)

Este sistema es un SaaS (Software as a Service) y restringe permisos a través de **4 roles jerárquicos**. A continuación se explica el ciclo de vida de un usuario según su rol:

### 1. 👑 SUPER_ADMIN_ROLE (El Dueño de la Plataforma)
Es el administrador supremo. Tú, como desarrollador o dueño de la aplicación, eres el Super Admin.
* **Flujo de uso:** Entras al sistema para crear Nuevos Restaurantes. 
* **Qué puedes ver:** Puedes consultar estadísticas globales masivas: métricas totales de facturación, cuáles son las **Horas Pico** donde hay más pedidos en la red, y conocer a los **Clientes Frecuentes (VIP)** que más dinero han gastado.

### 2. 🏢 RESTAURANT_ADMIN_ROLE (Gerente del Restaurante)
Representa al dueño o gerente de un restaurante en específico.
* **Flujo de uso:** Recibe su usuario de parte del Super Admin. Una vez dentro, configura su menú (platos), añade fotos, precios, tiempos de preparación y el **stock de ingredientes**. También da de alta a sus meseros (Staff).
* **Qué puede hacer:** Revisa facturación de su local, cambia precios, y **Descarga Reportes de Ventas en Excel** de manera diaria para la contabilidad de su negocio.

### 3. 👨‍🍳 STAFF_ROLE (Mesero / Cocinero / Cajero)
Trabajador asociado directamente a un Restaurante.
* **Flujo de uso:** Inicia sesión al comenzar su turno. Su trabajo principal es confirmar órdenes entrantes (de cambiar estado "Pendiente" a "Preparando" o "Pagada") y asistir a la creación manual de órdenes de los comensales que llegan físicamente al local.

### 4. 👤 CLIENT_ROLE (Cliente Final / Comensal)
El usuario que desea pedir comida o reservar una mesa.
* **Flujo de uso:** Se registra a sí mismo de manera pública en la app. Revisa el listado de restaurantes, ve el menú y crea órdenes (para Domicilio, Para Llevar, o Comer en Sitio).
* **Qué puede hacer:** Si el restaurante tiene stock del plato, su orden entra. Luego puede dejar una Calificación (Review) al restaurante y consultar el historial pasado de todas sus compras o reservaciones.

---

## ⚡ Guía Rápida de Postman (Ejemplo Paso a Paso)

Para probar la plataforma correctamente en Postman, el flujo siempre inicia autenticándote para obtener un "pase" (Token JWT). Aquí te explico cómo probar la vida de la app desde los distintos roles:

### Paso 1: Obtener la Llave Maestra (Login)
Ve a la carpeta **`1. 🌍 Acceso Público & Autenticación`** > **`Login`**.
* En el `Body` (raw JSON), manda tus credenciales, por ejemplo, el correo del Súper Admin o el correo del restaurante.
* Al darle **Send**, el servidor te devolverá un `token` larguísimo.
* **🔑 Cópialo**. En Postman, ve a "Environments" o a la pestaña "Variables" de tu colección y pégalo en tu variable `{{token}}` (o configúralo en la pestaña de Auth como Bearer Token). 

---

### Paso 2: Ejemplos de uso por Rol

#### 👨‍💼 Como SUPER ADMIN (Rol: `SUPER_ADMIN_ROLE`)
*Te logueaste con el correo del dueño del sistema.*
1. Ve a la carpeta **`5. 👑 SUPER_ADMIN_ROLE`** > **`Horas Pico (Peak Hours)`**.
2. En la URL (o variables), asegúrate de tener un `{{restaurant_id}}` válido.
3. Dale **Send**. El sistema verificará tu token (sabe que eres Super Admin) y te dejará pasar, entregándote un arreglo con las horas de mayor facturación.
4. Si intentas pedir comida o usar rutas de clientes... te dará un "Error de Rol", porque tu trabajo es administrar.

#### 🏢 Como DUEÑO DE RESTAURANTE (Rol: `RESTAURANT_ADMIN_ROLE`)
*Te logueaste con el correo del gerente de una franquicia.*
1. Necesitas cerrar caja y ver tu inventario. Ve a la carpeta **`6. 🧾 Facturación y Reportes`** > **`Descargar Reporte Excel Diario`**.
2. Tu Token ya está en los Headers gracias a tu variable.
3. Al darle click, **NO LE DES AL BOTÓN AZUL NORMAL DE SEND**. Haz click en la flechita a su lado y escoge **"Send and Download"**. 
4. El backend armará un `.xlsx` en memoria con todas tus ventas y te abrirá la ventana para guardar tu archivo real en tu computadora.

#### 👤 Como CLIENTE FINAL (Rol: `CLIENT_ROLE`)
*Te fuiste a `Register` y creaste un usuario nuevo, o te logueaste como cliente.*
1. Tienes hambre. Ve a la carpeta **`2. 👤 CLIENT_ROLE (Clientes)`** > **`Create Order`**.
2. En el `Body`, mandas el ID del Restaurante y un arreglo con los platillos que quieres (`menu_item_id` y `quantity`).
3. Dale **Send**. Si pusiste que querías 5 hamburguesas y el sistema solo tiene 2 en inventario, PostgreSQL cancelará tu orden de inmediato devolviendo un error. Si hay stock suficiente, te descontará inventario, creará tu factura y te regresará un código 200 OK.
4. Terminas de comer. Ve a **`Submit Review`** (en la misma carpeta) y dale 5 estrellas al restaurante.

#### 👨‍🍳 Como MESERO (Rol: `STAFF_ROLE`)
*Te logueaste con el correo de un mesero.*
1. El cliente de arriba acaba de crear su orden. Tú vas a la carpeta **`3. 👨‍🍳 STAFF_ROLE (Empleados)`** > **`Update Order Status`**.
2. Cambias el estado a `"serving"` en el `Body`.
3. El sistema valida tu token, ve que eres mesero de *ese* restaurante, y permite que la orden avance sin dejarte tocar las configuraciones de los menús.

---
*Desarrollado con arquitectura sólida, control transaccional de bases de datos, validaciones robustas y tiempo real integrado.*
