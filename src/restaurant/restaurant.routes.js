'use strict';

import { Router } from 'express';
import {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantsByAdmin,
  verifyRestaurant,
  getRestaurantStats,
} from './restaurant.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireSuperAdmin } from '../../middlewares/require-role.js';
import { validateUuidParam, validateUserIdParam } from '../../middlewares/validate-params.js';
import { validateRestaurantCreation, validateRestaurantUpdate } from './restaurant.validation.js';

const router = Router();

/**
 * Public routes
 */
router.get('/', getAllRestaurants);
router.get('/:id', validateUuidParam('id'), getRestaurantById);

/**
 * Rutas solo ADMIN_ROLE (gestiÃ³n de restaurantes, verificaciÃ³n, estadÃ­sticas)
 */
router.post('/', [validateJWT, requireSuperAdmin, validateRestaurantCreation], createRestaurant);
router.put('/:id', [validateJWT, requireSuperAdmin, validateUuidParam('id'), validateRestaurantUpdate], updateRestaurant);
router.delete('/:id', [validateJWT, requireSuperAdmin, validateUuidParam('id')], deleteRestaurant);
router.get('/admin/:adminId', [validateJWT, requireSuperAdmin, validateUserIdParam('adminId')], getRestaurantsByAdmin);
router.patch('/:id/verify', [validateJWT, requireSuperAdmin, validateUuidParam('id')], verifyRestaurant);
router.get('/:id/stats', [validateJWT, requireSuperAdmin, validateUuidParam('id')], getRestaurantStats);

export default router;
