'use strict';

import { Router } from 'express';
import {
  getRestaurantOverview,
  getOrdersStats,
  getPopularDishes,
  getPlatformSummary,
} from './statistics.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';

const router = Router();

router.get('/restaurant/:id/overview', validateJWT, getRestaurantOverview);
router.get('/restaurant/:id/orders', validateJWT, getOrdersStats);
router.get('/restaurant/:id/popular-dishes', validateJWT, getPopularDishes);
router.get('/platform/summary', validateJWT, getPlatformSummary);

export default router;