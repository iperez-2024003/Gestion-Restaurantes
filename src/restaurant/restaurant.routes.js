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
 * Protected routes (require authentication)
 */
// Create new restaurant
router.post('/', [validateJWT, validateRestaurantCreation], createRestaurant);

// Update restaurant
router.put('/:id', [validateJWT, validateRestaurantUpdate], updateRestaurant);

// Soft delete restaurant
router.delete('/:id', validateJWT, deleteRestaurant);

// Get restaurants by admin
router.get('/admin/:adminId', validateJWT, getRestaurantsByAdmin);

// Verify restaurant (Platform admin only)
router.patch('/:id/verify', validateJWT, verifyRestaurant);

// Get restaurant statistics
router.get('/:id/stats', validateJWT, getRestaurantStats);

export default router;