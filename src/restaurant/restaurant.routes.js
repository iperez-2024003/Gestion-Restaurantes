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
import { validateRestaurantCreation, validateRestaurantUpdate } from './restaurant.validation.js';

const router = Router();

/**
 * Public routes
 */
// Get all restaurants with filters
router.get('/', getAllRestaurants);

// Get single restaurant by ID
router.get('/:id', getRestaurantById);

/**
 * Rutas solo ADMIN_ROLE (gestión de restaurantes, verificación, estadísticas)
 */
// Create new restaurant
router.post('/', [validateJWT, requireAdmin, validateRestaurantCreation], createRestaurant);

// Update restaurant
router.put('/:id', [validateJWT, requireAdmin, validateRestaurantUpdate], updateRestaurant);

// Soft delete restaurant
router.delete('/:id', [validateJWT, requireAdmin], deleteRestaurant);

// Get restaurants by admin
router.get('/admin/:adminId', [validateJWT, requireAdmin], getRestaurantsByAdmin);

// Verify restaurant (solo ADMIN_ROLE)
router.patch('/:id/verify', [validateJWT, requireAdmin], verifyRestaurant);

// Get restaurant statistics
router.get('/:id/stats', [validateJWT, requireAdmin], getRestaurantStats);

export default router;