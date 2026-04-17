'use strict';

import { Router } from 'express';
import {
  getRestaurantOverview,
  getOrdersStats,
  getPopularDishes,
  getPlatformSummary,
  getPeakHours,
  getFrequentCustomers
} from './statistics.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireSuperAdmin } from '../../middlewares/require-role.js';
import { validateUuidParam, validateQueryPeriod, validateQueryLimit } from '../../middlewares/validate-params.js';

const router = Router();

router.get('/restaurant/:id/overview', [validateJWT, requireSuperAdmin, validateUuidParam('id')], getRestaurantOverview);
router.get('/restaurant/:id/orders', [validateJWT, requireSuperAdmin, validateUuidParam('id'), validateQueryPeriod], getOrdersStats);
router.get('/restaurant/:id/popular-dishes', [validateJWT, requireSuperAdmin, validateUuidParam('id'), validateQueryLimit], getPopularDishes);
router.get('/restaurant/:id/peak-hours', [validateJWT, requireSuperAdmin, validateUuidParam('id')], getPeakHours);
router.get('/restaurant/:id/frequent-customers', [validateJWT, requireSuperAdmin, validateUuidParam('id')], getFrequentCustomers);
router.get('/platform/summary', [validateJWT, requireSuperAdmin], getPlatformSummary);

export default router;
