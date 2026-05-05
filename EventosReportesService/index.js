import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './configs/db.js';

// Importar middlewares
import { requestLimit } from './middlewares/request-limit.js';
import { corsOptions } from './configs/cors-configuration.js';
import { helmetConfiguration } from './configs/helmet-configuration.js';
import {
  errorHandler,
  notFound,
} from './middlewares/server-genericError-handler.js';

// Importar rutas
import eventRoutes from './src/models/eventos/event.routes.js';
import statisticsRoutes from './src/models/estadisticas/statistics.routes.js';

// Configurar variables de entorno
dotenv.config();

// Crear aplicación
const app = express();
const BASE_PATH = '/api/v1';

// Middlewares
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(cors(corsOptions));
app.use(helmet(helmetConfiguration));
app.use(requestLimit);
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Rutas
app.use(`${BASE_PATH}/events`, eventRoutes);
app.use(`${BASE_PATH}/statistics`, statisticsRoutes);

// Health check
app.get(`${BASE_PATH}/health`, (req, res) => {
  res.status(200).json({
    status: 'Healthy',
    timestamp: new Date().toISOString(),
    service: '📊 EventosReportesService',
  });
});

// Manejo de rutas no encontradas
app.use(notFound);

// Manejo de errores global
app.use(errorHandler);

// Manejar errores no capturados
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', err);
  process.exit(1);
});

// Iniciar servidor
const PORT = process.env.EVENTOS_REPORTES_SERVICE_PORT || process.env.PORT || 3004;

dbConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`📊 EventosReportesService escuchando en puerto ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch((err) => {
  console.error('Error conectando a la base de datos:', err);
  process.exit(1);
});

export default app;
