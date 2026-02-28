'use strict';

import { Router } from 'express';
import {
  getRestaurantOverview,
  getOrdersStats,
  getPopularDishes,
  getPlatformSummary,
} from './statistics.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireAdmin } from '../../middlewares/require-role.js';

const router = Router();

router.get('/restaurant/:id/overview', [validateJWT, requireAdmin], getRestaurantOverview);
router.get('/restaurant/:id/orders', [validateJWT, requireAdmin], getOrdersStats);
router.get('/restaurant/:id/popular-dishes', [validateJWT, requireAdmin], getPopularDishes);
router.get('/platform/summary', [validateJWT, requireAdmin], getPlatformSummary);

export default router;