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
  getServerIp,
} from './restaurant.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
<<<<<<< Updated upstream
=======
import { requireSuperAdmin, requireRole } from '../../middlewares/require-role.js';
import { validateUuidParam, validateUserIdParam } from '../../middlewares/validate-params.js';
>>>>>>> Stashed changes
import { validateRestaurantCreation, validateRestaurantUpdate } from './restaurant.validation.js';
import { upload } from '../../helpers/file-upload.js';

const router = Router();

// Permite acceso a Super Admin O Restaurant Admin
const requireAdminOrRestaurantAdmin = requireRole('SUPER_ADMIN_ROLE', 'RESTAURANT_ADMIN_ROLE', 'STAFF_ROLE');

/**
 * Middleware para parsear campos de FormData que llegan como strings
 * Esto asegura que los validadores de express-validator reciban los tipos correctos.
 */
const parseRestaurantFormData = (req, res, next) => {
  if (req.body.operating_days && typeof req.body.operating_days === 'string') {
    try { req.body.operating_days = JSON.parse(req.body.operating_days); } catch (e) { req.body.operating_days = req.body.operating_days.split(','); }
  }

  // Convertir strings 'true'/'false' a booleanos reales para el validador
  ['accepts_reservations', 'accepts_takeout', 'accepts_delivery', 'parking_available',
    'wifi_available', 'outdoor_seating', 'pet_friendly', 'wheelchair_accessible'].forEach(field => {
      if (req.body[field] !== undefined) {
        req.body[field] = req.body[field] === 'true' || req.body[field] === true;
      }
    });

  if (req.body.payment_methods && typeof req.body.payment_methods === 'string') {
    try { req.body.payment_methods = JSON.parse(req.body.payment_methods); } catch (e) { req.body.payment_methods = req.body.payment_methods.split(','); }
  }

  if (req.body.special_features && typeof req.body.special_features === 'string') {
    try { req.body.special_features = JSON.parse(req.body.special_features); } catch (e) { req.body.special_features = req.body.special_features.split(','); }
  }

  next();
};

/**
 * Rutas públicas
 */
// Get all restaurants with filters
router.get('/', getAllRestaurants);

// Get single restaurant by ID
router.get('/:id', getRestaurantById);

/**
<<<<<<< Updated upstream
 * Protected routes (require authentication)
 */
// Create new restaurant
router.post('/', [validateJWT, validateRestaurantCreation], createRestaurant);
=======
 * Rutas solo SUPER_ADMIN (gestión de restaurantes, verificación, estadísticas globales)
 */
router.post('/', [validateJWT, requireSuperAdmin, upload.single('logo'), parseRestaurantFormData, validateRestaurantCreation], createRestaurant);
router.put('/:id', [validateJWT, requireSuperAdmin, validateUuidParam('id'), upload.single('logo'), parseRestaurantFormData, validateRestaurantUpdate], updateRestaurant);
router.delete('/:id', [validateJWT, requireSuperAdmin, validateUuidParam('id')], deleteRestaurant);
router.get('/admin/:adminId', [validateJWT, requireSuperAdmin, validateUserIdParam('adminId')], getRestaurantsByAdmin);
router.patch('/:id/verify', [validateJWT, requireSuperAdmin, validateUuidParam('id')], verifyRestaurant);
router.get('/:id/stats', [validateJWT, requireAdminOrRestaurantAdmin, validateUuidParam('id')], getRestaurantStats);
router.get('/utils/server-ip', getServerIp);

// Staff management — Solo Restaurant Admin o Super Admin
import { createStaff, getRestaurantStaff, updateStaffRole } from './staff.controller.js';
router.post('/:id/staff', [validateJWT, requireAdminOrRestaurantAdmin, validateUuidParam('id')], createStaff);
router.get('/:id/staff', [validateJWT, requireAdminOrRestaurantAdmin, validateUuidParam('id')], getRestaurantStaff);
router.patch('/:id/staff/:staff_id/role', [validateJWT, requireAdminOrRestaurantAdmin, validateUuidParam('id')], updateStaffRole);
>>>>>>> Stashed changes

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