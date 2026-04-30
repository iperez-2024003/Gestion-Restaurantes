'use strict';

import { Router } from 'express';
import {
  getRestaurantOverview,
  getOrdersStats,
  getPopularDishes,
  getPlatformSummary,
<<<<<<< Updated upstream
} from './statistics.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';

const router = Router();

router.get('/restaurant/:id/overview', validateJWT, getRestaurantOverview);
router.get('/restaurant/:id/orders', validateJWT, getOrdersStats);
router.get('/restaurant/:id/popular-dishes', validateJWT, getPopularDishes);
router.get('/platform/summary', validateJWT, getPlatformSummary);

export default router;
=======
  getPeakHours,
  getFrequentCustomers,
  exportOrdersToExcel,
  getGlobalStats,
  getGlobalVipClients
} from './statistics.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireSuperAdmin, requireRole } from '../../middlewares/require-role.js';
import { validateUuidParam, validateQueryPeriod, validateQueryLimit } from '../../middlewares/validate-params.js';

const router = Router();

const requireAdminOrRestaurantAdmin = requireRole('SUPER_ADMIN_ROLE', 'RESTAURANT_ADMIN_ROLE');

router.get('/restaurant/:id/overview', [validateJWT, requireAdminOrRestaurantAdmin, validateUuidParam('id')], getRestaurantOverview);
router.get('/restaurant/:id/orders', [validateJWT, requireAdminOrRestaurantAdmin, validateUuidParam('id'), validateQueryPeriod], getOrdersStats);
router.get('/restaurant/:id/popular-dishes', [validateJWT, requireAdminOrRestaurantAdmin, validateUuidParam('id'), validateQueryLimit], getPopularDishes);
router.get('/restaurant/:id/peak-hours', [validateJWT, requireAdminOrRestaurantAdmin, validateUuidParam('id')], getPeakHours);
router.get('/restaurant/:id/frequent-customers', [validateJWT, requireAdminOrRestaurantAdmin, validateUuidParam('id')], getFrequentCustomers);
router.get('/restaurant/:id/export-excel', [validateJWT, requireAdminOrRestaurantAdmin, validateUuidParam('id')], exportOrdersToExcel);
router.get('/platform/summary', [validateJWT, requireSuperAdmin], getPlatformSummary);

router.get('/global/overview', [validateJWT, requireSuperAdmin], getGlobalStats);
router.get('/global/vip-clients', [validateJWT, requireSuperAdmin], getGlobalVipClients);

export default router;
>>>>>>> Stashed changes
