'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import { dbConnection } from './db.js';
import { initSocket } from '../src/socket/socket.config.js';


import '../src/users/user.model.js';
import '../src/auth/role.model.js';
import '../src/restaurant/restaurant.model.js';
import '../src/menu/menu.model.js';
import '../src/menu/menu-item.model.js';
import '../src/table/table.model.js';
import '../src/order/order.model.js';
import '../src/order/order-item.model.js';
import '../src/reservation/reservation.model.js';
import '../src/event/event.model.js';
import '../src/event/event-participant.model.js';
import '../src/review/review.model.js';





import { requestLimit } from '../middlewares/request-limit.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';
import {
  errorHandler,
  notFound,
} from '../middlewares/server-genericError-handler.js';


import authRoutes from '../src/auth/auth.routes.js';
import userRoutes from '../src/users/user.routes.js';
import restaurantRoutes from '../src/restaurant/restaurant.routes.js';
import menuRoutes from '../src/menu/menu.routes.js';
import orderRoutes from '../src/order/order.routes.js';
import reservationRoutes from '../src/reservation/reservation.routes.js';
import eventRoutes from '../src/event/event.routes.js';
import statisticsRoutes from '../src/statistics/statistics.routes.js';
import tableRoutes from '../src/table/table.routes.js';
import reviewRoutes from '../src/review/review.routes.js';
import reportRoutes from '../src/report/report.routes.js';




const BASE_PATH = '/api/v1';

const middlewares = (app) => {
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));
  app.use(express.json({ limit: '10mb' }));
  app.use('/uploads', express.static('uploads'));
  app.use(cors(corsOptions));
  app.use(helmet(helmetConfiguration));
  app.use(requestLimit);
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
};

const routes = (app) => {
  app.use(`${BASE_PATH}/auth`, authRoutes);
  app.use(`${BASE_PATH}/users`, userRoutes);
  app.use(`${BASE_PATH}/restaurants`, restaurantRoutes);
  app.use(`${BASE_PATH}/menus`, menuRoutes);
  app.use(`${BASE_PATH}/tables`, tableRoutes);
  app.use(`${BASE_PATH}/orders`, orderRoutes);
  app.use(`${BASE_PATH}/reservations`, reservationRoutes);
  app.use(`${BASE_PATH}/events`, eventRoutes);
  app.use(`${BASE_PATH}/statistics`, statisticsRoutes);
  app.use(`${BASE_PATH}/reviews`, reviewRoutes);
  app.use(`${BASE_PATH}/reports`, reportRoutes);




  app.get(`${BASE_PATH}/health`, (req, res) => {
    res.status(200).json({
      status: 'Healthy',
      timestamp: new Date().toISOString(),
      service: 'Gestion Restaurantes Service',
    });
  });

  app.use(notFound);
};

export const initServer = async () => {
  const app = express();
  const server = http.createServer(app);
  const PORT = process.env.PORT || 3000;
  app.set('trust proxy', 1);

  // Inicializar Socket.io
  initSocket(server);

  try {
    await dbConnection();

    // Seed roles
    const { seedRoles } = await import('../helpers/role-seed.js');
    await seedRoles();

    // ✨ NUEVO: Seed default ADMIN user
    const { seedAdminUser } = await import('../helpers/admin-seed.js');
    await seedAdminUser();

    middlewares(app);
    routes(app);

    app.use(errorHandler);

    server.listen(PORT, () => {
      console.log(`Gestion Restaurantes Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/health`);
    });
  } catch (err) {
    console.error(`Error starting server: ${err.message}`);
    process.exit(1);
  }
};