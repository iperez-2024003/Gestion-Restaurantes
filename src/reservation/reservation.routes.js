'use strict';

import { Router } from 'express';
import {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservation,
  cancelReservation,
  confirmReservation,
  checkAvailability,
  getTodayReservations,
} from './reservation.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import {
  validateReservationCreation,
  validateReservationUpdate,
} from './reservation.validation.js';

const router = Router();

/**
 * Public routes
 */
// Check availability
router.get('/check-availability', checkAvailability);

/**
 * Protected routes (require authentication)
 */
// Create reservation
router.post('/', [validateJWT, validateReservationCreation], createReservation);

// Get all reservations
router.get('/', validateJWT, getAllReservations);

// Get today's reservations
router.get('/today', validateJWT, getTodayReservations);

// Get reservation by ID
router.get('/:id', validateJWT, getReservationById);

// Update reservation
router.put('/:id', [validateJWT, validateReservationUpdate], updateReservation);

// Cancel reservation
router.delete('/:id', validateJWT, cancelReservation);

// Confirm reservation
router.patch('/:id/confirm', validateJWT, confirmReservation);

export default router;