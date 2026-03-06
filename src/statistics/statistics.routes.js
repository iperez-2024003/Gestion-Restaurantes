'use strict';

import { Router } from 'express';
import {
  getRestaurantOverview,
  getOrdersStats,
  getPopularDishes,
  getPlatformSummary,
} from './statistics.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireSuperAdmin } from '../../middlewares/require-role.js';
import { validateUuidParam, validateQueryPeriod, validateQueryLimit } from '../../middlewares/validate-params.js';

const router = Router();

router.get('/restaurant/:id/overview', [validateJWT, requireSuperAdmin, validateUuidParam('id')], getRestaurantOverview);
router.get('/restaurant/:id/orders', [validateJWT, requireSuperAdmin, validateUuidParam('id'), validateQueryPeriod], getOrdersStats);
router.get('/restaurant/:id/popular-dishes', [validateJWT, requireSuperAdmin, validateUuidParam('id'), validateQueryLimit], getPopularDishes);
router.get('/platform/summary', [validateJWT, requireSuperAdmin], getPlatformSummary);

export default router;
