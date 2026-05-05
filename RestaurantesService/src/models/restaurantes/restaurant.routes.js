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
import { requireAdmin } from '../../middlewares/require-role.js';
import { validateUuidParam, validateUserIdParam } from '../../middlewares/validate-params.js';
import { validateRestaurantCreation, validateRestaurantUpdate } from './restaurant.validation.js';

const router = Router();

/**
 * Public routes
 */
router.get('/', getAllRestaurants);
router.get('/:id', validateUuidParam('id'), getRestaurantById);

/**
 * Rutas solo ADMIN_ROLE (gestión de restaurantes, verificación, estadísticas)
 */
router.post('/', [validateJWT, requireAdmin, validateRestaurantCreation], createRestaurant);
router.put('/:id', [validateJWT, requireAdmin, validateUuidParam('id'), validateRestaurantUpdate], updateRestaurant);
router.delete('/:id', [validateJWT, requireAdmin, validateUuidParam('id')], deleteRestaurant);
router.get('/admin/:adminId', [validateJWT, requireAdmin, validateUserIdParam('adminId')], getRestaurantsByAdmin);
router.patch('/:id/verify', [validateJWT, requireAdmin, validateUuidParam('id')], verifyRestaurant);
router.get('/:id/stats', [validateJWT, requireAdmin, validateUuidParam('id')], getRestaurantStats);

export default router;